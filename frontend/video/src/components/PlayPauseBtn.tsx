import Playicon from "../assets/icons/play-solid.svg";
import Pauseicon from "../assets/icons/pause-solid.svg";

type Status = "play" | "pause";

interface PlayPauseBtn {
    status: Status,
}

export default function PlayPauseBtn({status}: PlayPauseBtn) {
    const isPlay = status === "play";
    const icon = isPlay ? Playicon : Pauseicon;
    const iconPosition = isPlay ? "translate-x-px -translate-y-px" : "-translate-y-px";

    return (
        <button className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl border-2 border-btn-border">
            <img className={iconPosition} src={icon} alt="" aria-hidden="true" />
        </button>
    );
}