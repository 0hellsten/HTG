import React, { useEffect, useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Plus, Info, Scale } from 'lucide-react';
import {
  Race,
  Start,
  SourceStatus,
  HorseProfileResponse,
  HorseBatchResponse,
} from '@stallbacken/shared';
import { FarskhetsPrick } from '../components/FarskhetsPrick';
import { BlockErrorBoundary } from '../components/BlockErrorBoundary';
import { LoppSkelett } from '../components/SkelettKort';
import { JamforTabell } from '../components/JamforTabell';
import { HorseOddsMap } from '../components/StartlistaTabell';
import { formatDistance, formatStartMethod } from '../lib/format';
import { apiFetch } from '../lib/api';

interface JamforScreenProps {
  raceId: string;
  initialHorseIds?: string[];
  onBack: () => void;
  onSelectHorse?: (horseId: string) => void;
}

export const JamforScreen: React.FC<JamforScreenProps> = ({
  raceId,
  initialHorseIds = [],
  onBack,
  onSelectHorse,
}) => {
  const [race, setRace] = useState<Race | null>(null);
  const [allStarts, setAllStarts] = useState<Start[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialHorseIds);
  const [profiles, setProfiles] = useState<Record<string, HorseProfileResponse | null>>({});
  const [oddsMap, setOddsMap] = useState<HorseOddsMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<SourceStatus>('ok');
  const [statusMessage, setStatusMessage] = useState<string>('Allt är färskt och uppdaterat.');
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // 1. Hämta grunddata för loppet och odds
  const fetchRaceAndOdds = async () => {
    setLoading(true);
    try {
      const [raceRes, oddsRes] = await Promise.all([
        apiFetch<{ race: Race; starts: Start[] }>(`/api/lopp/${raceId}`),
        apiFetch<any>(`/api/lopp/${raceId}/odds`),
      ]);

      if (raceRes?.data) {
        setRace(raceRes.data.race);
        const starts: Start[] = raceRes.data.starts || [];
        setAllStarts(starts);

        // Skapa oddsMap
        const newOddsMap: HorseOddsMap = {};
        if (oddsRes?.data?.odds) {
          for (const o of oddsRes.data.odds) {
            newOddsMap[o.startNumber] = {
              winOdds: o.winOdds,
              placeOdds: o.placeOdds,
              stakePercent: o.stakePercent,
            };
          }
        }
        setOddsMap(newOddsMap);

        // Om inga hästar skickades med, välj de tre mest streckade eller de tre första
        if (selectedIds.length === 0 && starts.length > 0) {
          const sorted = [...starts].sort((a, b) => {
            const stakeA = newOddsMap[a.startNumber]?.stakePercent || 0;
            const stakeB = newOddsMap[b.startNumber]?.stakePercent || 0;
            return stakeB - stakeA;
          });
          const defaultIds = sorted.slice(0, 3).map((s) => s.horseId);
          setSelectedIds(defaultIds);
        }
      } else {
        setStatus('failed');
        setStatusMessage('Loppuppgifter saknas för tillfället.');
      }
    } catch {
      setStatus('failed');
      setStatusMessage('Loppuppgifter saknas för tillfället.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Hämta profiler för de valda hästarna
  const fetchProfiles = async (ids: string[]) => {
    if (ids.length === 0) return;
    try {
      const json = await apiFetch<HorseBatchResponse>('/api/hastar/jamfor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horseIds: ids }),
      });
      if (json?.data) {
        setProfiles((prev) => ({ ...prev, ...json.data }));
        setStatus(json.status);
        setStatusMessage(json.message);
      }
    } catch {
      setStatus('degraded');
      setStatusMessage('Viss historik kunde inte hämtas.');
    }
  };

  useEffect(() => {
    fetchRaceAndOdds();
  }, [raceId]);

  useEffect(() => {
    if (selectedIds.length > 0) {
      // Hämta bara de som saknas i cachen
      const missing = selectedIds.filter((id) => profiles[id] === undefined);
      if (missing.length > 0) {
        fetchProfiles(missing);
      }
    }
  }, [selectedIds]);

  const handleAddHorse = (horseId: string) => {
    if (selectedIds.length >= 6) return;
    if (!selectedIds.includes(horseId)) {
      setSelectedIds([...selectedIds, horseId]);
    }
  };

  const handleRemoveHorse = (horseId: string) => {
    if (selectedIds.length <= 2) return;
    setSelectedIds(selectedIds.filter((id) => id !== horseId));
  };

  // Filtrera fram de valda starterna i ordning efter startnummer
  const selectedStarts = allStarts
    .filter((s) => selectedIds.includes(s.horseId))
    .sort((a, b) => a.startNumber - b.startNumber);

  const availableStarts = allStarts.filter((s) => !selectedIds.includes(s.horseId));

  const distanceStr = formatDistance(race?.distanceM);
  const methodStr = formatStartMethod(race?.startMethod);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Tillbaka-knapp och rubrik */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-950 font-medium text-base py-2.5 px-2 -mx-2 rounded-lg transition-colors min-h-[44px] cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 shrink-0" />
          <span>Tillbaka till loppet</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-600">
            {selectedStarts.length} av 6 hästar valda
          </span>
          <FarskhetsPrick
            status={status}
            explanation={statusMessage}
            onRetry={() => fetchProfiles(selectedIds)}
          />
        </div>
      </div>

      {loading && <LoppSkelett />}

      {!loading && race && (
        <div className="space-y-6">
          {/* Rubrikblock */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <div className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-1">
              {race.trackName || 'Bana'}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2.5">
                <Scale className="w-7 h-7 text-amber-600 shrink-0" />
                <span>Ställ dem mot varandra</span>
              </h1>
              <span className="text-base font-semibold text-slate-700">
                Lopp {race.number} · {distanceStr} · {methodStr}
              </span>
            </div>

            {/* Hjälpruta: Så här läser du tabellen (hopfällbar) */}
            <div className="mt-4 pt-3.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="flex items-center justify-between w-full text-left text-sm font-semibold text-slate-700 hover:text-slate-950 py-1 transition-colors cursor-pointer min-h-[44px]"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Så här läser du tabellen</span>
                </div>
                {showHelp ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {showHelp && (
                <div className="mt-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 space-y-1.5 leading-relaxed">
                  <p>
                    • Det <strong>bästa värdet</strong> på varje rad är diskret markerat med en mjuk
                    gul ton.
                  </p>
                  <p>
                    • För kilometertider betyder en lägre siffra snabbare tid. För segerprocent och
                    intjänat är en högre siffra bättre.
                  </p>
                  <p>
                    • Ett tankstreck (<strong>–</strong>) betyder att uppgiften saknas i källan —
                    inte att hästen är sämre.
                  </p>
                  <p>
                    • Du kan jämföra mellan 2 och 6 hästar samtidigt. Klicka på en häst för att läsa
                    dess fulla hästkort.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Hästvaljare / Snabbknappar */}
          <section className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Valda hästar ({selectedStarts.length} av max 6)
              </h2>
              <span className="text-xs sm:text-sm text-slate-500">
                {selectedStarts.length < 6
                  ? 'Klicka på en häst nedan för att lägga till'
                  : 'Max 6 hästar valda. Ta bort en för att välja en annan.'}
              </span>
            </div>

            {/* Knappar för att lägga till övriga hästar i loppet */}
            {availableStarts.length > 0 && selectedStarts.length < 6 && (
              <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                {availableStarts.map((start) => (
                  <button
                    key={start.id}
                    type="button"
                    onClick={() => handleAddHorse(start.horseId)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-950 rounded-lg text-sm font-semibold transition-colors min-h-[44px] cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      {start.startNumber}. {start.horseName}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Jämförelsetabell skyddad av felgräns */}
          <BlockErrorBoundary
            fallbackTitle="Jämförelsetabellen saknas just nu"
            onRetry={() => fetchProfiles(selectedIds)}
          >
            <JamforTabell
              race={race}
              starts={selectedStarts}
              profiles={profiles}
              oddsMap={oddsMap}
              onSelectHorse={onSelectHorse}
              onRemoveHorse={handleRemoveHorse}
            />
          </BlockErrorBoundary>
        </div>
      )}
    </div>
  );
};
