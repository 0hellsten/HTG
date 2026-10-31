import React from 'react';
import { Sparkles, Zap, Target, Compass, Award, ChevronRight, TrendingUp } from 'lucide-react';
import { DagensBastaHorse, DagensBastaReasonItem } from '@stallbacken/shared';
import { HastsKoIkon } from '../HastsKoIkon';

interface DagensBastaHastKortProps {
  horse: DagensBastaHorse;
  onSelectHorse?: (horseId: string) => void;
}

export const DagensBastaHastKort: React.FC<DagensBastaHastKortProps> = ({
  horse,
  onSelectHorse,
}) => {
  const isSpik = horse.role === 'basta_chansen';
  const isSkrall = horse.role === 'skrall';

  // Färger och ikoner per roll
  let roleBadgeClass = 'bg-slate-100 text-slate-800 border-slate-300';
  let cardBorderClass = 'border-2 border-slate-300 hover:border-slate-400 bg-white';
  let RoleIcon = Target;

  if (isSpik) {
    roleBadgeClass = 'bg-amber-100 text-amber-950 border-amber-400 font-extrabold';
    cardBorderClass = 'border-2 border-amber-400/90 bg-amber-50/25 shadow-sm';
    RoleIcon = Sparkles;
  } else if (isSkrall) {
    roleBadgeClass = 'bg-purple-100 text-purple-950 border-purple-400 font-extrabold';
    cardBorderClass = 'border-2 border-purple-400/90 bg-purple-50/25 shadow-sm';
    RoleIcon = Zap;
  }

  const renderReasonIcon = (category: DagensBastaReasonItem['category']) => {
    switch (category) {
      case 'lage':
        return <Compass className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />;
      case 'balans':
        return <HastsKoIkon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
      case 'form_klass':
        return <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />;
      case 'kusk':
        return <Award className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />;
      case 'spelvarde':
        return <TrendingUp className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />;
      default:
        return <Target className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className={`rounded-2xl p-4 sm:p-5 transition-all ${cardBorderClass}`}>
      {/* Överdel: Startnummer, namn, kusk och rollbricka */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Startnummer */}
          <div
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-xl sm:text-2xl shrink-0 shadow-sm ${
              isSpik
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400'
                : isSkrall
                  ? 'bg-purple-700 text-white ring-2 ring-purple-300'
                  : 'bg-slate-900 text-white'
            }`}
          >
            {horse.startNumber}
          </div>

          {/* Hästnamn och kusk */}
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => onSelectHorse && onSelectHorse(horse.id)}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <h4 className="text-lg sm:text-xl font-black text-slate-950 group-hover:text-amber-700 transition-colors truncate flex items-center gap-1.5">
                <span>{horse.name}</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-amber-600 transition-opacity" />
              </h4>
            </button>
            <p className="text-sm sm:text-base text-slate-700 font-medium truncate mt-0.5">
              {horse.driverName ? `Kusk: ${horse.driverName}` : 'Kusk saknas'}
              {horse.trainerName && ` · Tränare: ${horse.trainerName}`}
            </p>
          </div>
        </div>

        {/* Rollbricka */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold border-2 shrink-0 ${roleBadgeClass}`}
        >
          <RoleIcon className="w-3.5 h-3.5" />
          <span>{horse.roleLabel}</span>
        </div>
      </div>

      {/* Nyckeltal / snabbfakta */}
      <div className="mt-3.5 flex flex-wrap gap-2 text-xs sm:text-sm">
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-900 font-bold border border-slate-300">
          Spår {horse.postPosition}
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-950 font-black border border-emerald-300">
          {horse.betDistribution} % streckad
        </span>
        {horse.winOdds && (
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-950 font-bold border border-amber-300">
            Odds {horse.winOdds.toFixed(1).replace('.', ',')}
          </span>
        )}
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold border border-slate-300">
          {horse.shoes}
          {horse.shoeChanged && ' (ändring!)'}
        </span>
        {horse.sulky && (
          <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-950 font-semibold border border-sky-300">
            {horse.sulky}
          </span>
        )}
        {horse.record && (
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono font-medium border border-slate-300">
            {horse.record}
          </span>
        )}
      </div>

      {/* Varför vi tror på hästen - egen tydlig sub-box */}
      <div className="mt-4 rounded-xl bg-slate-50 border border-slate-300/80 p-3.5 sm:p-4 space-y-2.5">
        <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-600">
          Varför vi tror på hästen:
        </div>
        <ul className="space-y-2">
          {horse.reasons.map((reason, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-sm sm:text-base text-slate-900 leading-relaxed"
            >
              {renderReasonIcon(reason.category)}
              <div>
                <span className="font-extrabold text-slate-950 mr-1.5">{reason.title}:</span>
                <span className="font-medium text-slate-800">{reason.text}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Länk för mer information */}
      {onSelectHorse && (
        <div className="mt-4 pt-3 flex justify-end">
          <button
            type="button"
            onClick={() => onSelectHorse(horse.id)}
            className="text-sm font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1 min-h-[44px] px-2 -mr-2 cursor-pointer transition-colors"
          >
            <span>Se hästens tidigare starter</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
