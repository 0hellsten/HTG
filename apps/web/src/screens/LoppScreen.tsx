import React, { useEffect, useState } from 'react';
import { ArrowLeft, Scale, Award, TrendingUp } from 'lucide-react';
import { Race, Start, SourceStatus, ApiResponse } from '@stallbacken/shared';
import { FarskhetsPrick } from '../components/FarskhetsPrick';
import { BlockErrorBoundary } from '../components/BlockErrorBoundary';
import { LoppSkelett } from '../components/SkelettKort';
import { StartlistaTabell } from '../components/StartlistaTabell';
import { formatDistance, formatStartMethod } from '../lib/format';

interface LoppScreenProps {
  raceId: string;
  onBack: () => void;
  onSelectRace?: (raceId: string) => void;
  siblingRaces?: Race[];
}

export const LoppScreen: React.FC<LoppScreenProps> = ({
  raceId,
  onBack,
  onSelectRace,
  siblingRaces = [],
}) => {
  const [race, setRace] = useState<Race | null>(null);
  const [starts, setStarts] = useState<Start[]>([]);
  const [status, setStatus] = useState<SourceStatus>('ok');
  const [statusMessage, setStatusMessage] = useState<string>('Allt är färskt och uppdaterat.');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRaceData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lopp/${raceId}`);
      const json: ApiResponse<{ race: Race; starts: Start[] }> = await res.json();
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

  useEffect(() => {
    fetchRaceData();
  }, [raceId]);

  const raceNumber = race?.number || '–';
  const distanceStr = formatDistance(race?.distanceM);
  const methodStr = formatStartMethod(race?.startMethod);
  const startTimeStr = race?.scheduledStart ? race.scheduledStart.slice(11, 16) : '–';
  const purseStr = race?.purse || '–';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Tillbaka-knapp och loppväljare */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-950 font-medium text-base py-2.5 px-2 -mx-2 rounded-lg transition-colors min-h-[44px] cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 shrink-0" />
          <span>Tillbaka till dagens omgång</span>
        </button>

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
          {/* Kolumn 1 (vänster, bredare på laptop): Lopphuvud + Startlista */}
          <div className="lg:col-span-8 space-y-6">
            {/* Rubrikrad för loppet */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-1">
                    {race?.trackName || 'Bana'}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
                    Lopp {raceNumber} · {distanceStr} · {methodStr}
                  </h1>
                  {race?.name && (
                    <p className="text-base sm:text-lg font-medium text-slate-700 mt-1">
                      {race.name}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm sm:text-base text-slate-600 mt-2.5">
                    <span>Start kl. {startTimeStr}</span>
                    <span>·</span>
                    <span>Förstapris: {purseStr}</span>
                    {race?.trackCondition && (
                      <>
                        <span>·</span>
                        <span>{race.trackCondition}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  <FarskhetsPrick
                    status={status}
                    explanation={statusMessage}
                    onRetry={fetchRaceData}
                  />
                </div>
              </div>

              {race?.terms && (
                <div className="mt-4 pt-3.5 border-t border-slate-100 text-sm text-slate-500 leading-relaxed">
                  {race.terms}
                </div>
              )}
            </div>

            {/* Block 1: Startlista skyddat av felgräns */}
            <BlockErrorBoundary
              fallbackTitle="Startlistan saknas just nu"
              onRetry={fetchRaceData}
            >
              <section className="space-y-3" aria-labelledby="startlista-rubrik">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <h2 id="startlista-rubrik" className="text-xl font-bold text-slate-900">
                      Startlista
                    </h2>
                    <FarskhetsPrick
                      status={status}
                      explanation="Startlistan är från 17:30. Kuskbyten efter det kan saknas."
                      onRetry={fetchRaceData}
                    />
                  </div>
                  <span className="text-sm text-slate-500 font-medium">
                    {starts.length} ekipage
                  </span>
                </div>

                <StartlistaTabell starts={starts} />
              </section>
            </BlockErrorBoundary>
          </div>

          {/* Kolumn 2 (höger på laptop, under på mobil): Odds, Tips, Jämför */}
          <div className="lg:col-span-4 space-y-6">
            {/* Block 2: Odds och streck (isolerat block med egen prick) */}
            <BlockErrorBoundary fallbackTitle="Odds och streck">
              <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-600 shrink-0" />
                    <h2 className="text-lg font-bold text-slate-900">
                      Odds och streck
                    </h2>
                  </div>
                  <FarskhetsPrick
                    status="failed"
                    explanation="Oddsen uppdateras inte just nu. Allt annat på sidan är färskt."
                  />
                </div>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Den här uppgiften saknas just nu.
                </p>
              </section>
            </BlockErrorBoundary>

            {/* Block 3: Vad tycker stallbacken? (tipsblock med egen prick) */}
            <BlockErrorBoundary fallbackTitle="Vad tycker stallbacken?">
              <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-600 shrink-0" />
                    <h2 className="text-lg font-bold text-slate-900">
                      Vad tycker stallbacken?
                    </h2>
                  </div>
                  <FarskhetsPrick
                    status="failed"
                    explanation="Tipsen är från i morse. De brukar komma in på nytt vid lunch."
                  />
                </div>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Inga tips har kommit in för det här loppet än.
                </p>
              </section>
            </BlockErrorBoundary>

            {/* Block 4: Knapp för att jämföra hästarna */}
            <div>
              <button
                type="button"
                className="w-full min-h-[48px] flex items-center justify-center gap-2.5 py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-base transition-colors shadow-sm cursor-pointer"
              >
                <Scale className="w-5 h-5 shrink-0" />
                <span>Ställ dem mot varandra</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
