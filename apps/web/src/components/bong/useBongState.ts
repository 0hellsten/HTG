import { useState, useMemo, useEffect } from 'react';
import {
  BongEngine,
  BongGameType,
  BongRaceDayData,
  CouponSelection,
  HorseRank,
  ReductionConditions,
  SourceStatus,
} from '@stallbacken/shared';
import { BongCompetition, formatCompetitionFromApi, buildFallbackBongRaceDay } from './competitions';
import { apiFetch } from '../../lib/api';

export function useBongState(
  initialGameType?: BongGameType,
  initialSelectedHorses?: Record<number, string[]>
) {
  const [competitions, setCompetitions] = useState<BongCompetition[]>([]);
  const [selectedCompId, setSelectedCompId] = useState<string>('');
  const [gameType, setGameType] = useState<BongGameType>(initialGameType || 'V75');
  const [activeLegIndex, setActiveLegIndex] = useState<number>(0);
  const [raceDay, setRaceDay] = useState<BongRaceDayData>(() =>
    buildFallbackBongRaceDay(initialGameType || 'V75')
  );
  const [status, setStatus] = useState<SourceStatus>('ok');
  const [fetchedAt, setFetchedAt] = useState<string>(new Date().toISOString());

  const [selectedHorses, setSelectedHorses] = useState<Record<number, string[]>>(() => {
    if (initialSelectedHorses) return initialSelectedHorses;
    return {};
  });

  const [ranks, setRanks] = useState<Record<string, HorseRank>>({});

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

  useEffect(() => {
    let isSubscribed = true;

    async function loadUpcoming() {
      const res = await apiFetch<Array<{
        id: string;
        gameType: BongGameType;
        gameName: string;
        date: string;
        trackName: string;
        startTime: string;
        turnover: number;
        jackpotPool: number;
      }>>('/api/omganger/kommande');

      if (!isSubscribed) return;

      if (res.data && res.data.length > 0) {
        const formatted = res.data.map(formatCompetitionFromApi);
        setCompetitions(formatted);
        const match = initialGameType
          ? formatted.find((c) => c.gameType === initialGameType) || formatted[0]
          : formatted[0];
        if (match) {
          setSelectedCompId(match.id);
          setGameType(match.gameType);
          loadGame(match.id, match.gameType);
        }
      }
    }

    loadUpcoming();
    return () => {
      isSubscribed = false;
    };
  }, [initialGameType]);

  async function loadGame(gameId: string, gType: BongGameType) {
    const res = await apiFetch<BongRaceDayData>(`/api/omganger/${gameId}`);
    if (res.data) {
      setRaceDay(res.data);
      setStatus(res.status);
      setFetchedAt(res.fetchedAt);

      if (!initialSelectedHorses) {
        const newSel: Record<number, string[]> = {};
        const newRanks: Record<string, HorseRank> = {};
        res.data.races.forEach((r, idx) => {
          const h1 = r.horses[0]?.id;
          const h2 = r.horses[1]?.id;
          newSel[idx] = [h1, h2].filter(Boolean) as string[];
          if (h1) newRanks[h1] = 'A';
          if (h2) newRanks[h2] = 'B';
        });
        setSelectedHorses(newSel);
        setRanks(newRanks);
      }
    } else {
      setRaceDay(buildFallbackBongRaceDay(gType));
      setStatus(res.status);
      setFetchedAt(res.fetchedAt);
    }
  }

  const handleSelectCompetition = (comp: BongCompetition) => {
    setSelectedCompId(comp.id);
    setGameType(comp.gameType);
    setActiveLegIndex(0);
    loadGame(comp.id, comp.gameType);
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
    const legsCount = raceDay.races.length || (gameType === 'V75' ? 7 : 8);
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
      setSaveMessage('Bongen har sparats i webbläsaren');
      setTimeout(() => setSaveMessage(null), 2500);
    } catch {
      setSaveMessage('Kunde inte spara');
    }
  };

  return {
    competitions,
    selectedDateIso: selectedCompId,
    gameType,
    activeLegIndex,
    setActiveLegIndex,
    raceDay,
    status,
    fetchedAt,
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
