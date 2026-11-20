import Playicon from "../assets/icons/play-solid.svg";
import Pauseicon from "../assets/icons/pause-solid.svg";

export type PlaybackStatus = "play" | "pause";

interface PlayPauseBtnProps {
    status: PlaybackStatus,
    onToggle: () => void,
}

export default function PlayPauseBtn({status, onToggle}: PlayPauseBtnProps) {
    const isPlaying = status === "play";
    const icon = isPlaying ? Pauseicon : Playicon;
    const iconPosition = isPlaying ? "translate-x-px -translate-y-px" : "-translate-y-px";

    return (
        <button 
            className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl border-3 border-btn-border"
            onClick={onToggle}
            type="button"
        >
        <img className={iconPosition} src={icon} alt="" aria-hidden="true" />
        </button>
    );
}