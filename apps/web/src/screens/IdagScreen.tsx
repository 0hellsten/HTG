import React, { useEffect, useState } from 'react';
import { FarskhetsPrick } from '../components/FarskhetsPrick';
import { formatSwedishDate, isEvening } from '../lib/date';
import type { SourceStatus } from '@stallbacken/shared';

export const IdagScreen: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<SourceStatus>('ok');
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    // Kontrollera anslutning mot backend enligt Fas 1
    fetch('/halsa')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.ok) {
          setIsReady(true);
          setConnectionStatus('ok');
        } else {
          setConnectionStatus('degraded');
        }
      })
      .catch(() => {
        setConnectionStatus('failed');
      });
  }, []);

  const heading = isEvening() ? 'Kvällens omgång' : 'Dagens omgång';
  const todayFormatted = formatSwedishDate();

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Rubrikrad med datum och färskhetsprick */}
      <div className="flex items-start justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {heading}
          </h1>
          <p className="text-base text-slate-600 mt-0.5 capitalize">
            {todayFormatted}
          </p>
        </div>
        <div className="pt-1">
          <FarskhetsPrick
            status={connectionStatus}
            explanation={
              connectionStatus === 'ok'
                ? 'Allt är färskt och i full gång.'
                : 'Uppgifterna uppdateras inte just nu. Senast sparade uppgifter visas.'
            }
          />
        </div>
      </div>

      {/* Lugnt välkomstkort och status i Fas 1 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-xl font-semibold text-slate-900">
            Stallbacken är igång
          </h2>
        </div>

        <p className="text-slate-700 leading-relaxed text-base sm:text-lg mb-4">
          Allt är på plats för att börja hämta dagens banor, lopp och startlistor i Fas 3.
        </p>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-sm text-slate-600 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-800">Status:</span>
            <span className={isReady ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
              {isReady ? 'I full gång' : 'Söker kontakt...'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-800">Spelformer i fokus:</span>
            <span>V75 · V86 · Dagens Dubbel</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-800">Installationsläge:</span>
            <span>Redo för hemskärm på mobil och dator</span>
          </div>
        </div>
      </div>

      {/* Kort som visar strukturen för en tävlingsdag */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Kommande omgångar
        </h3>
        <p className="text-slate-600 text-base leading-relaxed">
          I nästa fas kopplar vi in tävlingskalendern. Då visas dagens och kvällens banor här
          som stora, lugna kort med första start, antal lopp och väder.
        </p>
      </div>
    </div>
  );
};
