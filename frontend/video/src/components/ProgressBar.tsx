import { useRef } from "react";
import InfoCard from "./InfoCard";
import InfoPoint from "./InfoPoint";
import type { InfoPointData } from "./InfoPoint";

interface ProgressBarProps {
    procentage: number;
    duration: number;
    infoPoints: InfoPointData[];
    activeInfoPoint: InfoPointData | null;
    onInfoPointSelect: (point: InfoPointData) => void;
    onInfoCardClose: () => void;
}

export default function ProgressBar({
    procentage,
    duration,
    infoPoints,
    activeInfoPoint,
    onInfoPointSelect,
    onInfoCardClose,
}: ProgressBarProps) {
    const activePointRef = useRef<HTMLButtonElement>(null);

    return (
        <div className="flex justify-center p-16">
            <div className="relative h-full w-7">
                <div className="absolute inset-0 overflow-hidden rounded-full bg-white/25">
                    <div
                        className="absolute bottom-0 w-full rounded-t-full bg-amber-300 transition-[height] duration-300"
                        style={{ height: `${procentage}%` }}
                    />
                </div>
                {Number.isFinite(duration) && duration > 0 &&
                    infoPoints
                        .filter(({ time }) => time >= 0 && time <= duration)
                        .map((point, index) => (
                            <InfoPoint
                                key={`${point.time}-${point.label}-${index}`}
                                point={point}
                                duration={duration}
                                isOpen={activeInfoPoint === point}
                                onSelect={onInfoPointSelect}
                                buttonRef={activeInfoPoint === point ? activePointRef : undefined}
                            />
                        ))}
                {activeInfoPoint && duration > 0 && activeInfoPoint.time <= duration && (
                    <InfoCard
                        point={activeInfoPoint}
                        onClose={onInfoCardClose}
                        anchorRef={activePointRef}
                    />
                )}
            </div>
        </div>
    );
}