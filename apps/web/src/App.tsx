import React, { useState, useEffect } from 'react';
import { Calendar, Search, Award, Star, Menu, Download } from 'lucide-react';
import { Race } from '@stallbacken/shared';
import { IdagScreen } from './screens/IdagScreen';
import { LoppScreen } from './screens/LoppScreen';

type Tab = 'idag' | 'hastar' | 'tips' | 'stall' | 'mer';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('idag');
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [siblingRaces, setSiblingRaces] = useState<Race[]>([]);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'idag') {
      setSelectedRaceId(null);
    }
  };

  const navItems = [
    { id: 'idag' as Tab, label: 'Idag', icon: Calendar },
    { id: 'hastar' as Tab, label: 'Hästar', icon: Search },
    { id: 'tips' as Tab, label: 'Tips', icon: Award },
    { id: 'stall' as Tab, label: 'Mitt stall', icon: Star },
    { id: 'mer' as Tab, label: 'Mer', icon: Menu },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans">
      {/* Laptop: Vänstermeny */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 text-slate-100 p-6 border-r border-slate-800 shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-base shadow-inner tracking-wider">
            HTG
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white block">
              HTG
            </span>
            <span className="text-xs text-slate-400 block font-normal">
              Hellstens Trav och Galopp
            </span>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-base font-medium transition-colors ${
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
      </aside>

      {/* Huvudinnehåll */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobil: Topprad */}
        <header className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-xs tracking-wider">
              HTG
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block leading-tight">
                HTG
              </span>
              <span className="text-[10px] text-slate-400 block font-normal leading-none">
                Hellstens Trav och Galopp
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

        {/* Vy-yta */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-5xl w-full mx-auto pb-24 lg:pb-10">
          {activeTab === 'idag' && (
            selectedRaceId ? (
              <LoppScreen
                raceId={selectedRaceId}
                onBack={() => setSelectedRaceId(null)}
                onSelectRace={(id) => setSelectedRaceId(id)}
                siblingRaces={siblingRaces}
              />
            ) : (
              <IdagScreen
                onOpenRace={(raceId, siblings) => {
                  setSelectedRaceId(raceId);
                  setSiblingRaces(siblings);
                }}
              />
            )
          )}

          {activeTab !== 'idag' && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-lg mx-auto mt-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                {navItems.find((n) => n.id === activeTab)?.label}
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Den här delen kopplas in i en kommande fas enligt planen.
              </p>
            </div>
          )}
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
                className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-md transition-colors ${
                  isActive ? 'text-amber-600 font-semibold' : 'text-slate-500'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
