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
        className="box-border flex size-36 aspect-square flex-none flex-col justify-between overflow-hidden bg-black p-1 text-white font-sans text-[16px] font-bold italic leading-none tracking-[0.5px] sm:size-44 sm:p-2 sm:text-[20px]"
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