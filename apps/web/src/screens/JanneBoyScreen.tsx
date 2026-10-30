import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Wand2, Sparkles, RefreshCw, Radio, MapPin, Calendar, TrendingUp } from 'lucide-react';
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
import { BongCompetition, getUpcomingBongCompetitions } from '../components/bong/competitions';
import { BongDateSelector } from '../components/bong/BongDateSelector';
import { buildDefaultRaceDay, buildRaceDayFromCompetition } from '../components/bong/defaultRaceDay';

interface JanneBoyScreenProps {
  onOpenInBong: (gameType: BongGameType, selectedHorses: Record<number, string[]>) => void;
}

export const JanneBoyScreen: React.FC<JanneBoyScreenProps> = ({ onOpenInBong }) => {
  const competitions = useMemo(() => getUpcomingBongCompetitions(), []);

  const [selectedDateIso, setSelectedDateIso] = useState<string>(
    () => competitions[0]?.dateIso || new Date().toISOString().slice(0, 10)
  );
  const [gameType, setGameType] = useState<BongGameType>(() => competitions[0]?.gameType || 'V75');
  const [strategy, setStrategy] = useState<JanneBoyStrategy>('balanserad');
  const [budget, setBudget] = useState<number>(100);
  const [lockedHorses, setLockedHorses] = useState<Record<number, string[]>>({});
  const [isLive, setIsLive] = useState<boolean>(false);
  const [loadingLive, setLoadingLive] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const engine = useMemo(() => new JanneBoyEngine(), []);
  const [raceDay, setRaceDay] = useState<BongRaceDayData>(() =>
    competitions[0] ? buildRaceDayFromCompetition(competitions[0]) : buildDefaultRaceDay('V75')
  );

  const [systemResult, setSystemResult] = useState<JanneBoySystemResult | null>(() => {
    const initialRd = competitions[0]
      ? buildRaceDayFromCompetition(competitions[0])
      : buildDefaultRaceDay('V75');
    const config: JanneBoyConfig = {
      gameType: competitions[0]?.gameType || 'V75',
      strategy: 'balanserad',
      budget: 100,
    };
    return engine.generate(initialRd, config);
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
    if (competitions[0]?.isToday) {
      loadLiveOmgang(gameType, strategy, budget, lockedHorses);
    }
  }, []);

  const handleSelectCompetition = (comp: BongCompetition) => {
    setSelectedDateIso(comp.dateIso);
    setGameType(comp.gameType);
    setLockedHorses({});

    if (comp.isToday) {
      loadLiveOmgang(comp.gameType, strategy, budget, {});
    } else {
      const newRaceDay = buildRaceDayFromCompetition(comp);
      setRaceDay(newRaceDay);
      setIsLive(false);
    }
  };

  const handleGenerate = async () => {
    if (isCalculating) return;
    setIsCalculating(true);
    // Fördröjning mellan 0,5 sek och 1,5 sek för naturlig betänketid
    const delayMs = Math.floor(Math.random() * 600) + 600;
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    const config: JanneBoyConfig = { gameType, strategy, budget, lockedHorses };
    setSystemResult(engine.generate(raceDay, config));
    setIsCalculating(false);
  };

  const handleSelectStrategy = (newStrat: JanneBoyStrategy) => {
    setStrategy(newStrat);
  };

  const handleChangeBudget = (newBudget: number) => {
    setBudget(newBudget);
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
              {raceDay.trackName} · {raceDay.date || 'Vald omgång'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const currentComp = competitions.find((c) => c.dateIso === selectedDateIso);
              if (currentComp?.isToday) {
                loadLiveOmgang(gameType, strategy, budget, lockedHorses);
              } else if (currentComp) {
                handleSelectCompetition(currentComp);
              } else {
                handleGenerate();
              }
            }}
            disabled={loadingLive}
            title="Uppdatera underlag"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLive ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dragbar tävlings- och datumväljare (likt Bong-maskinen) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
          <span>Kommande tävlingar (dra för att se längre fram)</span>
          <span className="text-slate-600 text-[11px] font-medium">14 dagar framåt</span>
        </div>

        <BongDateSelector
          competitions={competitions}
          selectedDateIso={selectedDateIso}
          onSelectCompetition={handleSelectCompetition}
        />
      </div>

      {/* Omgångsinformation för vald tävling */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white rounded-xl px-4 py-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-medium">
          <span className="flex items-center gap-1.5 font-bold text-amber-400">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>{raceDay.trackName || 'Bana ej vald'}</span>
          </span>

          <span className="flex items-center gap-1.5 text-slate-200">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>
              {raceDay.date ? `${raceDay.date} · ` : ''}
              {raceDay.startTime ? `Start kl. ${raceDay.startTime}` : ''}
            </span>
          </span>

          <span className="text-xs text-slate-400">({raceDay.races.length} avdelningar)</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
          <span className="inline-flex items-center gap-1 text-slate-300">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            <span>Omsättning: {raceDay.turnover.toLocaleString('sv-SE')} kr</span>
          </span>

          {Boolean(raceDay.jackpotPool && raceDay.jackpotPool > 0) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs">
              <Sparkles className="w-3 h-3 text-slate-950" />
              <span>Jackpot +{(raceDay.jackpotPool || 0).toLocaleString('sv-SE')} kr</span>
            </span>
          )}
        </div>
      </div>

      {/* Kontroller för spel, profil & budget */}
      <JanneBoyControls
        gameType={gameType}
        racesCount={raceDay.races.length}
        trackName={raceDay.trackName}
        strategy={strategy}
        budget={budget}
        isCalculating={isCalculating}
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
