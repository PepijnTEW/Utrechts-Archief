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


  const handleButtonPress = (btnType: BtnType) => {
    const video = videoRef.current;
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
        void video.play();
        setStatus("play");
      } else {
        video.pause();
        setStatus("pause");
      }
    }, 300);
  }

  return (
    <div className="h-svh w-full flex overflow-hidden bg-[#020501]">
      <div className="flex-1">
      </div>
      <div className="relative h-full inline-block overflow-hidden">
        <video ref={videoRef} className="block h-full" loop autoPlay playsInline>
          <source src={GrachtVideo} type="video/mp4"/>
        </video>
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-center p-4">
          <div className="flex items-center gap-4">
            <TimelineBtn direction="back" onClick={() => handleButtonPress("back")}/>
            <PlayPauseBtn status={status} onToggle={() => handleButtonPress("play")}/>
            <TimelineBtn direction="forward" onClick={() => handleButtonPress("forward")}/>
          </div>
        </div>
      </div>
      <ProgressBar/>
    </div>
  );
}
