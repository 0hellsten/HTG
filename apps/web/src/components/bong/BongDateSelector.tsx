import React, { useRef, useState, MouseEvent } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { BongCompetition } from './competitions';

interface BongDateSelectorProps {
  competitions: BongCompetition[];
  selectedDateIso?: string;
  selectedCompetitionId?: string;
  onSelectCompetition: (comp: BongCompetition) => void;
}

export const BongDateSelector: React.FC<BongDateSelectorProps> = ({
  competitions,
  selectedDateIso,
  selectedCompetitionId,
  onSelectCompetition,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);
  const hasDraggedRef = useRef(false);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollStart(scrollRef.current.scrollLeft);
    hasDraggedRef.current = false;
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX;
    scrollRef.current.scrollLeft = scrollStart - walk;
    if (Math.abs(walk) > 8) {
      hasDraggedRef.current = true;
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
  };

  const scrollBy = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/selector">
      {}
      <button
        type="button"
        onClick={() => scrollBy(-240)}
        aria-label="Scrolla tidigare dagar"
        className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-slate-300 shadow-md items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-all cursor-pointer opacity-85 hover:opacity-100"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={() => scrollBy(240)}
        aria-label="Scrolla kommande dagar"
        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-slate-300 shadow-md items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-all cursor-pointer opacity-85 hover:opacity-100"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`flex items-stretch gap-2.5 overflow-x-auto pb-2 pt-1 px-0.5 no-scrollbar touch-pan-x select-none ${
          isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {competitions.map((comp) => {
          const isSelected = Boolean(
            selectedCompetitionId
              ? comp.id === selectedCompetitionId
              : selectedDateIso && comp.dateIso === selectedDateIso
          );
          const isToday = comp.isToday;

          let cardStyle =
            'bg-white text-slate-850 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-xs';

          if (isSelected && isToday) {
            cardStyle =
              'bg-amber-400 text-slate-950 border-slate-950 shadow-md ring-3 ring-amber-400/80 scale-[1.02]';
          } else if (isSelected) {
            cardStyle =
              'bg-amber-400 text-slate-950 border-slate-950 shadow-md ring-3 ring-amber-400/80 scale-[1.02]';
          } else if (isToday) {
            cardStyle =
              'bg-emerald-50 text-emerald-950 border-emerald-500 shadow-sm ring-1 ring-emerald-400/40 hover:bg-emerald-100/50';
          }

          const legCountText =
            comp.gameType === 'V86' || comp.gameType === 'V85'
              ? '8 lopp'
              : comp.gameType === 'V64' || comp.gameType === 'V65'
                ? '6 lopp'
                : '7 lopp';

          return (
            <button
              key={comp.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => {
                if (!hasDraggedRef.current) {
                  onSelectCompetition(comp);
                }
              }}
              className={`shrink-0 flex flex-col justify-between text-left p-3 rounded-xl border-2 transition-all cursor-pointer min-w-[130px] sm:min-w-[145px] min-h-[78px] ${cardStyle}`}
            >
              <div className="flex items-center justify-between gap-1.5 w-full">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  {isSelected ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-slate-950 text-amber-300">
                      Vald
                    </span>
                  ) : isToday ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-600 text-white">
                      Idag
                    </span>
                  ) : (
                    <span>{comp.weekday}</span>
                  )}
                  <span
                    className={
                      isSelected ? 'text-slate-950 font-black' : 'text-slate-700 font-bold'
                    }
                  >
                    {comp.dateFormatted}
                  </span>
                </span>

                <span
                  className={`text-[11px] font-black px-1.5 py-0.5 rounded ${
                    isSelected
                      ? 'bg-slate-950 text-amber-300'
                      : comp.gameType === 'V86' || comp.gameType === 'V85'
                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                        : 'bg-amber-100 text-amber-900 border border-amber-200'
                  }`}
                >
                  {comp.gameName}
                </span>
              </div>

              <div className="mt-1.5 flex items-baseline justify-between gap-1 w-full">
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-xs font-bold truncate ${
                      isSelected ? 'text-slate-950' : 'text-slate-800'
                    }`}
                  >
                    {comp.trackName}
                  </div>
                  <div
                    className={`text-[11px] font-medium truncate ${
                      isSelected ? 'text-slate-900' : 'text-slate-600'
                    }`}
                  >
                    Start {comp.startTime} · {legCountText}
                  </div>
                </div>

                {comp.jackpotPool && comp.jackpotPool > 0 && (
                  <span
                    title="Jackpot i omgången"
                    className={`shrink-0 flex items-center gap-0.5 text-[10px] font-bold px-1 py-0.5 rounded ${
                      isSelected ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Jackpot</span>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
