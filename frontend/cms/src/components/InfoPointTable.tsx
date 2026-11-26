import { Fragment, useCallback, useEffect, useState } from "react";
import pencilIcon from "../assets/pencil.svg";
import InfoPointEditor, { type ImageAttachment, type InfoPoint } from "./InfoPointEditor";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function timeForEditor(value: string): string {
  const parts = value.split(":");
  if (parts.length !== 3 || parts.some((part) => !/^\d+$/.test(part))) {
    return value;
  }

  const totalMinutes = Number(parts[0]) * 60 + Number(parts[1]);
  return `${totalMinutes}:${parts[2].padStart(2, "0")}`;
}

function fromApi(value: unknown): InfoPoint | null {
  if (!isObject(value)) {
    return null;
  }

  const id = Number(value.id);
  if (!Number.isInteger(id) || id < 1) {
    return null;
  }

  const images = Array.isArray(value.images)
    ? value.images.flatMap((image, index): ImageAttachment[] => {
        if (!isObject(image)) {
          return [];
        }

        const path = typeof image.image_path === "string" ? image.image_path : null;
        if (!path) {
          return [];
        }

        return [{ id: Number(image.id) || index + 1, path, file: null, previewUrl: null }];
      })
    : [];

  return {
    id,
    title: typeof value.title === "string" ? value.title : "",
    time: typeof value.time === "string" ? timeForEditor(value.time) : "",
    description: typeof value.description === "string" ? value.description : "",
    active: value.active === true || value.active === 1 || value.active === "1",
    images: images.length > 0 ? images : [{ id: 1, path: null, file: null, previewUrl: null }],
    narratorPath: typeof value.voice_path === "string" ? value.voice_path : null,
    narratorAudio: null,
    ambientPath: typeof value.ambient_path === "string" ? value.ambient_path : null,
    ambientAudio: null,
  };
}

function responseError(payload: unknown, fallback: string): string {
  return isObject(payload) && typeof payload.error === "string"
    ? payload.error
    : fallback;
}

function releaseImagePreviews(infoPoint: InfoPoint): void {
  for (const previewUrl of new Set(
    infoPoint.images.flatMap((image) => image.previewUrl ? [image.previewUrl] : []),
  )) {
    URL.revokeObjectURL(previewUrl);
  }
}

function createDraft(): InfoPoint {
  return {
    id: 0,
    title: "",
    time: "",
    description: "",
    active: true,
    images: [{ id: 1, path: null, file: null, previewUrl: null }],
    narratorPath: null,
    narratorAudio: null,
    ambientPath: null,
    ambientAudio: null,
  };
}

