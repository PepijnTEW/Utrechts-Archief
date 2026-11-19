import FrwdIcon from "../assets/icons/forward-solid.svg";
import BackIcon from "../assets/icons/rewind-solid.svg";

export type Direction = "back" | "forward" ;

interface TimelineBtnProps {
    direction: Direction,
    onClick: () => void,
}

// Function to make the media forward or backwards 
export default function TimelineBtn({direction, onClick}: TimelineBtnProps) {
    const isBack = direction === "back";
    const icon = isBack ? BackIcon : FrwdIcon;
    const iconPosition = isBack ? "-translate-x-px" : "translate-x-px";

    return (
        <button 
            className="flex h-12 w-20 items-center justify-center rounded-xl bg-white shadow-xl border-2 border-btn-border"
            type="button"
            onClick={onClick}
        >
        <img className={` ${iconPosition}`} src={icon} alt="" aria-hidden="true"/>
        </button>
    );
}
