import React from 'react';
import { ArrowLeft, BookOpen, Calendar, Calculator, Search, Award, Star, Compass, Activity, Download, Trophy } from 'lucide-react';
import { JanneBoyIcon } from '../components/janne-boy/JanneBoyIcon';

interface OmAppenScreenProps {
  onBack: () => void;
  onInstall?: () => void;
  canInstall?: boolean;
}

export const OmAppenScreen: React.FC<OmAppenScreenProps> = ({
  onBack,
  onInstall,
  canInstall,
}) => {
  const pagesGuide = [
    {
      title: 'Idag',
      label: 'Dagens tävlingar & lopp',
      icon: Calendar,
      description:
        'Här ser du alla travbanor som kör idag och deras lopp med starttider. Klicka på ett lopp för att se startlistan, vinnarodds, kusk, distans och hästarnas skor.',
    },
    {
      title: 'Dagens bästa',
      label: 'Bästa hästarna lopp för lopp',
      icon: Trophy,
      description:
        'Matchdagsguiden! Här går vi igenom varje lopp och lyfter fram de bästa hästarna (bästa chansen, motbud och skräll) tillsammans med konkreta travmotiveringar om spår, skor, form och spelvärde.',
    },
    {
      title: 'Janne Boy',
      label: 'Färdiga kupongförslag',
      customIcon: true,
      description:
        'Janne hjälper dig att ta fram ett färdigt kupongförslag på ett ögonblick. Välj bara hur mycket du vill spela för (till exempel 50 eller 100 kr) och vilken typ av kupong du vill ha.',
    },
    {
      title: 'Bong-maskinen',
      label: 'Bygg egna kuponger & reducera',
      icon: Calculator,
      description:
        'Här sätter du ihop din egen kupong för V75 och V86. Du kan välja dina hästar själv eller trycka på "Snabbkupong" för att få ett snabbt förslag. Här ser du direkt vad kupongen kostar.',
    },
    {
      title: 'Hästar',
      label: 'Sök hästar & se topplistor',
      icon: Search,
      description:
        'Slå upp valfri häst för att se tidigare starter, tider, intjänade pengar och galopphistorik. Här finns även topplistor för landets bästa varmblod och kallblod.',
    },
    {
      title: 'Tips',
      label: 'Vad tycker stallbacken?',
      icon: Award,
      description:
        'Samlade tips, lopprankingar och analyser från de stora travsidorna. Du kan läsa artiklarna direkt och öppna loppen med ett tryck.',
    },
    {
      title: 'Mitt stall',
      label: 'Dina sparade favoriter',
      icon: Star,
      description:
        'Dina egna favorithästar, favoritbanor och kuskar. När någon av dina favoriter startar idag tänds en grön skylt så att du inte missar loppet.',
    },
    {
      title: 'Banvisaren',
      label: 'Fakta om banorna & väder',
      icon: Compass,
      description:
        'Här ser du längd på upploppet, vilket startspår som oftast vinner på respektive bana samt aktuellt väder vid banan inför start.',
    },
    {
      title: 'Hur färskt är det här?',
      label: 'Färskhetsstatus & uppdatera',
      icon: Activity,
      description:
        'Här ser du när odds, tips och startlistor senast hämtades. Med ett tryck på "Uppdatera allt" hämtas allting på nytt direkt.',
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] min-w-[44px] inline-flex items-center gap-2 text-slate-700 hover:text-slate-950 font-semibold py-2 px-3 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Tillbaka</span>
        </button>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-amber-600 shrink-0" />
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            Om appen &amp; vad allt gör
          </h1>
        </div>
        <p className="text-base text-slate-700 leading-relaxed">
          Stallbacken samlar allt du behöver veta om dagens trav på ett lugnt och enkelt sätt. Inga
          konstiga ord, ingen reklam och inga krångliga menyer. Här nedanför ser du vad de olika
          delarna i appen gör:
        </p>
      </div>

      {/* Nedladdning av Android-app */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <Download className="w-5 h-5 text-amber-400" />
              <span>Ladda ned Android-app (.apk)</span>
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Färdig installationsfil för Android-telefoner. Kan skickas eller laddas ned direkt till telefonen.
            </p>
          </div>
          <a
            href="./Stallbacken.apk"
            download="Stallbacken.apk"
            className="min-h-[46px] px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm sm:text-base inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shrink-0 no-underline"
          >
            <Download className="w-4 h-4" />
            <span>Ladda ned app (.apk)</span>
          </a>
        </div>
        <p className="text-xs text-slate-400 border-t border-slate-800 pt-3">
          Öppna filen på Android-telefonen och tryck på "Installera" för att få Stallbacken direkt bland dina appar.
        </p>
      </div>

      {canInstall && onInstall && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <Download className="w-5 h-5" />
              <span>Lägg till på hemskärmen</span>
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Gör om webbsidan till en app på hemskärmen utan att ladda ned någon fil.
            </p>
          </div>
          <button
            type="button"
            onClick={onInstall}
            className="min-h-[46px] px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shrink-0"
          >
            <span>Lägg till</span>
          </button>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 px-1">
          Här är vad varje sida gör
        </h2>

        {pagesGuide.map((page, idx) => {
          const Icon = page.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-1.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0 text-amber-900">
                  {page.customIcon ? (
                    <JanneBoyIcon className="h-6 w-auto object-contain" />
                  ) : Icon ? (
                    <Icon className="w-5 h-5" />
                  ) : null}
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-950 leading-tight">
                    {page.title}
                  </h3>
                  <p className="text-xs font-semibold text-amber-800">{page.label}</p>
                </div>
              </div>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed pl-13 pt-0.5">
                {page.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 text-slate-700 text-sm sm:text-base leading-relaxed">
        <h3 className="font-bold text-slate-950 text-base">En liten sammanfattning</h3>
        <p>
          Du kan klicka runt precis hur du vill utan att vara rädd att något ändras eller försvinner.
          Vill du börja om trycker du bara på <strong>Idag</strong> längst ner.
        </p>
      </div>

      <div className="pt-6 border-t border-slate-200 text-center text-slate-500 text-sm space-y-1">
        <span className="text-[11px] font-mono tracking-widest text-slate-400 select-none block">
          HTG™ Hellstens Trav &amp; Galopp
        </span>
      </div>
    </div>
  );
};
