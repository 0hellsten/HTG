import React, { useState, useEffect } from 'react';
import { Calendar, Search, Award, Star, Menu, Download, Calculator, Wand2 } from 'lucide-react';
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
import { MerScreen } from './screens/MerScreen';
import { OfflineRemsa } from './components/OfflineRemsa';

type Tab = 'idag' | 'janneboy' | 'bong' | 'hastar' | 'tips' | 'stall' | 'mer';
type MerSubscreen = 'none' | 'status' | 'hjalp' | 'textstorlek';

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
    if (tab === 'idag') setSelectedRaceId(null);
  };

  const handleOpenJanneBoyInBong = (type: BongGameType, horses: Record<number, string[]>) => {
    setBongInitialGameType(type);
    setBongInitialHorses(horses);
    setActiveTab('bong');
  };

  const navItems = [
    { id: 'idag' as Tab, label: 'Idag', mobileLabel: 'Idag', icon: Calendar },
    { id: 'janneboy' as Tab, label: 'Janne Boy', mobileLabel: 'Janne', icon: Wand2 },
    { id: 'bong' as Tab, label: 'Bong-maskinen', mobileLabel: 'Bongen', icon: Calculator },
    { id: 'hastar' as Tab, label: 'Hästar', mobileLabel: 'Hästar', icon: Search },
    { id: 'tips' as Tab, label: 'Tips', mobileLabel: 'Tips', icon: Award },
    { id: 'stall' as Tab, label: 'Mitt stall', mobileLabel: 'Mitt stall', icon: Star },
    { id: 'mer' as Tab, label: 'Mer', mobileLabel: 'Mer', icon: Menu },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans">
      {/* Laptop: Vänstermeny */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 text-slate-100 p-6 border-r border-slate-800 shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center font-black text-slate-950 text-xl shadow-inner font-serif tracking-normal">
            T
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white block">Tangitza</span>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1" aria-label="Huvudmeny">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-base font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {installPrompt && (
          <button
            onClick={handleInstallClick}
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Installera app</span>
          </button>
        )}

        <div className="pt-6 mt-auto border-t border-slate-800/80 text-center">
          <span className="text-[10px] font-mono tracking-widest text-slate-500/70 select-none block">
            HTG™ Hellstens Trav &amp; Galopp
          </span>
        </div>
      </aside>

      {/* Huvudinnehåll */}
      <div className="flex-1 flex flex-col min-w-0">
        <OfflineRemsa />

        {/* Mobil: Topprad */}
        <header className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-amber-500 flex items-center justify-center font-black text-slate-950 text-sm font-serif shadow-inner">
              T
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white block leading-tight">
                Tangitza
              </span>
            </div>
          </div>

          {installPrompt && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-slate-950 rounded-md text-sm font-semibold shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Installera</span>
            </button>
          )}
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          {selectedHorseId ? (
            <HastScreen horseId={selectedHorseId} onBack={() => setSelectedHorseId(null)} />
          ) : selectedTrackId ? (
            <BanvisarenScreen
              initialTrackId={selectedTrackId}
              onBack={() => setSelectedTrackId(null)}
            />
          ) : merSubscreen === 'status' ? (
            <StatusScreen onBack={() => setMerSubscreen('none')} />
          ) : merSubscreen === 'hjalp' ? (
            <HjalpScreen onBack={() => setMerSubscreen('none')} />
          ) : merSubscreen === 'textstorlek' ? (
            <TextstorlekScreen
              currentSize={textSize}
              onSelectSize={(size) => setTextSize(size)}
              onBack={() => setMerSubscreen('none')}
            />
          ) : activeTab === 'idag' ? (
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
              />
            )
          ) : activeTab === 'janneboy' ? (
            <JanneBoyScreen onOpenInBong={handleOpenJanneBoyInBong} />
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
                if (opt === 'banvisaren') setSelectedTrackId('1');
                else setMerSubscreen(opt);
              }}
            />
          ) : null}
        </main>

        {/* Mobil: Bottennavigering */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around z-30 px-1 py-1 shadow-lg"
          aria-label="Mobil bottenmeny"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-md transition-colors min-h-[44px] cursor-pointer ${
                  isActive ? 'text-amber-600 font-semibold' : 'text-slate-500'
                }`}
              >
                <Icon
                  className={`w-5 h-5 mb-0.5 shrink-0 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`}
                />
                <span className="text-[10px] font-medium leading-none truncate max-w-full">
                  {item.mobileLabel || item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
