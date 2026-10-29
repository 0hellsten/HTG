import React from 'react';
import { Compass, Activity, HelpCircle, Type, ChevronRight, ShieldCheck } from 'lucide-react';

interface MerScreenProps {
  onSelectOption: (option: 'banvisaren' | 'status' | 'hjalp' | 'textstorlek') => void;
}

export const MerScreen: React.FC<MerScreenProps> = ({ onSelectOption }) => {
  const menuOptions = [
    {
      id: 'banvisaren' as const,
      title: 'Banvisaren',
      description: 'Banfakta, vinstprocent per startspår och väder vid banan.',
      icon: Compass,
      highlight: true,
    },
    {
      id: 'status' as const,
      title: 'Hur färskt är det här?',
      description: 'Status och senaste hämtning för alla datakällor i appen.',
      icon: Activity,
    },
    {
      id: 'hjalp' as const,
      title: 'Hjälp och vanliga frågor',
      description: 'Hur prickarna fungerar och vad du gör om något ser gammalt ut.',
      icon: HelpCircle,
    },
    {
      id: 'textstorlek' as const,
      title: 'Textstorlek',
      description: 'Anpassa textens storlek efter vad som är bekvämt att läsa.',
      icon: Type,
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">Mer</h1>
        <p className="text-base text-slate-600 mt-0.5">Verktyg, statistik och inställningar.</p>
      </div>

      <div className="space-y-3">
        {menuOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectOption(opt.id)}
              className="w-full bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-slate-300 hover:bg-slate-50/50 flex items-center justify-between text-left transition-colors min-h-[56px] cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    opt.highlight ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-950 flex items-center gap-2">
                    {opt.title}
                    {opt.highlight && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-amber-500 text-slate-950 rounded-full">
                        Ny
                      </span>
                    )}
                  </h2>
                  <p className="text-slate-600 text-base mt-0.5 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-400 shrink-0 ml-3" />
            </button>
          );
        })}
      </div>

      {/* Info om appen */}
      <div className="mt-8 pt-6 border-t border-slate-200 text-center text-slate-500 text-sm space-y-1">
        <div className="flex items-center justify-center gap-1.5 font-semibold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>HTG — Hellstens Trav och Galopp</span>
        </div>
        <p>Privat och icke-kommersiell travapplikation för lugn läsning.</p>
        <p>Version 1.0 (Fas 8)</p>
      </div>
    </div>
  );
};
