import FrwdIcon from "../assets/icons/forward-solid.svg?react";
import BackIcon from "../assets/icons/rewind-solid.svg?react";

export type Direction = "back" | "forward" ;

interface TimelineBtnProps {
    direction: Direction,
    onClick: () => void,
}

// Function to make the media forward or backwards 
export default function TimelineBtn({direction, onClick}: TimelineBtnProps) {
    const isBack = direction === "back";
    const iconPosition = isBack ? "-translate-x-px" : "translate-x-px";
    const Icon = isBack ? BackIcon : FrwdIcon;

    return (
        <button
            className="flex h-14 w-16 touch-manipulation items-center justify-center rounded-2xl border-3 border-btn-border bg-none text-white transition duration-300 active:scale-95 active:bg-amber-300/70 sm:h-16 sm:w-20"
            type="button"
            onClick={onClick}
            aria-label={isBack ? "Rewind 10 seconds" : "Forward 10 seconds"}
        >
            <Icon className={`h-8 w-8 sm:h-9 sm:w-9 ${iconPosition}`} aria-hidden="true"/>
        </button>
    );
}
