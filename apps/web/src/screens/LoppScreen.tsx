import React, { useEffect, useState } from 'react';
import { ArrowLeft, Scale } from 'lucide-react';
import {
  Race,
  Start,
  SourceStatus,
  ApiResponse,
  RaceOddsData,
  RaceTipsData,
} from '@stallbacken/shared';
import { FarskhetsPrick } from '../components/FarskhetsPrick';
import { BlockErrorBoundary } from '../components/BlockErrorBoundary';
import { LoppSkelett } from '../components/SkelettKort';
import { StartlistaTabell, HorseOddsMap } from '../components/StartlistaTabell';
import { OddsOchStreckBlock } from '../components/OddsOchStreckBlock';
import { JamforScreen } from './JamforScreen';
import { LoppHeaderCard } from '../components/lopp/LoppHeaderCard';
import { LoppTipsBlock } from '../components/lopp/LoppTipsBlock';
import { apiFetch } from '../lib/api';

interface LoppScreenProps {
  raceId: string;
  onBack: () => void;
  onBackToTips?: () => void;
  onSelectRace?: (raceId: string) => void;
  onSelectHorse?: (horseId: string) => void;
  onOpenTrack?: (trackId: string) => void;
  siblingRaces?: Race[];
}

export const LoppScreen: React.FC<LoppScreenProps> = ({
  raceId,
  onBack,
  onBackToTips,
  onSelectRace,
  onSelectHorse,
  onOpenTrack,
  siblingRaces = [],
}) => {
  const [race, setRace] = useState<Race | null>(null);
  const [starts, setStarts] = useState<Start[]>([]);
  const [status, setStatus] = useState<SourceStatus>('ok');
  const [statusMessage, setStatusMessage] = useState<string>('Allt är färskt och uppdaterat.');
  const [loading, setLoading] = useState<boolean>(true);

  const [oddsData, setOddsData] = useState<RaceOddsData | null>(null);
  const [oddsStatus, setOddsStatus] = useState<SourceStatus>('ok');
  const [oddsMessage, setOddsMessage] = useState<string>(
    'Oddsen uppdateras inte just nu. Allt annat på sidan är färskt.'
  );

  const [tipsData, setTipsData] = useState<RaceTipsData | null>(null);
  const [tipsStatus, setTipsStatus] = useState<SourceStatus>('ok');
  const [tipsMessage, setTipsMessage] = useState<string>('Tipsen är färska.');

  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const fetchRaceData = async () => {
    setLoading(true);
    try {
      const json: ApiResponse<{ race: Race; starts: Start[] }> = await apiFetch<{
        race: Race;
        starts: Start[];
      }>(`/api/lopp/${raceId}`);
      if (json && json.data) {
        setRace(json.data.race);
        setStarts(json.data.starts);
        setStatus(json.status);
        setStatusMessage(json.message);
      } else {
        setStatus('failed');
        setStatusMessage('Uppgifterna uppdateras inte just nu.');
      }
    } catch {
      setStatus('failed');
      setStatusMessage('Uppgifterna uppdateras inte just nu.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOddsData = async () => {
    try {
      const isSimulateDown =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('simulateOddsDown') === 'true';

      const queryParam = isSimulateDown ? '?simulateDown=true' : '';
      const json: ApiResponse<RaceOddsData | null> = await apiFetch<RaceOddsData | null>(
        `/api/lopp/${raceId}/odds${queryParam}`
      );

      if (json && json.data) {
        setOddsData(json.data);
        setOddsStatus(json.status);
        setOddsMessage(json.message || 'Allt är färskt och uppdaterat.');
      } else {
        setOddsData(null);
        setOddsStatus('failed');
        setOddsMessage('Oddsen uppdateras inte just nu. Allt annat på sidan är färskt.');
      }
    } catch {
      setOddsData(null);
      setOddsStatus('failed');
      setOddsMessage('Oddsen uppdateras inte just nu. Allt annat på sidan är färskt.');
    }
  };

  const fetchTipsData = async () => {
    try {
      const json: ApiResponse<RaceTipsData> = await apiFetch<RaceTipsData>(
        `/api/lopp/${raceId}/tips`
      );
      if (json && json.data) {
        setTipsData(json.data);
        setTipsStatus(json.status);
        setTipsMessage(json.message);
      } else {
        setTipsData(null);
        setTipsStatus('failed');
        setTipsMessage('Tipsen är från i morse. De brukar komma in på nytt vid lunch.');
      }
    } catch {
      setTipsData(null);
      setTipsStatus('failed');
      setTipsMessage('Tipsen är från i morse. De brukar komma in på nytt vid lunch.');
    }
  };

  useEffect(() => {
    fetchRaceData();
    fetchOddsData();
    fetchTipsData();
    setSelectedForCompare([]);
  }, [raceId]);

  const handleToggleCompare = (horseId: string) => {
    if (selectedForCompare.includes(horseId)) {
      setSelectedForCompare(selectedForCompare.filter((id) => id !== horseId));
    } else {
      if (selectedForCompare.length >= 6) return;
      setSelectedForCompare([...selectedForCompare, horseId]);
    }
  };

  if (isComparing) {
    return (
      <JamforScreen
        raceId={raceId}
        initialHorseIds={selectedForCompare}
        onBack={() => setIsComparing(false)}
        onSelectHorse={onSelectHorse}
      />
    );
  }

  const oddsMap: HorseOddsMap = {};
  if (oddsData?.odds && oddsStatus !== 'failed') {
    for (const o of oddsData.odds) {
      oddsMap[o.startNumber] = {
        winOdds: o.winOdds,
        placeOdds: o.placeOdds,
        stakePercent: o.stakePercent,
      };
    }
  }

  const sortedByStake =
    oddsData?.odds && oddsStatus !== 'failed'
      ? [...oddsData.odds]
          .filter((o) => typeof o.stakePercent === 'number' && (o.stakePercent || 0) > 0)
          .sort((a, b) => (b.stakePercent || 0) - (a.stakePercent || 0))
      : [];
  const topStaked = sortedByStake.length > 0 ? sortedByStake[0] : null;
  const favoriteHorse = topStaked
    ? {
        ...topStaked,
        name:
          starts.find((s) => s.startNumber === topStaked.startNumber)?.horseName ||
          `Häst ${topStaked.startNumber}`,
      }
    : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {onBackToTips && (
            <button
              type="button"
              onClick={onBackToTips}
              className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-950 font-bold text-base py-2 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors min-h-[44px] cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-5 h-5 shrink-0" />
              <span>Tillbaka till tips</span>
            </button>
          )}

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-950 font-medium text-base py-2 px-2.5 rounded-lg transition-colors min-h-[44px] cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 shrink-0" />
            <span>Tillbaka till dagens omgång</span>
          </button>
        </div>

        {siblingRaces.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {siblingRaces.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelectRace && onSelectRace(r.id)}
                className={`min-h-[44px] px-3.5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  r.id === raceId
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Lopp {r.number}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && <LoppSkelett />}

      {!loading && (
        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <LoppHeaderCard
              race={race}
              raceId={raceId}
              status={status}
              statusMessage={statusMessage}
              onOpenTrack={onOpenTrack}
              onRetry={fetchRaceData}
            />

            <BlockErrorBoundary fallbackTitle="Startlistan saknas just nu" onRetry={fetchRaceData}>
              <section className="space-y-3" aria-labelledby="startlista-rubrik">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <h2 id="startlista-rubrik" className="text-xl font-bold text-slate-900">
                      Startlista
                    </h2>
                    <FarskhetsPrick
                      status={status}
                      explanation={statusMessage || 'Startlistan är uppdaterad.'}
                      onRetry={fetchRaceData}
                    />
                  </div>
                  <span className="text-sm text-slate-500 font-medium">
                    {starts.length} ekipage
                  </span>
                </div>

                <StartlistaTabell
                  starts={starts}
                  oddsMap={oddsMap}
                  oddsTimestamp={oddsData?.timeFormatted}
                  oddsStatus={oddsStatus}
                  selectedForCompare={selectedForCompare}
                  onToggleCompare={handleToggleCompare}
                  onSelectHorse={onSelectHorse}
                />
              </section>
            </BlockErrorBoundary>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <OddsOchStreckBlock
              oddsData={oddsData}
              oddsStatus={oddsStatus}
              oddsMessage={oddsMessage}
              starts={starts}
              favoriteHorse={favoriteHorse}
              onRetry={fetchOddsData}
            />

            <LoppTipsBlock
              tipsData={tipsData}
              tipsStatus={tipsStatus}
              tipsMessage={tipsMessage}
              onRetry={fetchTipsData}
            />

            <div>
              <button
                type="button"
                onClick={() => setIsComparing(true)}
                className="w-full min-h-[48px] flex items-center justify-center gap-2.5 py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-base transition-colors shadow-sm cursor-pointer"
              >
                <Scale className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  Ställ dem mot varandra
                  {selectedForCompare.length > 0 ? ` (${selectedForCompare.length} valda)` : ''}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedForCompare.length >= 2 && !loading && (
        <aside aria-label="Jämförelseval" className="lg:hidden fixed bottom-16 left-4 right-4 z-20">
          <button
            type="button"
            onClick={() => setIsComparing(true)}
            className="w-full min-h-[48px] py-3 px-4 bg-slate-950 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2.5 shadow-2xl border border-amber-500/40 cursor-pointer"
          >
            <Scale className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Ställ dem mot varandra ({selectedForCompare.length} valda)</span>
          </button>
        </aside>
      )}
    </div>
  );
};
