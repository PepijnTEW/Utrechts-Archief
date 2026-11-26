import { useEffect, useState, type ChangeEvent } from "react";

export type ImageAttachment = {
  id: number;
  path: string | null;
  file: File | null;
  previewUrl: string | null;
};

export type InfoPoint = {
  id: number;
  title: string;
  time: string;
  description: string;
  active: boolean;
  images: ImageAttachment[];
  narratorPath: string | null;
  narratorAudio: File | null;
  ambientPath: string | null;
  ambientAudio: File | null;
};

type InfoPointEditorProps = {
  infoPoint: InfoPoint;
  isSaving: boolean;
  error: string | null;
  onUpdate: (updatedInfoPoint: InfoPoint) => void;
  onSave: (updatedInfoPoint: InfoPoint) => void;
  onDelete: () => void;
};

type AudioInputProps = {
  id: string;
  label: string;
  file: File | null;
  path: string | null;
  onChange: (file: File | null) => void;
};

function ImagePreview({ image }: { image: ImageAttachment }) {
  const src = image.previewUrl ?? image.path;

  if (!src) {
    return null;
  }

  return (
    <img
      src={src}
      alt="Voorbeeld van de afbeelding"
      className="h-24 w-32 rounded border border-slate-200 object-cover"
    />
  );
}

function AudioInput({ id, label, file, path, onChange }: AudioInputProps) {
  const [previewUrl, setPreviewUrl] = useState(() =>
    file ? URL.createObjectURL(file) : null,
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const audioUrl = previewUrl ?? path;

  return (
    <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="file"
        accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/aac,audio/flac,.mp3,.wav,.ogg,.m4a,.aac,.flac"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const nextFile = event.target.files?.[0] ?? null;
          setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : null);
          onChange(nextFile);
        }}
        className="block w-full rounded-md border border-slate-300 bg-white text-sm file:mr-3 file:border-0 file:bg-[#f2e8d2] file:px-3 file:py-2 file:font-medium file:text-[#008899]"
      />
      {audioUrl && <audio controls preload="metadata" src={audioUrl} className="w-full" />}
    </div>
  );
}

function toApiTime(value: string): string | null {
  const duration = value.trim();
  const hoursMinutesSeconds = duration.match(/^(\d{1,3}):([0-5]\d):([0-5]\d)$/);

  if (hoursMinutesSeconds) {
    const hours = Number(hoursMinutesSeconds[1]);
    return hours <= 838
      ? `${String(hours).padStart(2, "0")}:${hoursMinutesSeconds[2]}:${hoursMinutesSeconds[3]}`
      : null;
  }

  const minutesSeconds = duration.match(/^(\d{1,5}):([0-5]\d)$/);
  if (!minutesSeconds) {
    return null;
  }

  const totalMinutes = Number(minutesSeconds[1]);
  const hours = Math.floor(totalMinutes / 60);
  if (hours > 838 || (hours === 838 && totalMinutes % 60 > 59)) {
    return null;
  }

  return `${String(hours).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}:${minutesSeconds[2]}`;
}

function hasAllowedFile(file: File, types: string[], extensions: string[]): boolean {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return types.includes(file.type) || extensions.includes(extension);
}

function validateInfoPoint(infoPoint: InfoPoint): string | null {
  if (!infoPoint.title.trim()) {
    return "Titel is verplicht.";
  }

  if ([...infoPoint.title.trim()].length > 255) {
    return "Titel mag maximaal 255 tekens bevatten.";
  }

  if (!toApiTime(infoPoint.time)) {
    return "Vul een geldig tijdstip in als mm:ss of uu:mm:ss.";
  }

  if ([...infoPoint.description].length > 255) {
    return "Informatie mag maximaal 255 tekens bevatten.";
  }

  const uploadedFiles = [
    ...infoPoint.images.flatMap((image) => image.file ? [image.file] : []),
    ...[infoPoint.narratorAudio, infoPoint.ambientAudio].filter((file): file is File => file !== null),
  ];
  if (uploadedFiles.length > 20) {
    return "Er kunnen maximaal 20 bestanden tegelijk worden geüpload.";
  }
  if (uploadedFiles.reduce((total, file) => total + file.size, 0) > 95 * 1024 * 1024) {
    return "De totale upload mag maximaal 95 MB groot zijn.";
  }

  for (const image of infoPoint.images) {
    if (!image.file) {
      continue;
    }
    if (!hasAllowedFile(image.file, ["image/jpeg", "image/png", "image/webp"], ["jpg", "jpeg", "png", "webp"])) {
      return "Gebruik voor afbeeldingen een JPG-, PNG- of WebP-bestand.";
    }
    if (image.file.size > 5 * 1024 * 1024) {
      return "Afbeeldingen mogen maximaal 5 MB groot zijn.";
    }
  }

  for (const audio of [infoPoint.narratorAudio, infoPoint.ambientAudio]) {
    if (!audio) {
      continue;
    }
    if (!hasAllowedFile(
      audio,
      ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/vnd.wave", "audio/ogg", "audio/mp4", "audio/x-m4a", "audio/aac", "audio/flac", "audio/x-flac"],
      ["mp3", "wav", "ogg", "m4a", "aac", "flac"],
    )) {
      return "Gebruik voor audio een MP3-, WAV-, OGG-, M4A-, AAC- of FLAC-bestand.";
    }
    if (audio.size > 20 * 1024 * 1024) {
      return "Audiobestanden mogen maximaal 20 MB groot zijn.";
    }
  }

  return null;
}

