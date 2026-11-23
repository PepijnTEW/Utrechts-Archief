export default function Logo() {
    const ROWS = [
        "HET/////////",
        "UTRECHTS",
        "ARCHIEF//",
        "///////////////",
        "///////////////",
    ];

    return (
      <div
        className="box-border flex size-50 aspect-square flex-none flex-col justify-between overflow-hidden bg-black text-white font-sans text-[25px] font-bold italic leading-none tracking-[0.5px]"
        aria-label="Het Utrechts Archief"
      >
        {ROWS.map((line, rowsIndex) => (
          <div key={rowsIndex} className="flex w-full justify-between whitespace-nowrap">
            {line.split("").map((char, charIndex) => (
              <span
                key={charIndex}
                className={` ${char === "/" ? "font-normal" : undefined}`}
              >
                {char}
              </span>
            ))}
          </div>
        ))}
      </div>  
    );
}