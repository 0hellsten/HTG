import React, { useEffect, useState } from 'react';
import { ArrowLeft, Scale, Award } from 'lucide-react';
import { Race, Start, SourceStatus, ApiResponse } from '@stallbacken/shared';
import { FarskhetsPrick } from '../components/FarskhetsPrick';
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
        setStatusMessage('Uppgifterna för loppet kunde inte hämtas.');
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
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Tillbaka-knapp och loppväljare */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-950 font-medium text-base py-2 px-1 -mx-1 rounded transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Tillbaka till dagens omgång</span>
        </button>

        {siblingRaces.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {siblingRaces.map((r) => (
              <button
                key={r.id}
                onClick={() => onSelectRace && onSelectRace(r.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                  r.id === raceId
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Lopp {r.number}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Rubrikrad för loppet */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-amber-700 mb-1">
              {race?.trackName || 'Bana'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              Lopp {raceNumber} · {distanceStr} · {methodStr}
            </h1>
            {race?.name && (
              <p className="text-base font-medium text-slate-600 mt-1">
                {race.name}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 mt-2">
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
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-500">
            {race.terms}
          </div>
        )}
      </div>

      {/* Block 1: Startlista */}
      <section className="space-y-3" aria-labelledby="startlista-rubrik">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 id="startlista-rubrik" className="text-xl font-bold text-slate-900">
              Startlista
            </h2>
            <FarskhetsPrick
              status={status}
              explanation="Startlistan hämtas från ATG Tävlingsinfo och hålls uppdaterad med strykningar och skoändringar."
              onRetry={fetchRaceData}
            />
          </div>
          <span className="text-sm text-slate-500 font-medium">
            {starts.length} ekipage
          </span>
        </div>

        {loading ? (
          <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-slate-500">
            Hämtar lopp och startlista...
          </div>
        ) : (
          <StartlistaTabell starts={starts} />
        )}
      </section>

      {/* Block 2: Odds och streck (isolerat block med egen prick) */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Odds och streck</h2>
            <FarskhetsPrick
              status="failed"
              explanation="Oddsen uppdateras inte just nu. Allt annat på sidan är färskt."
            />
          </div>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed">
          Den här uppgiften saknas just nu. Oddsen kopplas in i Fas 4 och visas då med vinnarodds och streckprocent per häst.
        </p>
      </section>

      {/* Block 3: Vad tycker stallbacken? (tipsblock med egen prick) */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">Vad tycker stallbacken?</h2>
            <FarskhetsPrick
              status="failed"
              explanation="Tipsen är från i morse. De brukar komma in på nytt vid lunch."
            />
          </div>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed">
          Den här uppgiften saknas just nu. Redaktionella tips från externa tipsgivare publiceras här när de blir tillgängliga.
        </p>
      </section>

      {/* Block 4: Knapp för att jämföra hästarna */}
      <div className="pt-2">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-base transition-colors shadow-sm"
        >
          <Scale className="w-5 h-5" />
          <span>Ställ dem mot varandra</span>
        </button>
      </div>
    </div>
  );
};
