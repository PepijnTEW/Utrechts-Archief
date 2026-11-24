import Playicon from "../assets/icons/play-solid.svg?react";
import Pauseicon from "../assets/icons/pause-solid.svg?react";

export type PlaybackStatus = "play" | "pause";

interface PlayPauseBtnProps {
    status: PlaybackStatus,
    onToggle: () => void,
}

export default function PlayPauseBtn({status, onToggle}: PlayPauseBtnProps) {
    const isPlaying = status === "play";
    const iconPosition = isPlaying ? "translate-x-px -translate-y-px" : "-translate-y-px";
    const Icon = isPlaying ? Pauseicon : Playicon;

    return (
        <button
            className="flex h-16 w-16 touch-manipulation items-center justify-center rounded-full bg-white/95 text-slate-950 shadow-[0_8px_24px_rgba(0,0,0,0.24)] ring-1 ring-black/10 backdrop-blur-sm transition duration-200 active:bg-amber-300 active:scale-95"
            onClick={onToggle}
            type="button"
            aria-label={isPlaying ? "Pause video" : "Play video"}
            aria-pressed={isPlaying}
        >
        <Icon className={`h-8 w-8 sm:h-9 sm:w-9 ${iconPosition}`} aria-hidden="true" />
        </button>
    );
}