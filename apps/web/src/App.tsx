import React, { useState, useEffect } from 'react';
import { Race, BongGameType } from '@stallbacken/shared';
import { IdagScreen } from './screens/IdagScreen';
import { LoppScreen } from './screens/LoppScreen';
import { HastScreen } from './screens/HastScreen';
import { HastarScreen } from './screens/HastarScreen';
import { BongScreen } from './screens/BongScreen';
import { JanneBoyScreen } from './screens/JanneBoyScreen';
import { TipsScreen } from './screens/TipsScreen';
import { BanvisarenScreen } from './screens/BanvisarenScreen';
import { StallScreen } from './screens/StallScreen';
import { StatusScreen } from './screens/StatusScreen';
import { TextstorlekScreen, TextSize } from './screens/TextstorlekScreen';
import { HjalpScreen } from './screens/HjalpScreen';
import { OmAppenScreen } from './screens/OmAppenScreen';
import { MerScreen } from './screens/MerScreen';
import { OfflineRemsa } from './components/OfflineRemsa';
import { ScrollToTopKnapp } from './components/ScrollToTopKnapp';
import { InfoModal } from './components/InfoModal';
import { Tab } from './components/navigation/navItems';
import { DesktopSidebar } from './components/navigation/DesktopSidebar';
import { MobileDrawer } from './components/navigation/MobileDrawer';
import { MobileHeader } from './components/navigation/MobileHeader';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';

