export default function Logo() {
    const rows = [
        "HET/////////",
        "UTRECHTS",
        "ARCHIEF//",
        "///////////////",
        "///////////////",
    ];

    return(
        <div className="font-switzer italic text-white leading-none">
            {rows.map((line, rowIndex) =>
                <div
                    key={rowIndex}
                    className="flex h-[1em] leading-[1]"
                >
                    {line.split("").map((char, charIndex) =>
                        <span
                            key={charIndex}
                            className={`inline-grid h-[1em] w-[0.55em] place-items-center ${char === "/" ? "font-normal" : "font-bold"}`}
                        >
                            {char}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}