export default function InfoPointEditor({
  infoPoint,
  isSaving,
  error,
  onUpdate,
  onSave,
  onDelete,
}: InfoPointEditorProps) {
  const [validationError, setValidationError] = useState<string | null>(null);

  function update(updatedInfoPoint: InfoPoint) {
    setValidationError(null);
    onUpdate(updatedInfoPoint);
  }

  function updateImage(imageId: number, file: File | null) {
    const currentImage = infoPoint.images.find((image) => image.id === imageId);
    if (!currentImage || !file) {
      return;
    }

    if (currentImage.previewUrl) {
      URL.revokeObjectURL(currentImage.previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    update({
      ...infoPoint,
      images: infoPoint.images.map((image) =>
        image.id === imageId
          ? { ...image, file, path: null, previewUrl }
          : image,
      ),
    });
  }

  function addImage() {
    const nextId = Math.max(0, ...infoPoint.images.map((image) => image.id)) + 1;
    update({
      ...infoPoint,
      images: [...infoPoint.images, { id: nextId, path: null, file: null, previewUrl: null }],
    });
  }

  function removeImage(imageId: number) {
    const removedImage = infoPoint.images.find((image) => image.id === imageId);
    if (removedImage?.previewUrl) {
      URL.revokeObjectURL(removedImage.previewUrl);
    }

    update({
      ...infoPoint,
      images: infoPoint.images.filter((image) => image.id !== imageId),
    });
  }

  function save() {
    const validationError = validateInfoPoint(infoPoint);
    if (validationError) {
      setValidationError(validationError);
      return;
    }
    const time = toApiTime(infoPoint.time);
    if (time === null) {
      setValidationError("Vul een geldig tijdstip in als mm:ss of uu:mm:ss.");
      return;
    }
    onSave({ ...infoPoint, title: infoPoint.title.trim(), time });
  }

  return (
    <div className="space-y-7 bg-white p-5 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
          <span className="w-20 shrink-0">Titel:</span>
          <input
            type="text"
            required
            maxLength={255}
            value={infoPoint.title}
            onChange={(event) => update({ ...infoPoint, title: event.target.value })}
            className="min-w-0 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-[#008899] focus:outline-none focus:ring-2 focus:ring-[#008899]/20"
          />
        </label>
        <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
          <span className="w-20 shrink-0">Tijdstip:</span>
          <input
            type="text"
            required
            placeholder="mm:ss"
            value={infoPoint.time}
            onChange={(event) => update({ ...infoPoint, time: event.target.value })}
            className="min-w-0 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-[#008899] focus:outline-none focus:ring-2 focus:ring-[#008899]/20"
          />
        </label>
      </div>

      <label className="grid gap-3 text-sm font-medium text-slate-700 sm:grid-cols-[5rem_minmax(0,1fr)] sm:items-center">
        <span>Informatie:</span>
        <textarea
          rows={4}
          maxLength={255}
          value={infoPoint.description}
          onChange={(event) => update({ ...infoPoint, description: event.target.value })}
          placeholder="Voer hier de informatie in."
          className="w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-[#008899] focus:outline-none focus:ring-2 focus:ring-[#008899]/20"
        />
      </label>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Afbeeldingen</h3>
        {infoPoint.images.map((image, index) => (
          <div key={image.id} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              aria-label={`Afbeelding ${index + 1}`}
              onChange={(event) => updateImage(image.id, event.target.files?.[0] ?? null)}
              className="block w-full min-w-0 rounded-md border border-slate-300 bg-white text-sm file:mr-3 file:border-0 file:bg-[#f2e8d2] file:px-3 file:py-2 file:font-medium file:text-[#008899]"
            />
            <ImagePreview image={image} />
            <button
              type="button"
              onClick={() => removeImage(image.id)}
              className="shrink-0 cursor-pointer text-sm text-red-700 underline-offset-4 hover:underline"
            >
              Verwijder
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addImage}
          className="cursor-pointer text-sm font-semibold text-[#008899] underline-offset-4 hover:underline"
        >
          + Afbeelding toevoegen
        </button>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <AudioInput
          id={`narrator-${infoPoint.id}`}
          label="Verteller"
          file={infoPoint.narratorAudio}
          path={infoPoint.narratorPath}
          onChange={(file) => update({ ...infoPoint, narratorAudio: file })}
        />
        <AudioInput
          id={`ambient-${infoPoint.id}`}
          label="Achtergrondgeluid"
          file={infoPoint.ambientAudio}
          path={infoPoint.ambientPath}
          onChange={(file) => update({ ...infoPoint, ambientAudio: file })}
        />
      </div>

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {validationError && <p role="alert" className="text-sm text-red-700">{validationError}</p>}

      <div className="flex items-center justify-between border-t border-slate-200 pt-5">
        <button
          type="button"
          disabled={isSaving}
          onClick={onDelete}
          className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Verwijder
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={save}
          className="cursor-pointer rounded-md bg-[#008899] px-4 py-2 text-sm font-semibold text-white hover:bg-[#006d7a] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Opslaan..." : "Opslaan"}
        </button>
      </div>
    </div>
  );
}
