import InfoPoint from "./InfoPoint";

interface InfoPointData {
    time: number;
    label: string;
}

interface ProgressBarProps {
    procentage: number;
    duration: number;
    infoPoints: InfoPointData[];
    onInfoPointSelect: (time: number) => void;
}

export default function ProgressBar({
    procentage,
    duration,
    infoPoints,
    onInfoPointSelect,
}: ProgressBarProps) {
    return (
        <div className="flex justify-center p-16">
            <div className="relative h-full w-5 rounded-full bg-white/25">
                <div
                    className="absolute bottom-0 w-full rounded-full bg-amber-300"
                    style={{ height: `${procentage}%` }}
                />
                {Number.isFinite(duration) && duration > 0 &&
                    infoPoints
                        .filter(({ time }) => time >= 0 && time <= duration)
                        .map(({ time, label }) => (
                            <InfoPoint
                                key={`${time}-${label}`}
                                time={time}
                                duration={duration}
                                label={label}
                                onSelect={onInfoPointSelect}
                            />
                        ))}
            </div>
        </div>
    );
}