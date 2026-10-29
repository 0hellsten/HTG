import React, { useState, useMemo } from 'react';
import {
  BongEngine,
  BongGameType,
  BongRaceDayData,
  CouponSelection,
  HorseRank,
  ReductionConditions,
} from '@stallbacken/shared';
import { BongOmgangHeader } from '../components/bong/BongOmgangHeader';
import { BongSummaryCard } from '../components/bong/BongSummaryCard';
import { BongLegTabs } from '../components/bong/BongLegTabs';
import { BongLegHorseList } from '../components/bong/BongLegHorseList';
import { BongFilters } from '../components/bong/BongFilters';
import { BongSettings } from '../components/bong/BongSettings';
import { buildDefaultRaceDay } from '../components/bong/defaultRaceDay';

interface BongScreenProps {
  initialGameType?: BongGameType;
  initialSelectedHorses?: Record<number, string[]>;
}

export const BongScreen: React.FC<BongScreenProps> = ({
  initialGameType,
  initialSelectedHorses,
}) => {
  const [gameType, setGameType] = useState<BongGameType>(initialGameType || 'V75');
  const [activeLegIndex, setActiveLegIndex] = useState<number>(0);
  const [raceDay, setRaceDay] = useState<BongRaceDayData>(() =>
    buildDefaultRaceDay(initialGameType || 'V75')
  );

  const [selectedHorses, setSelectedHorses] = useState<Record<number, string[]>>(
    () =>
      initialSelectedHorses || {
        0: ['h_0_1', 'h_0_2'],
        1: ['h_1_1', 'h_1_2', 'h_1_3'],
        2: ['h_2_1'],
        3: ['h_3_1', 'h_3_2'],
        4: ['h_4_1', 'h_4_2', 'h_4_3', 'h_4_4'],
        5: ['h_5_1'],
        6: ['h_6_1', 'h_6_2', 'h_6_3'],
      }
  );

  const [ranks, setRanks] = useState<Record<string, HorseRank>>({
    h_0_1: 'A',
    h_0_2: 'B',
    h_1_1: 'A',
    h_1_2: 'B',
    h_1_3: 'C',
    h_2_1: 'A',
    h_3_1: 'A',
    h_3_2: 'B',
    h_4_1: 'A',
    h_4_2: 'B',
    h_4_3: 'C',
    h_4_4: 'C',
    h_5_1: 'A',
    h_6_1: 'A',
    h_6_2: 'B',
    h_6_3: 'C',
  });

  const [onlyTopPool, setOnlyTopPool] = useState<boolean>(false);
  const [flerbongMultiplier, setFlerbongMultiplier] = useState<number>(1);
  const [sharesCount, setSharesCount] = useState<number>(1);

  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [minA, setMinA] = useState<number>(2);
  const [maxA, setMaxA] = useState<number>(5);
  const [maxC, setMaxC] = useState<number>(2);
  const [maxD, setMaxD] = useState<number>(0);
  const [minStrecksumma, setMinStrecksumma] = useState<number>(140);
  const [maxStrecksumma, setMaxStrecksumma] = useState<number>(320);
  const [minPayout, setMinPayout] = useState<number>(5000);

  const [copied, setCopied] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleGameTypeChange = (newType: BongGameType) => {
    setGameType(newType);
    setActiveLegIndex(0);
    setRaceDay(buildDefaultRaceDay(newType));
    const newSel: Record<number, string[]> = {};
    const newRanks: Record<string, HorseRank> = {};
    const count = newType === 'V75' ? 7 : 8;
    for (let l = 0; l < count; l++) {
      newSel[l] = [`h_${l}_1`, `h_${l}_2`];
      newRanks[`h_${l}_1`] = 'A';
      newRanks[`h_${l}_2`] = 'B';
    }
    setSelectedHorses(newSel);
    setRanks(newRanks);
  };

  const handleToggleHorse = (horseId: string) => {
    setSelectedHorses((prev) => {
      const current = prev[activeLegIndex] || [];
      const exists = current.includes(horseId);
      const updated = exists ? current.filter((id) => id !== horseId) : [...current, horseId];
      return { ...prev, [activeLegIndex]: updated };
    });
    if (!ranks[horseId]) {
      setRanks((prev) => ({ ...prev, [horseId]: 'A' }));
    }
  };

  const engine = useMemo(() => new BongEngine(gameType), [gameType]);

  const calculationResult = useMemo(() => {
    const legsCount = gameType === 'V75' ? 7 : 8;
    const legs = Array.from({ length: legsCount }, (_, legIdx) => ({
      legIndex: legIdx,
      selectedHorseIds: selectedHorses[legIdx] || [],
      ranks,
      reserves: 'AUTO' as const,
    }));

    const conditions: ReductionConditions = {};
    if (showFilters) {
      conditions.abcd = [
        { rank: 'A', min: minA, max: maxA },
        { rank: 'C', max: maxC },
        { rank: 'D', max: maxD },
      ];
      if (minStrecksumma > 0 || maxStrecksumma < 400) {
        conditions.strecksumma = { minSum: minStrecksumma, maxSum: maxStrecksumma };
      }
      if (minPayout > 0) {
        conditions.payout = { minPayout };
      }
    }

    const selection: CouponSelection = {
      legs,
      conditions,
      settings: { onlyTopPool, flerbongMultiplier, sharesCount },
    };

    return engine.calculate(raceDay, selection);
  }, [
    engine,
    gameType,
    raceDay,
    selectedHorses,
    ranks,
    showFilters,
    minA,
    maxA,
    maxC,
    maxD,
    minStrecksumma,
    maxStrecksumma,
    minPayout,
    onlyTopPool,
    flerbongMultiplier,
    sharesCount,
  ]);

  const handleCopyRows = () => {
    const exported = engine.exportToStandardFormat(calculationResult);
    navigator.clipboard.writeText(exported.toCsv());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const exported = engine.exportToStandardFormat(calculationResult);
    const blob = new Blob([exported.toAtgFilformat()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${gameType}_system_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveBong = () => {
    try {
      const saved = { gameType, selectedHorses, ranks, date: new Date().toISOString() };
      localStorage.setItem(`stallbacken_saved_bong_${gameType}`, JSON.stringify(saved));
      setSaveMessage('Bongen har sparats i webbläsaren!');
      setTimeout(() => setSaveMessage(null), 2500);
    } catch {
      setSaveMessage('Kunde inte spara.');
    }
  };

  const currentLeg = raceDay.races[activeLegIndex] || {
    legIndex: activeLegIndex,
    horses: [],
  };

  return (
    <div className="space-y-6 pb-20">
      <BongOmgangHeader
        gameType={gameType}
        raceDay={raceDay}
        onSelectGameType={handleGameTypeChange}
      />

      <BongSummaryCard
        calculationResult={calculationResult}
        flerbongMultiplier={flerbongMultiplier}
        sharesCount={sharesCount}
        onlyTopPool={onlyTopPool}
        gameType={gameType}
        copied={copied}
        saveMessage={saveMessage}
        onCopyRows={handleCopyRows}
        onDownloadFile={handleDownloadFile}
        onSaveBong={handleSaveBong}
      />

      <BongLegTabs
        races={raceDay.races}
        selectedHorses={selectedHorses}
        activeLegIndex={activeLegIndex}
        onSelectLeg={setActiveLegIndex}
      />

      <BongLegHorseList
        leg={currentLeg}
        selectedIds={selectedHorses[activeLegIndex] || []}
        ranks={ranks}
        onToggleHorse={handleToggleHorse}
        onSetRank={(horseId, rank) => setRanks((prev) => ({ ...prev, [horseId]: rank }))}
        onClearLeg={() => setSelectedHorses((prev) => ({ ...prev, [activeLegIndex]: [] }))}
      />

      <BongFilters
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        minA={minA}
        maxA={maxA}
        maxC={maxC}
        maxD={maxD}
        minPayout={minPayout}
        minStrecksumma={minStrecksumma}
        maxStrecksumma={maxStrecksumma}
        onChangeMinA={setMinA}
        onChangeMaxA={setMaxA}
        onChangeMaxC={setMaxC}
        onChangeMaxD={setMaxD}
        onChangeMinPayout={setMinPayout}
        onChangeMinStrecksumma={setMinStrecksumma}
        onChangeMaxStrecksumma={setMaxStrecksumma}
      />

      <BongSettings
        gameType={gameType}
        onlyTopPool={onlyTopPool}
        flerbongMultiplier={flerbongMultiplier}
        sharesCount={sharesCount}
        histogram={calculationResult.payoutDistribution.histogram}
        hasReducedRows={calculationResult.reducedRows > 0}
        onChangeOnlyTopPool={setOnlyTopPool}
        onChangeFlerbongMultiplier={setFlerbongMultiplier}
        onChangeSharesCount={setSharesCount}
        onResetCoupon={() => {
          const legsCount = gameType === 'V75' ? 7 : 8;
          const emptySel: Record<number, string[]> = {};
          for (let l = 0; l < legsCount; l++) emptySel[l] = [];
          setSelectedHorses(emptySel);
        }}
      />
    </div>
  );
};
