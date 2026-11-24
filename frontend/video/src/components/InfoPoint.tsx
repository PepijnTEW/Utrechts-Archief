interface InfoPointProps {
    time: number;
    duration: number;
    label: string;
    onSelect: (time: number) => void;
}

export default function InfoPoint({ time, duration, label, onSelect }: InfoPointProps) {
    const position = (time / duration) * 100;

    return (
        <button
            type="button"
            className="absolute left-1/2 z-10 size-3 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-white bg-amber-300 hover:scale-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            style={{ bottom: `${position}%` }}
            aria-label={`Jump to ${label} at ${time} seconds`}
            title={label}
            onClick={() => onSelect(time)}
        />
    );
}