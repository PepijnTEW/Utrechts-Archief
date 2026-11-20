import { useState, useRef } from "react";
import PlayPauseBtn, { type PlaybackStatus } from "./components/PlayPauseBtn";
import TimelineBtn from "./components/TimelineBtn";
import ProgressBar from "./components/ProgressBar";
import GrachtVideo from "./assets/gracht.mp4"

type BtnType = "back" | "play" | "forward";

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<PlaybackStatus>("play");
  const [percentage, setPercentage] = useState<number>(0);

  const video = videoRef.current;

  const handleButtonPress = (btnType: BtnType) => {
    if (!video) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      if (btnType === "forward"){
        video.currentTime = Math.min(video.duration || Infinity, video.currentTime + 10);
      } else if (btnType === "back"){
        video.currentTime = Math.max(0, video.currentTime - 10);
      } else if (video.paused) {
        void video.play().catch(() => setStatus("pause"));
      } else {
        video.pause();
      }
    }, 300);
  }

  const getPercentage = (currentVideo: HTMLVideoElement) => {
    if (!Number.isFinite(currentVideo.duration) || currentVideo.duration <= 0) {
      setPercentage(0);
      return;
    }

    const progress = (currentVideo.currentTime / currentVideo.duration) * 100;
    setPercentage(Math.min(100, Math.max(0, progress)));
  }

  return (
    <div className="h-svh w-full flex overflow-hidden bg-[#020501]">
      <div className="flex-1">
      </div>
      <div className="relative h-full inline-block overflow-hidden">
        <video
          ref={videoRef}
          className="block h-full"
          loop
          autoPlay
          muted
          playsInline
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
      <ProgressBar procentage={percentage}/>
    </div>
  );
}
