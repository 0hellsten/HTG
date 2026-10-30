import React from 'react';
import { Race, SourceStatus } from '@stallbacken/shared';
import { FarskhetsPrick } from '../FarskhetsPrick';
import { formatDistance, formatStartMethod } from '../../lib/format';

interface LoppHeaderCardProps {
  race: Race | null;
  raceId: string;
  status: SourceStatus;
  statusMessage: string;
  onOpenTrack?: (trackId: string) => void;
  onRetry: () => void;
}

export const LoppHeaderCard: React.FC<LoppHeaderCardProps> = ({
  race,
  raceId,
  status,
  statusMessage,
  onOpenTrack,
  onRetry,
}) => {
  const raceNumber = race?.number || '–';
  const distanceStr = formatDistance(race?.distanceM);
  const methodStr = formatStartMethod(race?.startMethod);
  const startTimeStr = race?.scheduledStart ? race.scheduledStart.slice(11, 16) : '–';
  const purseStr = race?.purse || '–';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          {onOpenTrack ? (
            <button
              type="button"
              onClick={() => {
                const trackId = raceId.split('_')[1] || '1';
                onOpenTrack(trackId);
              }}
              className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-1 hover:text-amber-900 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{race?.trackName || 'Bana'}</span>
              <span className="text-xs font-normal text-slate-500 normal-case underline ml-1">
                Visa Banvisaren &rarr;
              </span>
            </button>
          ) : (
            <div className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-1">
              {race?.trackName || 'Bana'}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            Lopp {raceNumber} · {distanceStr} · {methodStr}
          </h1>
          {race?.name && (
            <p className="text-base sm:text-lg font-medium text-slate-700 mt-1">{race.name}</p>
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
          <FarskhetsPrick status={status} explanation={statusMessage} onRetry={onRetry} />
        </div>
      </div>

      {race?.terms && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 text-sm text-slate-500 leading-relaxed">
          {race.terms}
        </div>
      )}
    </div>
  );
};
