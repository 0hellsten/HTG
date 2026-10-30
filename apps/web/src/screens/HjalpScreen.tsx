import React, { useState } from 'react';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { HastsKoIkon } from '../components/HastsKoIkon';

interface HjalpScreenProps {
  onBack: () => void;
}

interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

export const HjalpScreen: React.FC<HjalpScreenProps> = ({ onBack }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleSection = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const sections: FaqItem[] = [
    {
      question: 'Vad betyder de färgade prickarna i rubrikerna?',
      answer: (
        <div className="space-y-3 text-slate-700 leading-relaxed text-base">
          <p>
            Vid varje avsnitt i appen finns en liten diskret prick som visar hur färsk informationen
            är:
          </p>
          <ul className="space-y-2 pl-2">
            <li className="flex items-start gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
              <div>
                <strong className="text-slate-900">Grön prick:</strong> Allt är färskt och nyss
                hämtat. Det är normalläget.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0 mt-1.5" />
              <div>
                <strong className="text-slate-900">Gul prick:</strong> Lite gammalt (t.ex. hämtat
                för en stund sedan) eller delvis uppdaterat.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-3 h-3 rounded-full bg-slate-400 shrink-0 mt-1.5" />
              <div>
                <strong className="text-slate-900">Grå prick:</strong> Uppdateras inte just nu. Allt
                annat på sidan fungerar som vanligt och senast sparade uppgifter visas.
              </div>
            </li>
          </ul>
          <p className="pt-1">
            <strong>Tips:</strong> Tryck på pricken när som helst för att läsa en förklaring och
            trycka på knappen <em>"Försök igen"</em>.
          </p>
        </div>
      ),
    },
    {
      question: 'Vad gör jag om något ser gammalt ut eller inte uppdaterats?',
      answer: (
        <div className="space-y-2 text-slate-700 leading-relaxed text-base">
          <p>Om en uppgift ser gammal ut kan du göra två saker:</p>
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>
              Tryck på den lilla pricken bredvid rubriken och tryck på{' '}
              <strong>"Försök igen"</strong>.
            </li>
            <li>
              Gå till fliken <strong>Mer</strong>, välj <strong>"Hur färskt är det här?"</strong>{' '}
              och tryck på den stora knappen <strong>"Uppdatera allt"</strong>. Då hämtas alla
              startlistor, odds och tips på nytt.
            </li>
          </ol>
        </div>
      ),
    },
    {
      question: 'Hur fungerar "Mitt stall" (favoriter)?',
      answer: (
        <div className="space-y-2 text-slate-700 leading-relaxed text-base">
          <p>I Mitt stall sparar du dina favorithästar, favoritkuskar, tränare och favoritbanor:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Tryck på hästskon{' '}
              <HastsKoIkon
                filled
                className="w-4 h-4 text-amber-500 inline-block align-text-bottom"
              />{' '}
              på ett hästkort, på en bana eller bredvid en kusk för att spara den.
            </li>
            <li>
              När en favorit startar i dagens tävlingar markeras det direkt med en grön skylt i Mitt
              stall och på loppkortet: <em>"Anmäld idag — Solvalla lopp 6, kl 20:12"</em>.
            </li>
            <li>Favoritbanor läggs alltid överst på startsidan så att du slipper leta.</li>
          </ul>
        </div>
      ),
    },
    {
      question: 'Hur ställer jag hästar mot varandra i ett lopp?',
      answer: (
        <div className="space-y-2 text-slate-700 leading-relaxed text-base">
          <p>När du är inne på ett lopp kan du välja 2 till 6 hästar:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              Klicka på knappen <strong>"Jämför"</strong> på de hästar du vill titta närmare på.
            </li>
            <li>
              Tryck på den gula knappen <strong>"Ställ dem mot varandra"</strong> längst ner.
            </li>
            <li>
              Då visas en tydlig tabell där hästarnas form, rekord, kusk, tränare, skor och odds
              står sida vid sida. Bästa värdet per rad markeras diskret.
            </li>
          </ol>
        </div>
      ),
    },
    {
      question: 'Hur fungerar Banvisaren?',
      answer: (
        <div className="space-y-2 text-slate-700 leading-relaxed text-base">
          <p>
            I Banvisaren (under fliken <strong>Mer</strong> eller genom att trycka på en bana)
            hittar du:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Banans längd, upploppets längd och underlag.</li>
            <li>
              <strong>Så brukar spåren gå:</strong> vinstprocent per startspår för volt och auto.
            </li>
            <li>
              <strong>Leder man, vinner man?</strong> Hur ofta ledaren håller hela vägen in i mål.
            </li>
            <li>Aktuellt väder och banunderlag från SMHI på tävlingsdagen.</li>
          </ul>
        </div>
      ),
    },
    {
      question: 'Hur lägger jag appen som en ikon på hemskärmen på mobilen?',
      answer: (
        <div className="space-y-2 text-slate-700 leading-relaxed text-base">
          <p>
            Du kan installera appen så att den ser ut och fungerar precis som en vanlig app utan
            adressfält:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>Öppna appen i webbläsaren Chrome på din Android-telefon.</li>
            <li>Tryck på de tre prickarna högst uppe till höger i webbläsaren.</li>
            <li>
              Välj <strong>"Installera app"</strong> eller{' '}
              <strong>"Lägg till på startskärmen"</strong>.
            </li>
            <li>En Tangitza-ikon läggs på din hemskärm. Tryck på den i fortsättningen!</li>
          </ol>
        </div>
      ),
    },
    {
      question: 'Hur ändrar jag textstorleken om texten är svår att läsa?',
      answer: (
        <div className="space-y-2 text-slate-700 leading-relaxed text-base">
          <p>
            Gå till fliken <strong>Mer</strong> och välj <strong>"Textstorlek"</strong>.
          </p>
          <p>
            Där kan du välja mellan <strong>Normal</strong>, <strong>Stor</strong> och{' '}
            <strong>Riktigt stor</strong>. Valet sparas i din telefon och gör all text och alla
            knappar i hela appen större.
          </p>
        </div>
      ),
    },
    {
      question: 'Vad händer om jag tappar internetuppkopplingen?',
      answer: (
        <div className="space-y-2 text-slate-700 leading-relaxed text-base">
          <p>
            Appen fortsätter att fungera! Den visar de senast sparade loppen och startlistorna med
            en lugn remsa högst upp:
            <em> "Du är inte uppkopplad. Det här hämtades..."</em>.
          </p>
          <p>Så fort telefonen får kontakt med internet igen hämtas ny data automatiskt.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] min-w-[44px] inline-flex items-center gap-2 text-slate-700 hover:text-slate-950 font-semibold py-2 px-3 rounded-lg hover:bg-slate-200/60 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Tillbaka</span>
        </button>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 flex items-center gap-3">
          <HelpCircle className="w-7 h-7 text-amber-600" />
          <span>Hjälp och vanliga frågor</span>
        </h1>
        <p className="text-base text-slate-600 mt-1">
          Här hittar du svar på hur appen fungerar, vad prickarna betyder och hur du anpassar den.
        </p>
      </div>

      {}
      <div className="space-y-3">
        {sections.map((sec, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggleSection(idx)}
                aria-expanded={isOpen}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-950 text-lg hover:bg-slate-50 transition-colors cursor-pointer min-h-[56px]"
              >
                <span>{sec.question}</span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/40">
                  {sec.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {}
      <div className="pt-6 border-t border-slate-200 text-center text-slate-500 text-sm space-y-1">
        <div className="pt-3">
          <span className="text-[11px] font-mono tracking-widest text-slate-400 select-none block">
            HTG™ Hellstens Trav &amp; Galopp
          </span>
        </div>
      </div>
    </div>
  );
};
