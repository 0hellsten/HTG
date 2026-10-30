import React, { useState } from 'react';
import type { SourceStatus } from '@stallbacken/shared';

interface FarskhetsPrickProps {
  status: SourceStatus;
  ageMinutes?: number;
  explanation?: string;
  onRetry?: () => void;
}

export const FarskhetsPrick: React.FC<FarskhetsPrickProps> = ({
  status,
  ageMinutes,
  explanation,
  onRetry,
}) => {
  const [open, setOpen] = useState(false);

  let dotColor = 'bg-emerald-500';
  let labelText = '';

  if (status === 'stale') {
    dotColor = 'bg-amber-400';
    labelText =
      ageMinutes !== undefined
        ? `Uppdaterat för ${ageMinutes} minuter sedan`
        : 'Lite äldre uppgifter';
  } else if (status === 'degraded') {
    dotColor = 'bg-amber-400';
    labelText = 'Delvis uppdaterat';
  } else if (status === 'failed') {
    dotColor = 'bg-slate-400';
    labelText = 'Uppdateras inte just nu';
  }

  const defaultExplanation =
    status === 'failed'
      ? 'Uppgifterna går inte att nå för tillfället. Resten av sidan fungerar som vanligt.'
      : status === 'stale'
        ? 'Informationen är inte helt ny men visar det senast kända läget.'
        : 'Allt är färskt och uppdaterat.';

  return (
    <div className="relative inline-flex flex-col items-start text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 py-2 px-2.5 -mx-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer min-h-[44px]"
        aria-label="Visa information om uppgifternas färskhet"
      >
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full transition-transform ${dotColor} ${
            open ? 'scale-125' : ''
          }`}
          aria-hidden="true"
        />
        {labelText && <span className="text-sm text-slate-500 font-normal">{labelText}</span>}
      </button>

      {open && (
        <div className="mt-1 p-3 bg-white border border-slate-200 rounded-lg shadow-sm text-sm text-slate-700 max-w-xs z-20">
          <p className="mb-2.5 leading-relaxed">{explanation || defaultExplanation}</p>
          {onRetry && (
            <button
              type="button"
              onClick={() => {
                onRetry();
                setOpen(false);
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg transition-colors min-h-[44px] cursor-pointer"
            >
              Försök igen
            </button>
          )}
        </div>
      )}
    </div>
  );
};