type MerSubscreen = 'none' | 'om' | 'status' | 'hjalp' | 'textstorlek' | 'banvisaren';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('idag');
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [selectedHorseId, setSelectedHorseId] = useState<string | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [raceOriginTab, setRaceOriginTab] = useState<'tips' | null>(null);
  const [merSubscreen, setMerSubscreen] = useState<MerSubscreen>('none');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [siblingRaces, setSiblingRaces] = useState<Race[]>([]);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [bongInitialGameType, setBongInitialGameType] = useState<BongGameType>('V75');
  const [bongInitialHorses, setBongInitialHorses] = useState<
    Record<number, string[]> | undefined
  >();

  const [textSize, setTextSize] = useState<TextSize>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('stallbacken_text_size');
      if (saved === 'stor' || saved === 'extra') return saved;
    }
    return 'normal';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove(
        'text-size-normal',
        'text-size-stor',
        'text-size-extra'
      );
      document.documentElement.classList.add(`text-size-${textSize}`);
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('stallbacken_text_size', textSize);
    }
  }, [textSize]);

  useEffect(() => {
    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstallPrompt(null);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSelectedHorseId(null);
    setSelectedTrackId(null);
    setMerSubscreen('none');
    setRaceOriginTab(null);
    setIsMobileDrawerOpen(false);
    if (tab === 'idag') setSelectedRaceId(null);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleOpenOm = () => {
    setMerSubscreen('om');
    setIsMobileDrawerOpen(false);
  };

  const handleOpenJanneBoyInBong = (type: BongGameType, horses: Record<number, string[]>) => {
    setBongInitialGameType(type);
    setBongInitialHorses(horses);
    setActiveTab('bong');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col lg:flex-row font-sans">
      <DesktopSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenOm={handleOpenOm}
      />

      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        activeTab={activeTab}
        onClose={() => setIsMobileDrawerOpen(false)}
        onTabChange={handleTabChange}
        onOpenOm={handleOpenOm}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <OfflineRemsa />

        <MobileHeader
          onOpenDrawer={() => setIsMobileDrawerOpen(true)}
          onOpenOm={handleOpenOm}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          {activeTab === 'idag' ? (
            selectedRaceId ? (
              <LoppScreen
                raceId={selectedRaceId}
                siblingRaces={siblingRaces}
                onBack={() => {
                  setSelectedRaceId(null);
                  setRaceOriginTab(null);
                }}
                onBackToTips={
                  raceOriginTab === 'tips'
                    ? () => {
                        setSelectedRaceId(null);
                        setRaceOriginTab(null);
                        setActiveTab('tips');
                      }
                    : undefined
                }
                onSelectRace={(newRaceId) => setSelectedRaceId(newRaceId)}
                onSelectHorse={(horseId) => setSelectedHorseId(horseId)}
              />
            ) : (
              <IdagScreen
                onOpenRace={(raceId, siblings) => {
                  setSelectedRaceId(raceId);
                  setSiblingRaces(siblings);
                }}
                onOpenTrack={(trackId) => setSelectedTrackId(trackId)}
                onSelectHorse={(id) => setSelectedHorseId(id)}
              />
            )
          ) : activeTab === 'janneboy' ? (
            <JanneBoyScreen
              onOpenInBong={handleOpenJanneBoyInBong}
              onSelectHorse={(id) => setSelectedHorseId(id)}
            />
          ) : activeTab === 'bong' ? (
            <BongScreen
              initialGameType={bongInitialGameType}
              initialSelectedHorses={bongInitialHorses}
              onSelectHorse={(id) => setSelectedHorseId(id)}
            />
          ) : activeTab === 'hastar' ? (
            <HastarScreen onSelectHorse={(id) => setSelectedHorseId(id)} />
          ) : activeTab === 'tips' ? (
            <TipsScreen
              onOpenRace={(raceId) => {
                setSelectedRaceId(raceId);
                setRaceOriginTab('tips');
                setActiveTab('idag');
              }}
            />
          ) : activeTab === 'stall' ? (
            <StallScreen
              onSelectHorse={(id) => setSelectedHorseId(id)}
              onSelectTrack={(id) => setSelectedTrackId(id)}
              onSelectRace={(raceId) => {
                setSelectedRaceId(raceId);
                setActiveTab('idag');
              }}
              onGoToSearchHorses={() => setActiveTab('hastar')}
            />
          ) : activeTab === 'mer' ? (
            <MerScreen
              onSelectOption={(opt) => {
                setMerSubscreen(opt);
              }}
            />
          ) : null}
        </main>

        <ScrollToTopKnapp />

        <MobileBottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Pop-out modaler för infosidor */}
        <InfoModal
          isOpen={merSubscreen === 'om'}
          onClose={() => setMerSubscreen('none')}
          title="Om appen & vad allt gör"
        >
          <OmAppenScreen
            onBack={() => setMerSubscreen('none')}
            onInstall={handleInstallClick}
            canInstall={!!installPrompt}
          />
        </InfoModal>

        <InfoModal
          isOpen={merSubscreen === 'status'}
          onClose={() => setMerSubscreen('none')}
          title="Hur färskt är det här?"
        >
          <StatusScreen onBack={() => setMerSubscreen('none')} />
        </InfoModal>

        <InfoModal
          isOpen={merSubscreen === 'hjalp'}
          onClose={() => setMerSubscreen('none')}
          title="Hjälp och vanliga frågor"
        >
          <HjalpScreen onBack={() => setMerSubscreen('none')} />
        </InfoModal>

        <InfoModal
          isOpen={merSubscreen === 'textstorlek'}
          onClose={() => setMerSubscreen('none')}
          title="Textstorlek"
        >
          <TextstorlekScreen
            currentSize={textSize}
            onSelectSize={(size) => setTextSize(size)}
            onBack={() => setMerSubscreen('none')}
          />
        </InfoModal>

        <InfoModal
          isOpen={merSubscreen === 'banvisaren' || !!selectedTrackId}
          onClose={() => {
            setMerSubscreen('none');
            setSelectedTrackId(null);
          }}
          title="Banvisaren"
        >
          <BanvisarenScreen
            initialTrackId={selectedTrackId || '1'}
            onBack={() => {
              setMerSubscreen('none');
              setSelectedTrackId(null);
            }}
          />
        </InfoModal>

        <InfoModal
          isOpen={!!selectedHorseId}
          onClose={() => setSelectedHorseId(null)}
          title="Hästens form & tidigare lopp"
        >
          {selectedHorseId && (
            <HastScreen
              horseId={selectedHorseId}
              onBack={() => setSelectedHorseId(null)}
            />
          )}
        </InfoModal>
      </div>
    </div>
  );
};
