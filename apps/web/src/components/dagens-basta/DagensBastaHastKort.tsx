import React from 'react';
import {
  Sparkles,
  Zap,
  Target,
  Compass,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
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
  let cardBorderClass = 'border-slate-200 hover:border-slate-300';
  let RoleIcon = Target;

  if (isSpik) {
    roleBadgeClass = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
    cardBorderClass = 'border-amber-300/80 bg-amber-50/20 shadow-sm';
    RoleIcon = Sparkles;
  } else if (isSkrall) {
    roleBadgeClass = 'bg-purple-100 text-purple-900 border-purple-300 font-bold';
    cardBorderClass = 'border-purple-300/80 bg-purple-50/20 shadow-sm';
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
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all bg-white ${cardBorderClass}`}
    >
      {/* Överdel: Startnummer, namn, kusk och rollbricka */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Startnummer */}
          <div
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-xl sm:text-2xl shrink-0 shadow-sm ${
              isSpik
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                : isSkrall
                ? 'bg-purple-700 text-white'
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
              <h4 className="text-lg sm:text-xl font-extrabold text-slate-950 group-hover:text-amber-700 transition-colors truncate flex items-center gap-1.5">
                <span>{horse.name}</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-amber-600 transition-opacity" />
              </h4>
            </button>
            <p className="text-sm sm:text-base text-slate-600 truncate mt-0.5">
              {horse.driverName ? `Kusk: ${horse.driverName}` : 'Kusk saknas'}
              {horse.trainerName && ` · Tränare: ${horse.trainerName}`}
            </p>
          </div>
        </div>

        {/* Rollbricka */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border shrink-0 ${roleBadgeClass}`}
        >
          <RoleIcon className="w-3.5 h-3.5" />
          <span>{horse.roleLabel}</span>
        </div>
      </div>

      {/* Nyckeltal / snabbfakta */}
      <div className="mt-3.5 flex flex-wrap gap-2 text-xs sm:text-sm">
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold">
          Spår {horse.postPosition}
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/60">
          {horse.betDistribution} % streckad
        </span>
        {horse.winOdds && (
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold">
            Odds {horse.winOdds.toFixed(1).replace('.', ',')}
          </span>
        )}
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
          {horse.shoes}
          {horse.shoeChanged && ' (ändring!)'}
        </span>
        {horse.sulky && (
          <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-900 font-medium border border-sky-200/60">
            {horse.sulky}
          </span>
        )}
        {horse.record && (
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono">
            {horse.record}
          </span>
        )}
      </div>

      {/* Varför-punkter */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2.5">
        <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
          Varför vi tror på hästen:
        </div>
        <ul className="space-y-2">
          {horse.reasons.map((reason, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-sm sm:text-base text-slate-800 leading-relaxed"
            >
              {renderReasonIcon(reason.category)}
              <div>
                <span className="font-semibold text-slate-900 mr-1.5">
                  {reason.title}:
                </span>
                <span>{reason.text}</span>
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
