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
            className="flex h-20 w-20 touch-manipulation items-center justify-center rounded-full bg-white/15 text-white transition duration-200 hover:bg-white/25 active:scale-90 active:bg-amber-300/70 sm:h-24 sm:w-24 motion-reduce:transition-none"
            type="button"
            onClick={onClick}
            aria-label={isBack ? "Previous info point" : "Next info point"}
        >
            <Icon className={`h-10 w-10 sm:h-12 sm:w-12 ${iconPosition}`} aria-hidden="true"/>
        </button>
    );
}
