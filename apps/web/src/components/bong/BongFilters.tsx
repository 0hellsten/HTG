import React, { useState } from 'react';
import { SlidersHorizontal, ChevronUp, ChevronDown, HelpCircle } from 'lucide-react';

interface BongFiltersProps {
  showFilters: boolean;
  onToggleFilters: () => void;
  minA: number;
  maxA: number;
  maxC: number;
  maxD: number;
  minPayout: number;
  minStrecksumma: number;
  maxStrecksumma: number;
  onChangeMinA: (val: number) => void;
  onChangeMaxA: (val: number) => void;
  onChangeMaxC: (val: number) => void;
  onChangeMaxD: (val: number) => void;
  onChangeMinPayout: (val: number) => void;
  onChangeMinStrecksumma: (val: number) => void;
  onChangeMaxStrecksumma: (val: number) => void;
}

export const BongFilters: React.FC<BongFiltersProps> = ({
  showFilters,
  onToggleFilters,
  minA,
  maxA,
  maxC,
  maxD,
  minPayout,
  minStrecksumma,
  maxStrecksumma,
  onChangeMinA,
  onChangeMaxA,
  onChangeMaxC,
  onChangeMaxD,
  onChangeMinPayout,
  onChangeMinStrecksumma,
  onChangeMaxStrecksumma,
}) => {
  const [showHelp, setShowHelp] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggleFilters}
        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="w-5 h-5 text-amber-600" />
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-950">
              Reduceringsmotor &amp; Villkor
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {showFilters
                ? 'Ställ in ABCD-krav, strecksumma och utdelningsfilter'
                : 'Klicka för att aktivera reducering'}
            </p>
          </div>
        </div>
        {showFilters ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {showFilters && (
        <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/50 space-y-6">
          {/* Hur gör jag? - förklaring av reducering */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setShowHelp((prev) => !prev)}
              aria-expanded={showHelp}
              className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Hur fungerar reduceringen? (Hur gör jag?)</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <span>{showHelp ? 'Dölj förklaring' : 'Visa förklaring'}</span>
                {showHelp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {showHelp && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/80 text-slate-700 text-xs sm:text-sm space-y-3 leading-relaxed">
                <div>
                  <h5 className="font-extrabold text-slate-900 mb-1">1. Bokstäverna på hästarna (ABCD):</h5>
                  <ul className="space-y-1 list-disc pl-4 text-slate-600">
                    <li><strong className="text-emerald-700">A-hästar:</strong> Dina spikar och loppens bästa vinnarchanser.</li>
                    <li><strong className="text-sky-700">B-hästar:</strong> Bra kompletterande hästar och starka utmanare.</li>
                    <li><strong className="text-amber-700">C-hästar:</strong> Skrällar med högt spelvärde som rensar kupongen.</li>
                    <li><strong className="text-slate-700">D-hästar:</strong> Djupa garderingar eller reserver.</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-extrabold text-slate-900 mb-1">2. Sätt dina villkorskrav:</h5>
                  <p className="text-slate-600">
                    Här ställer du in hur många hästar av varje bokstav som får vinna på din kupong.
                    Till exempel: <em>”Minst 2 A-hästar och högst 1 C-häst”</em>.
                  </p>
                </div>

                <div>
                  <h5 className="font-extrabold text-slate-900 mb-1">3. Kupongpriset minskar rejält:</h5>
                  <p className="text-slate-600">
                    Maskinen plockar bort alla enkelrader som inte klarar dina villkor. Du behåller alla dina vinnaridéer men slipper betala för osannolika kombinationer.
                  </p>
                </div>
              </div>
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
              ABCD-villkor per enkelrad
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-emerald-800 flex items-center justify-between">
                  <span>A-hästar</span>
                  <span className="text-[10px] text-slate-500 font-normal">Min / Max</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    min={0}
                    max={7}
                    value={minA}
                    onChange={(e) => onChangeMinA(Number(e.target.value))}
                    className="w-14 p-1.5 border border-slate-300 rounded text-center text-sm font-bold"
                  />
                  <span className="text-slate-400">till</span>
                  <input
                    type="number"
                    min={minA}
                    max={7}
                    value={maxA}
                    onChange={(e) => onChangeMaxA(Number(e.target.value))}
                    className="w-14 p-1.5 border border-slate-300 rounded text-center text-sm font-bold"
                  />
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-amber-800 flex items-center justify-between">
                  <span>C-hästar</span>
                  <span className="text-[10px] text-slate-500 font-normal">Högst</span>
                </div>
                <div className="mt-2">
                  <input
                    type="number"
                    min={0}
                    max={7}
                    value={maxC}
                    onChange={(e) => onChangeMaxC(Number(e.target.value))}
                    className="w-14 p-1.5 border border-slate-300 rounded text-center text-sm font-bold"
                  />
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>D-hästar</span>
                  <span className="text-[10px] text-slate-500 font-normal">Högst</span>
                </div>
                <div className="mt-2">
                  <input
                    type="number"
                    min={0}
                    max={7}
                    value={maxD}
                    onChange={(e) => onChangeMaxD(Number(e.target.value))}
                    className="w-14 p-1.5 border border-slate-300 rounded text-center text-sm font-bold"
                  />
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Minsta utdelning</span>
                  <span className="text-[10px] text-slate-500 font-normal">kr</span>
                </div>
                <div className="mt-2">
                  <input
                    type="number"
                    step={1000}
                    min={0}
                    value={minPayout}
                    onChange={(e) => onChangeMinPayout(Number(e.target.value))}
                    className="w-full p-1.5 border border-slate-300 rounded text-sm font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">
              Strecksumma-intervall: {minStrecksumma} % — {maxStrecksumma} %
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Sållar bort rader som är antingen för enkla (under {minStrecksumma} %) eller för
              osannolika (över {maxStrecksumma} %).
            </p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={80}
                max={300}
                value={minStrecksumma}
                onChange={(e) => onChangeMinStrecksumma(Number(e.target.value))}
                className="flex-1 accent-amber-500"
              />
              <input
                type="range"
                min={200}
                max={450}
                value={maxStrecksumma}
                onChange={(e) => onChangeMaxStrecksumma(Number(e.target.value))}
                className="flex-1 accent-amber-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
