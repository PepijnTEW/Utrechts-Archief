type HeaderProps = {
  isSignedIn: boolean;
  onLogout: () => void;
};

export default function Header({ isSignedIn, onLogout }: HeaderProps) {
  return (
    <header className="relative z-10 flex h-20 items-center bg-white px-4 sm:px-8">
      <h1 className="text-base font-semibold text-slate-900 sm:text-xl">
        Utrechts Archief CMS
      </h1>
      {isSignedIn && (
        <button
          type="button"
          onClick={onLogout}
          className="cursor-pointer ml-auto px-3 py-2 text-sm font-semibold text-[#008899] underline-offset-4 hover:underline focus-visible:underline"
        >
          Log out
        </button>
      )}
      <div
        role="img"
        aria-label="Het Utrechts Archief"
        className="absolute right-4 top-[calc(100%-4rem)] z-20 flex h-32 w-36 flex-col justify-between bg-[#f2e8d2] p-3 select-none font-sans text-sm font-bold italic leading-[1.15] tracking-[0.12em] text-[#008899] sm:right-8 sm:top-[calc(100%-4.5rem)] sm:h-36 sm:w-40 sm:p-4 sm:text-lg mr-30"
      >
        <div className="whitespace-pre">HET//////////</div>
        <div className="whitespace-pre">UTRECHTS</div>
        <div className="whitespace-pre">ARCHIEF//</div>
        <div className="whitespace-pre">///////////////</div>
        <div className="whitespace-pre">///////////////</div>
      </div>
    </header>
  );
}
