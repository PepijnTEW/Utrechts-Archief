interface ProgressBarProps {
    procentage: number;
}
export default function ProgressBar({procentage}: ProgressBarProps) {
    return (
        <div className="flex-1 flex justify-center p-16">
            <div className="h-full w-5 flex items-end bg-white/25 rounded-full overflow-hidden">
                <div
                    className="w-full rounded-full bg-amber-300"
                    style={{ height: `${procentage}%` }}
                >

                </div>
            </div>
        </div>
    );
}