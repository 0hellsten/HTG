import React, { useState } from 'react';
import { BongGameType, BongHorseInput } from '@stallbacken/shared';
import { BongOmgangHeader } from '../components/bong/BongOmgangHeader';
import { BongSummaryCard } from '../components/bong/BongSummaryCard';
import { BongLegTabs } from '../components/bong/BongLegTabs';
import { BongLegHorseList } from '../components/bong/BongLegHorseList';
import { BongFilters } from '../components/bong/BongFilters';
import { BongSettings } from '../components/bong/BongSettings';
import { BongHorseInfoModal } from '../components/bong/BongHorseInfoModal';
import { BongKupongModal } from '../components/bong/BongKupongModal';
import { useBongState } from '../components/bong/useBongState';

interface BongScreenProps {
  initialGameType?: BongGameType;
  initialSelectedHorses?: Record<number, string[]>;
  onSelectHorse?: (horseId: string) => void;
}

export const BongScreen: React.FC<BongScreenProps> = ({
  initialGameType,
  initialSelectedHorses,
  onSelectHorse,
}) => {
  const {
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
  } = useBongState(initialGameType, initialSelectedHorses);

  const [selectedModalHorse, setSelectedModalHorse] = useState<BongHorseInput | null>(null);
  const [isKupongModalOpen, setIsKupongModalOpen] = useState(false);

  const currentLeg = raceDay.races[activeLegIndex] || {
    legIndex: activeLegIndex,
    horses: [],
  };

  const isModalHorseSelected = selectedModalHorse
    ? (selectedHorses[activeLegIndex] || []).includes(selectedModalHorse.id)
    : false;

  const modalHorseRank = selectedModalHorse ? ranks[selectedModalHorse.id] || 'A' : 'A';

  return (
    <div className="space-y-6 pb-20">
      <BongOmgangHeader
        raceDay={raceDay}
        competitions={competitions}
        selectedDateIso={selectedDateIso}
        onSelectCompetition={handleSelectCompetition}
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
        onSetRank={handleSetRank}
        onClearLeg={() => handleClearLeg(activeLegIndex)}
        onOpenHorseInfo={(horse) => setSelectedModalHorse(horse)}
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
        onResetCoupon={handleResetCoupon}
      />

      <BongHorseInfoModal
        horse={selectedModalHorse}
        leg={currentLeg}
        isOpen={!!selectedModalHorse}
        isSelected={isModalHorseSelected}
        currentRank={modalHorseRank}
        onClose={() => setSelectedModalHorse(null)}
        onToggleHorse={handleToggleHorse}
        onSetRank={handleSetRank}
        onOpenFullHorse={onSelectHorse}
      />

      {}
      <button
        type="button"
        onClick={() => setIsKupongModalOpen((prev) => !prev)}
        data-testid="bong-kupong-flytande-knapp"
        aria-label={isKupongModalOpen ? 'Stäng kupong' : 'Visa ifylld bong'}
        title={isKupongModalOpen ? 'Stäng kupong' : 'Visa ifylld bong'}
        className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-30 w-14 h-14 rounded-full p-1 bg-white hover:bg-slate-50 shadow-2xl border-2 border-amber-400 active:scale-95 transition-all cursor-pointer flex items-center justify-center group"
      >
        <img
          src="./bong.png"
          alt="Bong"
          className="w-full h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
        />
      </button>

      <BongKupongModal
        isOpen={isKupongModalOpen}
        onClose={() => setIsKupongModalOpen(false)}
        gameType={gameType}
        raceDay={raceDay}
        selectedHorses={selectedHorses}
        costSek={calculationResult.totalCost}
      />
    </div>
  );
};
