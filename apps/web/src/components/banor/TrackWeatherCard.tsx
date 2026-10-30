import React from 'react';
import { CloudSun } from 'lucide-react';
import { TrackWeather, SourceStatus } from '@stallbacken/shared';
import { FarskhetsPrick } from '../FarskhetsPrick';
import { BlockErrorBoundary } from '../BlockErrorBoundary';

interface TrackWeatherCardProps {
  weather: TrackWeather | null;
  status: SourceStatus;
  message: string;
  onRetry: () => void;
}

export const TrackWeatherCard: React.FC<TrackWeatherCardProps> = ({
  weather,
  status,
  message,
  onRetry,
}) => {
  return (
    <BlockErrorBoundary fallbackTitle="Vädret går inte att hämta">
      <section
        className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-3 flex flex-col justify-between"
        aria-labelledby="vader-rubrik"
      >
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-amber-600 shrink-0" />
              <h2 id="vader-rubrik" className="text-lg font-bold text-slate-950">
                Väder vid banan
              </h2>
            </div>
            <FarskhetsPrick status={status} explanation={message} onRetry={onRetry} />
          </div>

          {status === 'failed' || !weather ? (
            <div className="py-6 text-center text-slate-500 text-base">
              Vädret går inte att hämta just nu.
            </div>
          ) : (
            <div className="py-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-950">
                  {weather.tempC > 0 ? `+${weather.tempC}` : weather.tempC} °C
                </span>
                <span className="text-base font-semibold text-slate-700">
                  {weather.description}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600 pt-2 border-t border-slate-100">
                <span>Vind: {weather.windMs} m/s</span>
                {weather.precipMm > 0 ? (
                  <span>Nederbörd: {weather.precipMm} mm</span>
                ) : (
                  <span>Uppehåll</span>
                )}
              </div>
            </div>
          )}
        </div>

        <span className="text-xs text-slate-400 block pt-2 border-t border-slate-100">
          Källa: SMHI
        </span>
      </section>
    </BlockErrorBoundary>
  );
};
