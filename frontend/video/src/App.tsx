import { useState, useRef, useEffect } from "react";
import PlayPauseBtn, { type PlaybackStatus } from "./components/PlayPauseBtn";
import TimelineBtn from "./components/TimelineBtn";
import ProgressBar from "./components/ProgressBar";
import Logo from "./components/Logo";
import GrachtVideo from "./assets/gracht.mp4"
import PopupSound from "./assets/audio/popup.mp3";
import type { InfoPointData } from "./components/InfoPoint";

type BtnType = "back" | "play" | "forward";

function isInfoPointData(value: unknown): value is InfoPointData[] {
  return Array.isArray(value) && value.every(
    (point): point is InfoPointData =>
      typeof point === "object" &&
      point !== null &&
      "time" in point &&
      typeof point.time === "number" &&
      Number.isFinite(point.time) &&
      point.time >= 0 &&
      "label" in point &&
      typeof point.label === "string" &&
      (!("text" in point) || typeof point.text === "string") &&
      (!("image" in point) || typeof point.image === "string") &&
      (!("audio" in point) || typeof point.audio === "string"),
  );
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const popupSoundRef = useRef<HTMLAudioElement>(null);
  const previousTimeRef = useRef(0);
  const [status, setStatus] = useState<PlaybackStatus>("play");
  const [percentage, setPercentage] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [infoPoints, setInfoPoints] = useState<InfoPointData[]>([]);
  const [activeInfoPoint, setActiveInfoPoint] = useState<InfoPointData | null>(null);
  const [infoPointsError, setInfoPointsError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${import.meta.env.BASE_URL}info-points.json`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Could not load info points (${response.status}).`);
        }
        return response.json() as Promise<unknown>;
      })
      .then((data) => {
        if (!isInfoPointData(data)) {
          throw new Error("The info-points.json file has an invalid format.");
        }
        setInfoPoints(data);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setInfoPointsError(error instanceof Error ? error.message : "Could not load info points.");
      });

    return () => controller.abort();
  }, []);

  const handleButtonPress = (btnType: BtnType) => {
    const video = videoRef.current;
    if (!video) return;
    if (btnType === "forward" || btnType === "back") {
      const sortedInfoPoints = infoPoints
        .filter(({ time }) => time >= 0 && time <= video.duration)
        .toSorted((left, right) => left.time - right.time);
      const target = btnType === "forward"
        ? sortedInfoPoints.find(({ time }) => time > video.currentTime + 0.1)
        : sortedInfoPoints.toReversed().find(({ time }) => time < video.currentTime - 0.1);

      if (target) {
        selectInfoPoint(target);
      } else {
        video.currentTime = 0;
        previousTimeRef.current = 0;
        getPercentage(video);
        setActiveInfoPoint(null);
      }
    } else if (video.paused) {
      void video.play()
        .then(() => setStatus("play"))
        .catch(() => setStatus("pause"));
    } else {
      video.pause();
      setStatus("pause");
    }
  }

  const getPercentage = (currentVideo: HTMLVideoElement) => {
    if (!Number.isFinite(currentVideo.duration) || currentVideo.duration <= 0) {
      setPercentage(0);
      return;
    }

    setDuration(currentVideo.duration);
    const progress = (currentVideo.currentTime / currentVideo.duration) * 100;
    setPercentage(Math.min(100, Math.max(0, progress)));
  }

  const handleTimeUpdate = (currentVideo: HTMLVideoElement) => {
    const previousTime = previousTimeRef.current;
    const currentTime = currentVideo.currentTime;
    previousTimeRef.current = currentTime;
    getPercentage(currentVideo);

    if (currentVideo.paused || currentTime <= previousTime) return;

    const reachedInfoPoint = infoPoints
      .toSorted((left, right) => left.time - right.time)
      .find(({ time }) => time > previousTime && time <= currentTime);

    if (reachedInfoPoint) {
      const popupSound = popupSoundRef.current;
      if (popupSound) {
        popupSound.currentTime = 0;
        void popupSound.play().catch((error: unknown) => {
          console.error("Could not play info point sound.", error);
        });
      }
      selectInfoPoint(reachedInfoPoint);
    }
  };

  const selectInfoPoint = (point: InfoPointData) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || point.time > video.duration) return;

    video.currentTime = point.time;
    previousTimeRef.current = point.time;
    getPercentage(video);
    video.pause();
    setActiveInfoPoint(point);
  };

  return (
    <div className="grid h-svh w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] overflow-hidden bg-[#020501]">
      <div className="flex items-start justify-start p-4 sm:p-8">
        <Logo/>
      </div>
      <div className="relative h-full inline-block overflow-hidden">
        <audio ref={popupSoundRef} src={PopupSound} preload="auto" />
        <video
          ref={videoRef}
          className="block h-full"
          loop
          autoPlay
          muted
          playsInline
          onLoadedMetadata={(event) => {
            setDuration(event.currentTarget.duration);
            previousTimeRef.current = event.currentTarget.currentTime;
          }}
          onTimeUpdate={(event) => handleTimeUpdate(event.currentTarget)}
          onPlay={() => {
            setStatus("play");
            previousTimeRef.current = videoRef.current?.currentTime ?? 0;
            setActiveInfoPoint(null);
          }}
          onPause={() => setStatus("pause")}
        >
          <source src={GrachtVideo} type="video/mp4"/>
        </video>
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-center p-6">
          <div className="flex items-center gap-3 rounded-full bg-black/55 p-3 shadow-2xl backdrop-blur-md">
            <TimelineBtn direction="back" onClick={() => handleButtonPress("back")}/>
            <PlayPauseBtn status={status} onToggle={() => handleButtonPress("play")}/>
            <TimelineBtn direction="forward" onClick={() => handleButtonPress("forward")}/>
          </div>
        </div>
      </div>
      <ProgressBar
        procentage={percentage}
        duration={duration}
        infoPoints={infoPoints}
        activeInfoPoint={activeInfoPoint}
        onInfoPointSelect={selectInfoPoint}
        onInfoCardClose={() => setActiveInfoPoint(null)}
      />
      {infoPointsError && (
        <p className="absolute bottom-4 right-4 text-lg font-semibold text-red-800" role="alert">
          {infoPointsError}
        </p>
      )}
    </div>
  );
}
