import { JanneBoyStrategy, JanneBoyStrategyInfo } from '../types/janne-boy.js';

export const JANNE_BOY_STRATEGIES: JanneBoyStrategyInfo[] = [
  {
    id: 'balanserad',
    label: 'Balanserad Janne',
    tagline: 'Sunda spikar & väl valda skrällar',
    description:
      'Den klassiska travtaktiken: starka favoriter spikas medan öppna lopp garderas med spelvärda utmanare.',
  },
  {
    id: 'miljondrag',
    label: 'Jannes Miljondrag',
    tagline: 'Våga fälla favoriter & jaga miljonerna',
    description:
      'Går emot överstreckade hästar och lyfter fram hästar där vinnaroddsen lovar rejält spelvärde.',
  },
  {
    id: 'sakerhet',
    label: 'Kajsas intuition',
    tagline: 'Trygg kupong med hög vinstchans',
    description:
      'Bygger på omgångens stabilaste hästar och etablerade toppkuskar för maximal chans till full pott.',
  },
  {
    id: 'form',
    label: 'Tangizan',
    tagline: 'Heta hästar, formkuskar & ändringar',
    description:
      'Prioriterar hästar som tävlar med toppform, intressanta ändringar och kuskar i segerzonen.',
  },
];

export const JANNE_QUOTES: Record<JanneBoyStrategy, string[]> = {
  balanserad: [
    'Det här systemet har både hängslen och livrem där det behövs, men släpper loss när läget bjuder in till skräll.',
    'Trav handlar om balans: spika det bästa, gardera det öppna och räkna aldrig bort en smygkörd andrahäst.',
    'Ett gediget stallbackssystem. Inga dumdristiga chansningar, men gott om spelvärde om det skräller i de öppna loppen.',
  ],
  miljondrag: [
    'Favoriterna vinner inte alla lopp. Det är de rensande dragen som betalar kaffet och en hel del därtill!',
    'Här går vi för de stora pengarna. Fäller vi omgångens största favorit blir utdelningen rent elektrisk.',
    'När alla andra tittar på ettans streck ser vi femmans vinnarodds. Miljonerna finns bland de bortglömda!',
  ],
  sakerhet: [
    'Lugnt och metodiskt. Bästa hästen i varje lopp är med på lappen. Nu ska vi sätta alla rätt.',
    'Ett stabilt hantverk. Går favoriterna som de ska sitter vi i vinnarcirkeln innan kvällen är över.',
    'Trygghet i ryggarna. Vi litar på klassen och låter de mest betrodda ekipagen göra grovjobbet.',
  ],
  form: [
    'Form slår alltid klass när det drar ihop sig till upplopp. Här satsar vi på hästar som är på tårna!',
    'Stallbackssnacket ljuger sällan: när hästen har full form och kusken har flyt är segern nära.',
    'Lyssna på hovarna! De här hästarna kommer med dagsform och rätt lägen för att avgöra.',
  ],
};