export default function InfoPointTable({ token }: { token: string }) {
  const [infoPoints, setInfoPoints] = useState<InfoPoint[]>([]);
  const [draft, setDraft] = useState<InfoPoint | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInfoPoints = useCallback(async () => {
    const response = await fetch("/info-points", { cache: "no-store" });
    const payload: unknown = await response.json();

    if (!response.ok) {
      throw new Error(responseError(payload, "De informatiepunten konden niet worden geladen."));
    }

    if (!isObject(payload) || !Array.isArray(payload.data)) {
      throw new Error("De server stuurde een ongeldig antwoord.");
    }

    const loadedInfoPoints = payload.data.map(fromApi);
    if (loadedInfoPoints.some((infoPoint) => infoPoint === null)) {
      throw new Error("De server stuurde ongeldige informatiepuntgegevens.");
    }

    setInfoPoints(loadedInfoPoints.filter((infoPoint): infoPoint is InfoPoint => infoPoint !== null));
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        await loadInfoPoints();
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "De informatiepunten konden niet worden geladen.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [loadInfoPoints]);

  function updateInfoPoint(updatedInfoPoint: InfoPoint) {
    if (updatedInfoPoint.id === 0) {
      setDraft(updatedInfoPoint);
      return;
    }

    setInfoPoints((currentInfoPoints) =>
      currentInfoPoints.map((infoPoint) =>
        infoPoint.id === updatedInfoPoint.id ? updatedInfoPoint : infoPoint,
      ),
    );
  }

  function startCreating() {
    setError(null);
    setDraft(createDraft());
    setExpandedId(0);
  }

  async function saveInfoPoint(updatedInfoPoint: InfoPoint) {
    setIsSaving(true);
    setError(null);

    try {
      if (!token) {
        throw new Error("Je sessie ontbreekt. Log opnieuw in.");
      }

      const formData = new FormData();
      formData.append("title", updatedInfoPoint.title);
      formData.append("time", updatedInfoPoint.time);
      formData.append("description", updatedInfoPoint.description);
      formData.append("active", updatedInfoPoint.active ? "1" : "0");
      formData.append("images_present", "1");

      for (const image of updatedInfoPoint.images) {
        if (image.path) {
          formData.append("images[]", image.path);
        }
        if (image.file) {
          formData.append("image_files[]", image.file, image.file.name);
        }
      }

      formData.append("voice_path", updatedInfoPoint.narratorPath ?? "");
      formData.append("ambient_path", updatedInfoPoint.ambientPath ?? "");
      if (updatedInfoPoint.narratorAudio) {
        formData.append("voice_file", updatedInfoPoint.narratorAudio, updatedInfoPoint.narratorAudio.name);
      }
      if (updatedInfoPoint.ambientAudio) {
        formData.append("ambient_file", updatedInfoPoint.ambientAudio, updatedInfoPoint.ambientAudio.name);
      }

      const isDraft = updatedInfoPoint.id === 0;
      const response = await fetch(
        isDraft ? "/info-points" : `/info-points/${updatedInfoPoint.id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      const payload: unknown = await response.json();

      if (!response.ok) {
        throw new Error(responseError(payload, "Het informatiepunt kon niet worden opgeslagen."));
      }

      setDraft(null);
      setExpandedId(null);
      try {
        await loadInfoPoints();
        releaseImagePreviews(updatedInfoPoint);
      } catch {
        setError("Opgeslagen, maar de lijst kon niet opnieuw worden geladen.");
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Het informatiepunt kon niet worden opgeslagen.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteInfoPoint(id: number) {
    if (id === 0) {
      if (draft) {
        releaseImagePreviews(draft);
      }
      setDraft(null);
      setExpandedId(null);
      return;
    }

    setError(null);
    try {
      if (!token) {
        throw new Error("Je sessie ontbreekt. Log opnieuw in.");
      }

      const response = await fetch(`/info-points/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        throw new Error(responseError(payload, "Het informatiepunt kon niet worden verwijderd."));
      }

      const deletedInfoPoint = infoPoints.find((infoPoint) => infoPoint.id === id);
      if (deletedInfoPoint) {
        releaseImagePreviews(deletedInfoPoint);
      }
      setInfoPoints((currentInfoPoints) => currentInfoPoints.filter((infoPoint) => infoPoint.id !== id));
      setExpandedId(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Het informatiepunt kon niet worden verwijderd.");
    }
  }

  const rows = draft ? [draft, ...infoPoints] : infoPoints;

  return (
    <section className="mx-auto max-w-5xl overflow-hidden rounded-md border border-[#008899]/30 bg-white">
      <div className="flex items-center justify-between gap-4 border-b border-[#008899]/20 px-4 py-3">
        <h2 className="font-semibold text-slate-800">Informatiepunten</h2>
        <button
          type="button"
          onClick={startCreating}
          disabled={draft !== null}
          className="cursor-pointer rounded-md bg-[#008899] px-4 py-2 text-sm font-semibold text-white hover:bg-[#006d7a] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Nieuw informatiepunt
        </button>
      </div>

      {error && expandedId === null && (
        <p role="alert" className="px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] border-collapse text-sm">
          <thead className="bg-[#008899] text-white">
            <tr>
              <th scope="col" className="w-20 px-4 py-3 text-center font-semibold">ID</th>
              <th scope="col" className="px-4 py-3 text-left font-semibold">Titel</th>
              <th scope="col" className="w-36 px-4 py-3 text-center font-semibold">Tijdstip</th>
              <th scope="col" className="w-16 px-3 py-3" aria-label="Bewerken" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-600">Laden...</td></tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-600">Geen informatiepunten gevonden.</td></tr>
            )}
            {!isLoading && rows.map((infoPoint, index) => {
              const isExpanded = expandedId === infoPoint.id;
              const editorId = `info-point-editor-${infoPoint.id}`;

              return (
                <Fragment key={infoPoint.id || "draft"}>
                  <tr className={`border-b border-[#008899]/30 ${index % 2 === 0 ? "bg-white" : "bg-[#eee9e9]"}`}>
                    <td className="px-4 py-2 text-center text-slate-800">{infoPoint.id || "Nieuw"}</td>
                    <td className="px-4 py-2 text-slate-800">{infoPoint.title || "—"}</td>
                    <td className="px-4 py-2 text-center text-slate-800">{infoPoint.time || "—"}</td>
                    <td className="px-3 py-1 text-center">
                      <button
                        type="button"
                        aria-label={`${isExpanded ? "Sluit" : "Bewerk"} informatiepunt ${infoPoint.id || "nieuw"}`}
                        aria-expanded={isExpanded}
                        aria-controls={editorId}
                        onClick={() => setExpandedId(isExpanded ? null : infoPoint.id)}
                        className="inline-flex cursor-pointer rounded p-1 text-slate-700 hover:bg-[#f2e8d2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#008899]"
                      >
                        <img src={pencilIcon} alt="" className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-b border-[#008899]/30">
                      <td id={editorId} colSpan={4} className="p-0">
                        <InfoPointEditor
                          infoPoint={infoPoint}
                          isSaving={isSaving}
                          error={error}
                          onUpdate={updateInfoPoint}
                          onSave={(updatedInfoPoint) => void saveInfoPoint(updatedInfoPoint)}
                          onDelete={() => void deleteInfoPoint(infoPoint.id)}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
