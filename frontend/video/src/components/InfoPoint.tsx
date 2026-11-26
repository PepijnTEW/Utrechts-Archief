import type { RefObject } from "react";

export interface InfoPointData {
    time: number;
    label: string;
    text?: string;
    image?: string;
    audio?: string;
}

interface InfoPointProps {
    point: InfoPointData;
    duration: number;
    isOpen: boolean;
    onSelect: (point: InfoPointData) => void;
    buttonRef?: RefObject<HTMLButtonElement | null>;
}

export default function InfoPoint({ point, duration, isOpen, onSelect, buttonRef }: InfoPointProps) {
    const position = (point.time / duration) * 100;

    return (
        <button
            ref={buttonRef}
            type="button"
            className="absolute left-1/2 z-10 size-9 -translate-x-1/2 translate-y-1/2 touch-manipulation rounded-full border-4 border-white bg-amber-500 shadow-[0_2px_8px_rgba(15,23,42,0.35)] transition-transform duration-200 hover:scale-125 active:scale-90 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-slate-900 motion-reduce:transition-none"
            style={{ bottom: `${position}%` }}
            aria-label={`Open ${point.label} at ${point.time} seconds`}
            aria-expanded={isOpen}
            title={point.label}
            onClick={() => onSelect(point)}
        />
    );
}
