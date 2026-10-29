import { useState, useMemo, useEffect } from 'react';
import {
  BongEngine,
  BongGameType,
  BongRaceDayData,
  CouponSelection,
  HorseRank,
  ReductionConditions,
} from '@stallbacken/shared';
import { BongCompetition, getUpcomingBongCompetitions } from './competitions';
import { buildDefaultRaceDay, buildRaceDayFromCompetition } from './defaultRaceDay';

const STORAGE_SESSION_KEY = 'stallbacken_active_bong_session';

export function useBongState(
  initialGameType?: BongGameType,
  initialSelectedHorses?: Record<number, string[]>
) {
  const competitions = useMemo(() => getUpcomingBongCompetitions(), []);

  const initialComp = useMemo(() => {
    if (initialGameType) {
      const match = competitions.find((c) => c.gameType === initialGameType);
      if (match) return match;
    }
    return competitions[0];
  }, [competitions, initialGameType]);

  const [selectedDateIso, setSelectedDateIso] = useState<string>(
    () => initialComp?.dateIso || new Date().toISOString().slice(0, 10)
  );
  const [gameType, setGameType] = useState<BongGameType>(
    initialComp?.gameType || initialGameType || 'V75'
  );
  const [activeLegIndex, setActiveLegIndex] = useState<number>(0);
  const [raceDay, setRaceDay] = useState<BongRaceDayData>(() =>
    initialComp
      ? buildRaceDayFromCompetition(initialComp)
      : buildDefaultRaceDay(initialGameType || 'V75')
  );

  const [selectedHorses, setSelectedHorses] = useState<Record<number, string[]>>(() => {
    if (initialSelectedHorses) return initialSelectedHorses;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const saved = sessionStorage.getItem(STORAGE_SESSION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.selectedHorses) return parsed.selectedHorses;
        }
      } catch {}
    }
    return {
      0: ['h_0_1', 'h_0_2'],
      1: ['h_1_1', 'h_1_2', 'h_1_3'],
      2: ['h_2_1'],
      3: ['h_3_1', 'h_3_2'],
      4: ['h_4_1', 'h_4_2', 'h_4_3', 'h_4_4'],
      5: ['h_5_1'],
      6: ['h_6_1', 'h_6_2', 'h_6_3'],
    };
  });

  const [ranks, setRanks] = useState<Record<string, HorseRank>>(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const saved = sessionStorage.getItem(STORAGE_SESSION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.ranks) return parsed.ranks;
        }
      } catch {}
    }
    return {
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
    };
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

  // Spara aktivt tillstånd i sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.setItem(
          STORAGE_SESSION_KEY,
          JSON.stringify({ gameType, selectedHorses, ranks })
        );
      } catch {}
    }
  }, [gameType, selectedHorses, ranks]);

  const handleSelectCompetition = (comp: BongCompetition) => {
    setSelectedDateIso(comp.dateIso);
    setGameType(comp.gameType);
    setActiveLegIndex(0);
    setRaceDay(buildRaceDayFromCompetition(comp));

    const newSel: Record<number, string[]> = {};
    const newRanks: Record<string, HorseRank> = {};
    const count = comp.gameType === 'V75' ? 7 : 8;
    for (let l = 0; l < count; l++) {
      newSel[l] = [`h_${l}_1`, `h_${l}_2`];
      newRanks[`h_${l}_1`] = 'A';
      newRanks[`h_${l}_2`] = 'B';
    }
    setSelectedHorses(newSel);
    setRanks(newRanks);
  };

  const handleToggleHorse = (horseId: string, legIdx = activeLegIndex) => {
    setSelectedHorses((prev) => {
      const current = prev[legIdx] || [];
      const exists = current.includes(horseId);
      const updated = exists ? current.filter((id) => id !== horseId) : [...current, horseId];
      return { ...prev, [legIdx]: updated };
    });
    if (!ranks[horseId]) {
      setRanks((prev) => ({ ...prev, [horseId]: 'A' }));
    }
  };

  const handleSetRank = (horseId: string, rank: HorseRank) => {
    setRanks((prev) => ({ ...prev, [horseId]: rank }));
  };

  const handleClearLeg = (legIdx = activeLegIndex) => {
    setSelectedHorses((prev) => ({ ...prev, [legIdx]: [] }));
  };

  const handleResetCoupon = () => {
    const legsCount = gameType === 'V75' ? 7 : 8;
    const emptySel: Record<number, string[]> = {};
    for (let l = 0; l < legsCount; l++) emptySel[l] = [];
    setSelectedHorses(emptySel);
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

  return {
    competitions,
    selectedDateIso,
    gameType,
    activeLegIndex,
    setActiveLegIndex,
    raceDay,
    selectedHorses,
    ranks,
    onlyTopPool,
    flerbongMultiplier,
    sharesCount,
    showFilters,
    setShowFilters,
    minA,
    setMinA,
    maxA,
    setMaxA,
    maxC,
    setMaxC,
    maxD,
    setMaxD,
    minStrecksumma,
    setMinStrecksumma,
    maxStrecksumma,
    setMaxStrecksumma,
    minPayout,
    setMinPayout,
    copied,
    saveMessage,
    calculationResult,
    handleSelectCompetition,
    handleToggleHorse,
    handleSetRank,
    handleClearLeg,
    handleResetCoupon,
    handleCopyRows,
    handleDownloadFile,
    handleSaveBong,
    setOnlyTopPool,
    setFlerbongMultiplier,
    setSharesCount,
  };
}
