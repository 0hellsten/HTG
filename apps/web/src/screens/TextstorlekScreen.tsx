import React from 'react';
import { ArrowLeft, Check, Type } from 'lucide-react';

export type TextSize = 'normal' | 'stor' | 'extra';

interface TextstorlekScreenProps {
  currentSize: TextSize;
  onSelectSize: (size: TextSize) => void;
  onBack: () => void;
}

export const TextstorlekScreen: React.FC<TextstorlekScreenProps> = ({
  currentSize,
  onSelectSize,
  onBack,
}) => {
  const options: {
    id: TextSize;
    title: string;
    description: string;
    badge: string;
  }[] = [
    {
      id: 'normal',
      title: 'Normal',
      description: 'Standardstorlek. Minst 17 px på mobil och 16 px på laptop.',
      badge: 'Standard',
    },
    {
      id: 'stor',
      title: 'Stor',
      description: 'Cirka 15 % större text. Lättare att läsa utan glasögon.',
      badge: 'Större',
    },
    {
      id: 'extra',
      title: 'Riktigt stor',
      description: 'Cirka 30 % större text och extra rymliga knappar.',
      badge: 'Störst',
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-16">
      {/* Tillbakaknapp och rubrik */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] min-w-[44px] inline-flex items-center gap-2 text-slate-700 hover:text-slate-950 font-semibold py-2 px-3 rounded-lg hover:bg-slate-200/60 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Tillbaka</span>
        </button>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 flex items-center gap-3">
          <Type className="w-7 h-7 text-amber-600" />
          <span>Textstorlek</span>
        </h1>
        <p className="text-base text-slate-600 mt-1">
          Välj hur stor text du vill ha i hela appen. Ändringen sparas automatiskt i din enhet.
        </p>
      </div>

      {/* Alternativ */}
      <div className="space-y-3" role="radiogroup" aria-label="Välj textstorlek">
        {options.map((opt) => {
          const isSelected = currentSize === opt.id;
          return (
            <button
              key={opt.id}
              role="radio"
              aria-checked={isSelected}
              type="button"
              onClick={() => onSelectSize(opt.id)}
              className={`w-full text-left p-5 rounded-xl border transition-all flex items-start justify-between gap-4 cursor-pointer min-h-[64px] ${
                isSelected
                  ? 'bg-amber-50/60 border-amber-500 shadow-sm ring-2 ring-amber-400'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-950">{opt.title}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {opt.badge}
                  </span>
                </div>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  {opt.description}
                </p>
              </div>

              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border mt-1 ${
                  isSelected
                    ? 'bg-amber-500 border-amber-600 text-slate-950'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Förhandsvisning */}
      <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-2">
          Förhandsgranskning av text
        </span>
        <h2 className="text-xl font-bold text-slate-950">Lopp 4 · 2 140 m · Voltstart</h2>
        <p className="text-slate-700 leading-relaxed">
          1 San Moteur · Örjan Kihlström · Tränare: Daniel Redén. Barfota fram och bak, amerikansk
          sulky. Vinnarodds 2,4. Streck: 48 %.
        </p>
        <p className="text-slate-500 text-sm">
          Texten uppdateras direkt i alla vyer i appen så snart du väljer ett alternativ ovan.
        </p>
      </div>
    </div>
  );
};
