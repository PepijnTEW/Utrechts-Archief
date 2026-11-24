import { useState, useRef, useEffect } from "react";
import PlayPauseBtn, { type PlaybackStatus } from "./components/PlayPauseBtn";
import TimelineBtn from "./components/TimelineBtn";
import ProgressBar from "./components/ProgressBar";
import Logo from "./components/Logo";
import GrachtVideo from "./assets/gracht.mp4"

type BtnType = "back" | "play" | "forward";

interface InfoPointData {
  time: number;
  label: string;
}

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
      typeof point.label === "string",
  );
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<PlaybackStatus>("play");
  const [percentage, setPercentage] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [infoPoints, setInfoPoints] = useState<InfoPointData[]>([]);
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
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

      if (btnType === "forward"){
        video.currentTime = Math.min(video.duration || Infinity, video.currentTime + 10);
        getPercentage(video);
      } else if (btnType === "back"){
        video.currentTime = Math.max(0, video.currentTime - 10);
        getPercentage(video);
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

  const seekToInfoPoint = (time: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || time > video.duration) return;

    video.currentTime = time;
    getPercentage(video);
  };

  return (
    <div className="grid h-svh w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] overflow-hidden bg-[#020501]">
      <div className="flex items-start justify-start p-4 sm:p-8">
        <Logo/>
      </div>
      <div className="relative h-full inline-block overflow-hidden">
        <video
          ref={videoRef}
          className="block h-full"
          loop
          autoPlay
          muted
          playsInline
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onTimeUpdate={(event) => getPercentage(event.currentTarget)}
          onPlay={() => setStatus("play")}
          onPause={() => setStatus("pause")}
        >
          <source src={GrachtVideo} type="video/mp4"/>
        </video>
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-center p-4">
          <div className="flex items-center gap-2 rounded-4xl bg-black/20 p-2 shadow-2xl backdrop-blur-md">
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
        onInfoPointSelect={seekToInfoPoint}
      />
      {infoPointsError && (
        <p className="absolute bottom-2 right-2 text-sm text-red-300" role="alert">
          {infoPointsError}
        </p>
      )}
    </div>
  );
}
