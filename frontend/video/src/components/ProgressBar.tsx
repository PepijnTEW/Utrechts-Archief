interface ProgressBarProps {
    procentage: number;
}
export default function ProgressBar({procentage}: ProgressBarProps) {
    return (
        <div className="flex-1 flex justify-center p-16">
            <div className="h-full w-5 bg-white/25 rounded-full">
                <div
                    className="w-full rounded-full bg-amber-300"
                    style={{ height: `${procentage}%` }}
                >
                </div>
            </div>
        </div>
    );
}