import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCw, Radio } from 'lucide-react';
import {
  BongGameType,
  BongRaceDayData,
  JanneBoyConfig,
  JanneBoyEngine,
  JanneBoyStrategy,
  JanneBoySystemResult,
} from '@stallbacken/shared';
import { JanneBoyControls } from '../components/janne-boy/JanneBoyControls';
import { JanneBoyIcon } from '../components/janne-boy/JanneBoyIcon';
import { JanneBoySystemView } from '../components/janne-boy/JanneBoySystemView';
import { JanneBoyOmgangBanner } from '../components/janne-boy/JanneBoyOmgangBanner';
import {
  BongCompetition,
  formatCompetitionFromApi,
  buildFallbackBongRaceDay,
  getDefaultUpcomingCompetitions,
} from '../components/bong/competitions';
import { BongDateSelector } from '../components/bong/BongDateSelector';
import { BongKupongModal } from '../components/bong/BongKupongModal';
import { apiFetch } from '../lib/api';

interface JanneBoyScreenProps {
  onOpenInBong: (gameType: BongGameType, selectedHorses: Record<number, string[]>) => void;
  onSelectHorse?: (horseId: string) => void;
}

export const JanneBoyScreen: React.FC<JanneBoyScreenProps> = ({
  onOpenInBong,
  onSelectHorse,
}) => {
  const [competitions, setCompetitions] = useState<BongCompetition[]>(() =>
    getDefaultUpcomingCompetitions()
  );
  const [selectedCompId, setSelectedCompId] = useState<string>('');
  const [gameType, setGameType] = useState<BongGameType>('V75');
  const [strategy, setStrategy] = useState<JanneBoyStrategy>('balanserad');
  const [budget, setBudget] = useState<number>(100);
  const [lockedHorses, setLockedHorses] = useState<Record<number, string[]>>({});
  const [isLive, setIsLive] = useState<boolean>(false);
  const [loadingLive, setLoadingLive] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isKupongModalOpen, setIsKupongModalOpen] = useState<boolean>(false);

  const engine = useMemo(() => new JanneBoyEngine(), []);
  const [raceDay, setRaceDay] = useState<BongRaceDayData>(() => buildFallbackBongRaceDay('V75'));
  const [systemResult, setSystemResult] = useState<JanneBoySystemResult | null>(() =>
    new JanneBoyEngine().generate(buildFallbackBongRaceDay('V75'), {
      gameType: 'V75',
      strategy: 'balanserad',
      budget: 100,
      lockedHorses: {},
    })
  );

  const loadLiveOmgang = useCallback(
    async (
      gameId: string,
      type: BongGameType,
      currentStrat: JanneBoyStrategy,
      currentBudget: number,
      locks: Record<number, string[]>
    ) => {
      try {
        setLoadingLive(true);
        const res = await apiFetch<BongRaceDayData>(`/api/omganger/${gameId}`);
        const activeRaceDay = res.data || buildFallbackBongRaceDay(type);
        setRaceDay(activeRaceDay);
        setIsLive(!!res.data);
        const config: JanneBoyConfig = {
          gameType: type,
          strategy: currentStrat,
          budget: currentBudget,
          lockedHorses: locks,
        };
        setSystemResult(engine.generate(activeRaceDay, config));
      } catch {
        const fallback = buildFallbackBongRaceDay(type);
        setRaceDay(fallback);
        const config: JanneBoyConfig = {
          gameType: type,
          strategy: currentStrat,
          budget: currentBudget,
          lockedHorses: locks,
        };
        setSystemResult(engine.generate(fallback, config));
      } finally {
        setLoadingLive(false);
      }
    },
    [engine]
  );

  useEffect(() => {
    let isSubscribed = true;

    async function loadUpcoming() {
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
        setGameType(initial.gameType);
        loadLiveOmgang(initial.id, initial.gameType, 'balanserad', 100, {});
      }
    }

    loadUpcoming();
    return () => {
      isSubscribed = false;
    };
  }, [loadLiveOmgang]);

  const handleSelectCompetition = (comp: BongCompetition) => {
    setSelectedCompId(comp.id);
    setGameType(comp.gameType);
    setLockedHorses({});
    loadLiveOmgang(comp.id, comp.gameType, strategy, budget, {});
  };

  const handleGenerate = () => {
    if (isCalculating) return;
    setIsCalculating(true);
    const config: JanneBoyConfig = { gameType, strategy, budget, lockedHorses };
    setSystemResult(engine.generate(raceDay, config));
    setIsCalculating(false);
  };

  const handleSelectStrategy = (newStrat: JanneBoyStrategy) => {
    setStrategy(newStrat);
    setSystemResult(
      engine.generate(raceDay, {
        gameType,
        strategy: newStrat,
        budget,
        lockedHorses,
      })
    );
  };

  const handleChangeBudget = (newBudget: number) => {
    setBudget(newBudget);
    setSystemResult(
      engine.generate(raceDay, {
        gameType,
        strategy,
        budget: newBudget,
        lockedHorses,
      })
    );
  };

  const handleToggleLock = (legIndex: number, horseId: string) => {
    setLockedHorses((prev) => {
      const current = prev[legIndex] || [];
      const isCurrentlyLocked = current.includes(horseId);
      const updated = isCurrentlyLocked ? [] : [horseId];
      return { ...prev, [legIndex]: updated };
    });
  };

  const handleOpenInBong = (sys: JanneBoySystemResult) => {
    const selectionMap: Record<number, string[]> = {};
    for (const leg of sys.legs) {
      selectionMap[leg.legIndex] = leg.selectedHorses.map((h) => h.id);
    }
    onOpenInBong(sys.gameType, selectionMap);
  };

  const couponSelectedHorses = useMemo(() => {
    const map: Record<number, string[]> = {};
    if (systemResult) {
      for (const leg of systemResult.legs) {
        map[leg.legIndex] = leg.selectedHorses.map((h) => h.id);
      }
    }
    return map;
  }, [systemResult]);

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <JanneBoyIcon className="h-10 w-auto object-contain drop-shadow-sm" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
              <span>Janne Boy</span>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </h1>
          </div>
          <p className="text-slate-600 text-sm sm:text-base mt-1.5 leading-relaxed">
            Superintelligent kupongmotor
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs shrink-0 shadow-2xs">
          <span
            className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`}
          />
          <div className="leading-tight">
            <span className="font-bold text-slate-800 block flex items-center gap-1">
              <Radio className="w-3 h-3 text-slate-500" />
              <span>{isLive ? 'Färska live-odds från ATG' : 'Kvalitetssäkrat travunderlag'}</span>
            </span>
            <span className="text-[10px] text-slate-500">
              {raceDay.trackName} · {raceDay.date || 'Vald omgång'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (selectedCompId) {
                loadLiveOmgang(selectedCompId, gameType, strategy, budget, lockedHorses);
              } else {
                handleGenerate();
              }
            }}
            disabled={loadingLive}
            title="Uppdatera underlag"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
          <span>Kommande tävlingar</span>
          <span className="text-slate-600 text-[11px] font-medium">14 dagar framåt</span>
        </div>

        <BongDateSelector
          competitions={competitions}
          selectedDateIso={selectedCompId}
          onSelectCompetition={handleSelectCompetition}
        />
      </div>

      <JanneBoyOmgangBanner raceDay={raceDay} />

      <JanneBoyControls
        gameType={gameType}
        strategy={strategy}
        budget={budget}
        isCalculating={isCalculating}
        onSelectStrategy={handleSelectStrategy}
        onChangeBudget={handleChangeBudget}
        onGenerate={handleGenerate}
      />

      {systemResult && (
        <JanneBoySystemView
          system={systemResult}
          lockedHorses={lockedHorses}
          onToggleLock={handleToggleLock}
          onRegenerate={handleGenerate}
          onOpenInBong={handleOpenInBong}
          onOpenKupong={() => setIsKupongModalOpen(true)}
          onSelectHorse={onSelectHorse}
        />
      )}

      {/* Flytande Bong-knapp (visar ifylld bong/kupong) */}
      {systemResult && (
        <button
          type="button"
          onClick={() => setIsKupongModalOpen((prev) => !prev)}
          data-testid="bong-kupong-flytande-knapp"
          aria-label={isKupongModalOpen ? 'Stäng kupong' : 'Visa ifylld bong'}
          title={isKupongModalOpen ? 'Stäng kupong' : 'Visa ifylld bong'}
          className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-30 w-14 h-14 rounded-full p-1 bg-white hover:bg-slate-50 shadow-2xl border-2 border-amber-400 active:scale-95 transition-all cursor-pointer flex items-center justify-center group"
        >
          <img
            src={`${import.meta.env.BASE_URL ?? './'}bong.png`}
            alt="Bong"
            className="w-full h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
          />
        </button>
      )}

      {isKupongModalOpen && systemResult && (
        <BongKupongModal
          isOpen={isKupongModalOpen}
          onClose={() => setIsKupongModalOpen(false)}
          raceDay={raceDay}
          selectedHorses={couponSelectedHorses}
          gameType={gameType}
          costSek={systemResult.costSek}
        />
      )}
    </div>
  );
};
