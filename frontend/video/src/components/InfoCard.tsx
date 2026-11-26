import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import type { InfoPointData } from "./InfoPoint";

interface InfoCardProps {
    point: InfoPointData;
    onClose: () => void;
    anchorRef: RefObject<HTMLButtonElement | null>;
}

export default function InfoCard({ point, onClose, anchorRef }: InfoCardProps) {
    const cardRef = useRef<HTMLElement>(null);
    const [position, setPosition] = useState<CSSProperties>({ visibility: "hidden" });

    useLayoutEffect(() => {
        const card = cardRef.current;
        const anchor = anchorRef.current;
        if (!card || !anchor) return;

        const updatePosition = () => {
            const cardWidth = card.offsetWidth;
            const cardHeight = card.offsetHeight;
            const anchorBounds = anchor.getBoundingClientRect();
            const margin = 16;
            const gap = 40;
            const anchorX = anchorBounds.left;
            const anchorY = anchorBounds.top + anchorBounds.height / 2;
            const preferredLeft = anchorX - cardWidth - gap;
            const top = Math.max(
                margin,
                Math.min(
                    anchorY - cardHeight / 2,
                    window.innerHeight - cardHeight - margin,
                ),
            );

            const left = Math.max(
                margin,
                Math.min(preferredLeft, window.innerWidth - cardWidth - margin),
            );
            setPosition({ position: "fixed", left, top, visibility: "visible" });
        };

        updatePosition();
        window.addEventListener("resize", updatePosition);
        const observer = new ResizeObserver(updatePosition);
        observer.observe(card);

        return () => {
            window.removeEventListener("resize", updatePosition);
            observer.disconnect();
        };
    }, [anchorRef, point]);

    return (
        <section
            ref={cardRef}
            className="info-card-enter fixed left-0 top-0 z-20 max-h-[calc(100dvh_-_2rem)] w-[min(34rem,calc(100vw_-_2rem))] overflow-y-auto rounded-3xl bg-white p-8 text-slate-950 shadow-[0_24px_64px_rgba(15,23,42,0.28)] ring-1 ring-slate-900/10 sm:p-10"
            style={position}
            role="dialog"
            aria-label={`${point.label} information`}
        >
            <div className="mb-6 flex items-start justify-between gap-4">
                <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">{point.label}</h2>
                <button
                    type="button"
                    className="flex size-14 flex-none items-center justify-center rounded-full bg-slate-100 text-3xl leading-none text-slate-700 transition-colors hover:bg-slate-200 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                    aria-label="Close info card"
                    onClick={onClose}
                >
                    &times;
                </button>
            </div>
            {point.image && (
                <img
                    className="mb-6 max-h-[45vh] w-full rounded-2xl object-cover"
                    src={point.image}
                    alt={point.label}
                />
            )}
            {point.text && (
                <p className="mb-6 whitespace-pre-wrap text-xl leading-relaxed text-slate-800 sm:text-2xl">
                    {point.text}
                </p>
            )}
            {point.audio && (
                <audio className="w-full" controls src={point.audio}>
                    Your browser does not support audio playback.
                </audio>
            )}
        </section>
    );
}