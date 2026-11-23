interface ProgressBarProps {
    procentage: number;
}
export default function ProgressBar({procentage}: ProgressBarProps) {
    return (
        <div className="flex justify-center p-16">
            <div className="h-full w-5 flex items-end overflow-hidden rounded-full bg-white/25">
                <div
                    className="w-full rounded-full bg-amber-300"
                    style={{ height: `${procentage}%` }}
                >
                </div>
            </div>
        </div>
    );
}