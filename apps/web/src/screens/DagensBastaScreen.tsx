import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Trophy, Filter, ArrowLeft } from 'lucide-react';
import {
  BongRaceDayData,
  BongGameType,
  DagensBastaEngine,
  DagensBastaOmgang,
  SourceStatus,
} from '@stallbacken/shared';
import { FarskhetsPrick } from '../components/FarskhetsPrick';
import { BlockErrorBoundary } from '../components/BlockErrorBoundary';
import { IdagSkelett } from '../components/SkelettKort';
import { BongDateSelector } from '../components/bong/BongDateSelector';
import {
  BongCompetition,
  formatCompetitionFromApi,
  buildFallbackBongRaceDay,
  getDefaultUpcomingCompetitions,
} from '../components/bong/competitions';
import { DagensBastaOmgangBanner } from '../components/dagens-basta/DagensBastaOmgangBanner';
import { DagensBastaLoppKort } from '../components/dagens-basta/DagensBastaLoppKort';
import { apiFetch } from '../lib/api';

interface DagensBastaScreenProps {
  onSelectHorse?: (horseId: string) => void;
  onOpenRace?: (raceNumber: number) => void;
  onBackToIdag?: () => void;
}

export const DagensBastaScreen: React.FC<DagensBastaScreenProps> = ({
  onSelectHorse,
  onOpenRace,
  onBackToIdag,
}) => {
  const [competitions, setCompetitions] = useState<BongCompetition[]>(() =>
    getDefaultUpcomingCompetitions()
  );
  const [selectedCompId, setSelectedCompId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<SourceStatus>('ok');
  const [statusMessage, setStatusMessage] = useState<string>('Allt är färskt och uppdaterat.');
  const [selectedRaceFilter, setSelectedRaceFilter] = useState<number | 'alla'>('alla');

  const engine = useMemo(() => new DagensBastaEngine(), []);
  const [raceDay, setRaceDay] = useState<BongRaceDayData>(() => buildFallbackBongRaceDay('V75'));

  const dagensBastaOmgang: DagensBastaOmgang = useMemo(() => {
    return engine.analyzeOmgang(raceDay);
  }, [engine, raceDay]);

  const loadOmgang = useCallback(async (gameId: string, gameType: BongGameType) => {
    setLoading(true);
    try {
      const res = await apiFetch<BongRaceDayData>(`/api/omganger/${gameId}`);
      if (res && res.data) {
        setRaceDay(res.data);
        setStatus(res.status || 'ok');
        setStatusMessage(res.message || 'Allt är färskt och uppdaterat.');
      } else {
        setRaceDay(buildFallbackBongRaceDay(gameType));
        setStatus('stale');
        setStatusMessage('Visar sparad information.');
      }
    } catch {
      setRaceDay(buildFallbackBongRaceDay(gameType));
      setStatus('stale');
      setStatusMessage('Visar sparad information.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    async function loadUpcoming() {
      try {
        const res = await apiFetch<
          Array<{
            id: string;
            gameType: BongGameType;
            gameName: string;
            date: string;
            trackName: string;
            startTime: string;
            turnover: number;
            jackpotPool: number;
          }>
        >('/api/omganger/kommande');

        if (!isSubscribed) return;

        const formatted =
          res.data && res.data.length > 0
            ? res.data.map(formatCompetitionFromApi)
            : getDefaultUpcomingCompetitions();

        setCompetitions(formatted);
        const initial = formatted[0];
        if (initial) {
          setSelectedCompId(initial.id);
          loadOmgang(initial.id, initial.gameType);
        }
      } catch {
        if (!isSubscribed) return;
        const defaults = getDefaultUpcomingCompetitions();
        setCompetitions(defaults);
        if (defaults[0]) {
          setSelectedCompId(defaults[0].id);
          loadOmgang(defaults[0].id, defaults[0].gameType);
        }
      }
    }

    loadUpcoming();
    return () => {
      isSubscribed = false;
    };
  }, [loadOmgang]);

  const handleSelectCompetition = (comp: BongCompetition) => {
    setSelectedCompId(comp.id);
    setSelectedRaceFilter('alla');
    loadOmgang(comp.id, comp.gameType);
  };

  const handleScrollToRace = (raceNr: number) => {
    setSelectedRaceFilter(raceNr);
    const element = document.getElementById(`lopp-${raceNr}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtrera lopp om användaren valt ett specifikt lopp
  const filteredRaces = useMemo(() => {
    if (selectedRaceFilter === 'alla') {
      return dagensBastaOmgang.races;
    }
    return dagensBastaOmgang.races.filter((r) => r.raceNumber === selectedRaceFilter);
  }, [dagensBastaOmgang, selectedRaceFilter]);

  const selectedComp = competitions.find((c) => c.id === selectedCompId) || competitions[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Rubrik & Status */}
      <div className="flex items-start justify-between border-b border-slate-200 pb-4">
        <div>
          {onBackToIdag && (
            <button
              type="button"
              onClick={onBackToIdag}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-slate-900 mb-2 cursor-pointer min-h-[44px] py-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Tillbaka till Dagens omgång</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-600 shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              Dagens bästa
            </h1>
          </div>
          <p className="text-base text-slate-600 mt-1">
            De bästa hästarna och motiveringarna för varje lopp enligt alla parametrar.
          </p>
        </div>

        <div className="pt-1">
          <FarskhetsPrick
            status={status}
            explanation={statusMessage}
            onRetry={() => selectedComp && loadOmgang(selectedComp.id, selectedComp.gameType)}
          />
        </div>
      </div>

      {/* Omgångsväljare */}
      {competitions.length > 0 && (
        <BlockErrorBoundary fallbackTitle="Omgångsväljare">
          <div className="space-y-2">
            <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
              Välj omgång
            </div>
            <BongDateSelector
              competitions={competitions}
              selectedCompetitionId={selectedCompId}
              selectedDateIso={selectedComp?.dateIso || ''}
              onSelectCompetition={handleSelectCompetition}
            />
          </div>
        </BlockErrorBoundary>
      )}

      {loading && dagensBastaOmgang.races.length === 0 ? (
        <IdagSkelett />
      ) : (
        <>
          {/* Banner för omgångens spik och omgångens skräll */}
          <BlockErrorBoundary fallbackTitle="Omgångens spik och skräll">
            <DagensBastaOmgangBanner
              omgang={dagensBastaOmgang}
              onScrollToRace={handleScrollToRace}
            />
          </BlockErrorBoundary>

          {/* Snabbväljare / Filter för lopp */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
              <Filter className="w-4 h-4" />
              <span>Välj lopp att visa</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={selectedRaceFilter === 'alla'}
                onClick={() => setSelectedRaceFilter('alla')}
                className={`px-4 py-2 rounded-xl text-sm sm:text-base font-bold min-h-[44px] cursor-pointer transition-colors shrink-0 ${
                  selectedRaceFilter === 'alla'
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Alla lopp ({dagensBastaOmgang.races.length})
              </button>

              {dagensBastaOmgang.races.map((r) => (
                <button
                  key={r.raceNumber}
                  type="button"
                  role="tab"
                  aria-selected={selectedRaceFilter === r.raceNumber}
                  onClick={() => setSelectedRaceFilter(r.raceNumber)}
                  className={`px-3.5 py-2 rounded-xl text-sm sm:text-base font-bold min-h-[44px] cursor-pointer transition-colors shrink-0 ${
                    selectedRaceFilter === r.raceNumber
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Lopp {r.raceNumber}
                </button>
              ))}
            </div>
          </div>

          {/* Loppkorten */}
          <BlockErrorBoundary fallbackTitle="Lopplista för Dagens bästa">
            <div className="space-y-6 pt-2">
              {filteredRaces.map((race) => (
                <div key={race.raceNumber} id={`lopp-${race.raceNumber}`}>
                  <DagensBastaLoppKort
                    race={race}
                    onSelectHorse={onSelectHorse}
                    onOpenRace={onOpenRace}
                  />
                </div>
              ))}
            </div>
          </BlockErrorBoundary>
        </>
      )}
    </div>
  );
};
