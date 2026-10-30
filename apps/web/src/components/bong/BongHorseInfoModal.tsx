import React, { useEffect, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import {
  BongHorseInput,
  BongRaceLeg,
  HorseRank,
  analyzeHorseProbabilities,
  HorseProfileResponse,
} from '@stallbacken/shared';
import { BongHorseAnalysisSection } from './BongHorseAnalysisSection';
import { BongHorsePastStarts } from './BongHorsePastStarts';
import { apiFetch } from '../../lib/api';

interface BongHorseInfoModalProps {
  horse: BongHorseInput | null;
  leg: BongRaceLeg;
  isOpen: boolean;
  isSelected: boolean;
  currentRank: HorseRank;
  onClose: () => void;
  onToggleHorse: (horseId: string) => void;
  onSetRank: (horseId: string, rank: HorseRank) => void;
  onOpenFullHorse?: (horseId: string) => void;
}

const RANK_DESCRIPTIONS: Record<HorseRank, { title: string; desc: string; badgeClass: string }> = {
  A: {
    title: 'Rank A · Huvudchans',
    desc: 'Bästa vinstchansen i loppet eller omsorgsfullt utvald spik.',
    badgeClass: 'bg-emerald-600 text-white',
  },
  B: {
    title: 'Rank B · Tidig utmanare',
    desc: 'Högkapabel utmanare som ska med vid tidig gardering.',
    badgeClass: 'bg-blue-600 text-white',
  },
  C: {
    title: 'Rank C · Skrällgardering',
    desc: 'Lågt streckad häst med bra spelvärde som kan överraska vid överpace.',
    badgeClass: 'bg-amber-600 text-white',
  },
  D: {
    title: 'Rank D · Chanslös / Lågprioriterad',
    desc: 'Svårt läge eller otillräcklig form. Sparas till sista gardering.',
    badgeClass: 'bg-slate-600 text-white',
  },
  Unranked: {
    title: 'Ej rankad',
    desc: 'Hästen är inte tilldelad någon bokstav än.',
    badgeClass: 'bg-slate-200 text-slate-800',
  },
};

export const BongHorseInfoModal: React.FC<BongHorseInfoModalProps> = ({
  horse,
  leg,
  isOpen,
  isSelected,
  currentRank,
  onClose,
  onToggleHorse,
  onSetRank,
  onOpenFullHorse,
}) => {
  const [profile, setProfile] = useState<HorseProfileResponse | null>(null);

  useEffect(() => {
    if (!isOpen || !horse) {
      setProfile(null);
      return;
    }

    let isCancelled = false;
    const fetchInfo = async () => {
      try {
        const json = await apiFetch<HorseProfileResponse>(`/api/hastar/${horse.id}`);
        if (!isCancelled && json?.data?.horse) {
          setProfile(json.data);
          return;
        }

        if (horse.name) {
          const searchJson = await apiFetch<Array<{ id: string; name: string }>>(`/api/hastar/sok?q=${encodeURIComponent(horse.name)}`);
          const matched = searchJson?.data?.[0];
          if (!isCancelled && matched) {
            const fullJson = await apiFetch<HorseProfileResponse>(`/api/hastar/${matched.id}`);
            if (!isCancelled && fullJson?.data) {
              setProfile(fullJson.data);
            }
          }
        }
      } catch {
        if (!isCancelled) setProfile(null);
      }
    };

    fetchInfo();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, horse]);

  if (!isOpen || !horse) return null;

  // Analysberäkning
  const otherHorses = leg.horses.filter((h) => h.id !== horse.id);
  const secondHorse = otherHorses.reduce<BongHorseInput | undefined>((best, curr) => {
    if (!best) return curr;
    const bestOdds = best.winOdds || 99;
    const currOdds = curr.winOdds || 99;
    return currOdds < bestOdds ? curr : best;
  }, undefined);

  const analysis = analyzeHorseProbabilities(horse, secondHorse, leg);
  const streckPct = Math.round((horse.betDistribution || 0.01) * 100);
  const winOdds = horse.winOdds ? horse.winOdds.toLocaleString('sv-SE') : '–';
  const rankInfo = RANK_DESCRIPTIONS[currentRank] || RANK_DESCRIPTIONS['A'];

  const postPosition = horse.postPosition || horse.startNumber;
  const startMethodText = leg.startMethod === 'auto' ? 'autostart' : 'voltstart';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bong-horse-info-title"
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl p-4 sm:p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
              {horse.startNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  Avd {leg.legIndex + 1} · Lopp {leg.raceNumber || leg.legIndex + 1}
                </span>
                {analysis.isSolidSpik && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Spikbud
                  </span>
                )}
                {analysis.isHighValueSkrall && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    Skrällbud
                  </span>
                )}
              </div>
              <h2
                id="bong-horse-info-title"
                className="text-xl sm:text-2xl font-extrabold text-slate-950 leading-tight mt-0.5"
              >
                {horse.name || `Häst ${horse.startNumber}`}
              </h2>
              <div className="text-xs sm:text-sm text-slate-600">
                {horse.driverName || 'Okänd kusk'}
                {horse.trainerName ? ` · Tränare: ${horse.trainerName}` : ''}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Stäng informationsruta"
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Val & ranking på bongen */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Kupongstatus
              </div>
              <div className="font-bold text-slate-900 text-sm sm:text-base">
                {isSelected ? (
                  <span className="text-emerald-700">Markerad på kupongen</span>
                ) : (
                  <span className="text-slate-600">Ej vald på kupongen</span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleHorse(horse.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                  : 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-extrabold shadow-xs'
              }`}
            >
              {isSelected ? 'Ta bort från kupong' : 'Välj på kupongen'}
            </button>
          </div>

          {isSelected && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
              <div className="text-xs font-semibold text-slate-600">Sätt rankinggrupp:</div>
              <div className="grid grid-cols-4 gap-1.5">
                {(['A', 'B', 'C', 'D'] as HorseRank[]).map((r) => {
                  const isActive = currentRank === r;
                  const opt = RANK_DESCRIPTIONS[r];
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => onSetRank(horse.id, r)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                        isActive
                          ? `${opt.badgeClass} border-transparent shadow-xs`
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Rank {r}
                    </button>
                  );
                })}
              </div>
              <div className="text-xs text-slate-600 italic pt-1">{rankInfo.desc}</div>
            </div>
          )}
        </div>

        {/* Travanalys och förutsättningar */}
        <BongHorseAnalysisSection
          analysis={analysis}
          winOdds={winOdds}
          streckPct={streckPct}
          postPosition={postPosition}
          startMethodText={startMethodText}
        />

        {/* Form i backspegeln (hästens tidigare lopp) */}
        <BongHorsePastStarts
          pastStarts={profile?.pastStarts || []}
          earningsTotal={profile?.horse?.earningsTotal}
        />

        {/* Länk till fullständigt hästkort om tillgängligt */}
        {onOpenFullHorse && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFullHorse(profile?.horse?.id || horse.id);
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-800 hover:bg-slate-100 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Öppna fullständigt hästkort</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
