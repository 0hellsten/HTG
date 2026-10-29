import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Wand2, Sparkles, RefreshCw, Radio } from 'lucide-react';
import {
  BongGameType,
  BongRaceDayData,
  JanneBoyConfig,
  JanneBoyEngine,
  JanneBoyStrategy,
  JanneBoySystemResult,
} from '@stallbacken/shared';
import { JanneBoyControls } from '../components/janne-boy/JanneBoyControls';
import { JanneBoySystemView } from '../components/janne-boy/JanneBoySystemView';
import { buildDefaultRaceDay } from '../components/bong/defaultRaceDay';

interface JanneBoyScreenProps {
  onOpenInBong: (gameType: BongGameType, selectedHorses: Record<number, string[]>) => void;
}

export const JanneBoyScreen: React.FC<JanneBoyScreenProps> = ({ onOpenInBong }) => {
  const [gameType, setGameType] = useState<BongGameType>('V75');
  const [strategy, setStrategy] = useState<JanneBoyStrategy>('balanserad');
  const [budget, setBudget] = useState<number>(100);
  const [lockedHorses, setLockedHorses] = useState<Record<number, string[]>>({});
  const [isLive, setIsLive] = useState<boolean>(false);
  const [loadingLive, setLoadingLive] = useState<boolean>(false);

  const engine = useMemo(() => new JanneBoyEngine(), []);
  const [raceDay, setRaceDay] = useState<BongRaceDayData>(() => buildDefaultRaceDay('V75'));

  const [systemResult, setSystemResult] = useState<JanneBoySystemResult | null>(() => {
    const config: JanneBoyConfig = { gameType: 'V75', strategy: 'balanserad', budget: 100 };
    return engine.generate(buildDefaultRaceDay('V75'), config);
  });

  const loadLiveOmgang = useCallback(
    async (
      type: BongGameType,
      currentStrat: JanneBoyStrategy,
      currentBudget: number,
      locks: Record<number, string[]>
    ) => {
      try {
        setLoadingLive(true);
        const res = await fetch(`/api/janne-boy/omgang?gameType=${type}`);
        const json = await res.json();
        if (json.data) {
          setRaceDay(json.data);
          setIsLive(Boolean(json.isLive));
          const config: JanneBoyConfig = {
            gameType: type,
            strategy: currentStrat,
            budget: currentBudget,
            lockedHorses: locks,
          };
          setSystemResult(engine.generate(json.data, config));
        }
      } catch {
        // Behåll befintligt underlag vid nätverksbortfall
      } finally {
        setLoadingLive(false);
      }
    },
    [engine]
  );

  useEffect(() => {
    loadLiveOmgang(gameType, strategy, budget, lockedHorses);
  }, []);

  const handleGenerate = () => {
    const config: JanneBoyConfig = { gameType, strategy, budget, lockedHorses };
    setSystemResult(engine.generate(raceDay, config));
  };

  const handleSelectGameType = (newType: BongGameType) => {
    setGameType(newType);
    setLockedHorses({});
    loadLiveOmgang(newType, strategy, budget, {});
  };

  const handleSelectStrategy = (newStrat: JanneBoyStrategy) => {
    setStrategy(newStrat);
    const config: JanneBoyConfig = { gameType, strategy: newStrat, budget, lockedHorses };
    setSystemResult(engine.generate(raceDay, config));
  };

  const handleChangeBudget = (newBudget: number) => {
    setBudget(newBudget);
    const config: JanneBoyConfig = { gameType, strategy, budget: newBudget, lockedHorses };
    setSystemResult(engine.generate(raceDay, config));
  };

  const handleToggleLock = (legIndex: number, horseId: string) => {
    setLockedHorses((prev) => {
      const current = prev[legIndex] || [];
      const isCurrentlyLocked = current.includes(horseId);
      const updated = isCurrentlyLocked ? [] : [horseId];
      const newLocked = { ...prev, [legIndex]: updated };

      const config: JanneBoyConfig = { gameType, strategy, budget, lockedHorses: newLocked };
      setSystemResult(engine.generate(raceDay, config));
      return newLocked;
    });
  };

  const handleOpenInBong = (sys: JanneBoySystemResult) => {
    const selectionMap: Record<number, string[]> = {};
    for (const leg of sys.legs) {
      selectionMap[leg.legIndex] = leg.selectedHorses.map((h) => h.id);
    }
    onOpenInBong(sys.gameType, selectionMap);
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Sidhuvud med live API-status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500 text-slate-950 shadow-xs">
              <Wand2 className="w-6 h-6 stroke-[2.2]" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
              <span>Janne Boy</span>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </h1>
          </div>
          <p className="text-slate-600 text-sm sm:text-base mt-1.5 leading-relaxed">
            Superintelligent kupongmotor baserad på djup travkunskap, spårstatistik, balans och
            sannolikhetslära.
          </p>
        </div>

        {/* Live-statusremsa */}
        <div className="flex items-center gap-2.5 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs shrink-0 shadow-2xs">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <div className="leading-tight">
            <span className="font-bold text-slate-800 block flex items-center gap-1">
              <Radio className="w-3 h-3 text-slate-500" />
              <span>{isLive ? 'Färska live-odds från ATG' : 'Kvalitetssäkrat travunderlag'}</span>
            </span>
            <span className="text-[10px] text-slate-500">
              {raceDay.trackName} · {raceDay.date || 'Idag'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => loadLiveOmgang(gameType, strategy, budget, lockedHorses)}
            disabled={loadingLive}
            title="Hämta senaste live-odds"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLive ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Kontroller för spel, profil & budget */}
      <JanneBoyControls
        gameType={gameType}
        strategy={strategy}
        budget={budget}
        onSelectGameType={handleSelectGameType}
        onSelectStrategy={handleSelectStrategy}
        onChangeBudget={handleChangeBudget}
        onGenerate={handleGenerate}
      />

      {/* Kupongresultat */}
      {systemResult && (
        <JanneBoySystemView
          system={systemResult}
          lockedHorses={lockedHorses}
          onToggleLock={handleToggleLock}
          onRegenerate={handleGenerate}
          onOpenInBong={handleOpenInBong}
        />
      )}
    </div>
  );
};
