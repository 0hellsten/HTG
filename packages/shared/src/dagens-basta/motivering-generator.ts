import { BongHorseInput, BongRaceLeg } from '../types/bong.js';
import { DagensBastaReasonItem, DagensBastaHorseRole } from '../types/dagens-basta.js';
import { analyzeEquipment } from '../janne-boy/trav-expertis.js';

/**
 * Genererar lugna, travkunniga motiveringar baserat på faktiska parametrar.
 * Inga tekniska termer, inga engelska ord.
 */
export function generateHorseReasons(
  horse: BongHorseInput,
  leg: BongRaceLeg,
  role: DagensBastaHorseRole,
  impliedWinProb: number,
  valueRatio: number
): { reasons: DagensBastaReasonItem[]; summary: string } {
  const reasons: DagensBastaReasonItem[] = [];
  const startMethod = leg.startMethod || 'auto';
  const post = horse.postPosition || horse.startNumber;
  const isAuto = startMethod === 'auto';

  // 1. Läge & spår
  let postTitle = 'Läge & startspår';
  let postText = '';
  let postPositive = true;

  if (isAuto) {
    if (post >= 4 && post <= 5) {
      postText = `Guldspår ${post} bakom bilen. Optimal vinkel för att ladda och finna en fin position eller nå ledningen.`;
      postPositive = true;
    } else if (post >= 1 && post <= 3) {
      postText = `Fint framspår (spår ${post}) med kortaste vägen. Bra möjlighet att få en position i främre träffen direkt.`;
      postPositive = true;
    } else if (post === 9 || post === 10) {
      postText = `Smygläge med spår ${post} i andra ledet. Får en fin ryggresa och kan spara krafterna till upploppet.`;
      postPositive = true;
    } else if (post === 6 || post === 7) {
      postText = `Spår ${post} är lite långt ut på vingen. Kan krävas en del jobb första biten för att inte hamna på vingel.`;
      postPositive = false;
    } else if (post === 8) {
      postText = `Tufft åttondespår längst ut bakom vingen. Kräver klaff eller rejäl öppning för att komma till.`;
      postPositive = false;
    } else if (post >= 11) {
      postText = `Svårt bakspår (spår ${post}). Måste förlita sig på högt tempo framme i täten och runda fältet.`;
      postPositive = false;
    } else {
      postText = `Startar från spår ${post} bakom bilen.`;
      postPositive = true;
    }
  } else {
    // Voltstart
    if (post === 6 || post === 7) {
      postText = `Springspår (spår ${post}) i voltstart! Kan utnyttja farten från sidan och få ett rejält försprång.`;
      postPositive = true;
    } else if (post === 1 || post === 3) {
      postText = `Trevligt spår ${post} i volten – bra kliv iväg utan att riskera att bli fast.`;
      postPositive = true;
    } else if (post === 2) {
      postText = `Andraspår i volt kräver säker avgång, men hanterbart för en stabil travare.`;
      postPositive = true;
    } else if (post === 4 || post === 5) {
      postText = `Snävt fjärde-/femtespår i volten. Kräver precision och lugn från start för att undvika galopp.`;
      postPositive = false;
    } else {
      postText = `Startar från spår ${post} i volten.`;
      postPositive = true;
    }
  }

  reasons.push({
    category: 'lage',
    title: postTitle,
    text: postText,
    isPositive: postPositive,
  });

  // 2. Balans & utrustning
  const equip = analyzeEquipment(horse, startMethod);
  let equipText = '';
  let equipPositive = false;

  const isBarfotaRuntOm = horse.shoeFront === false && horse.shoeBack === false;
  const isBarfotaFram = horse.shoeFront === false && horse.shoeBack !== false;
  const isBarfotaBak = horse.shoeFront !== false && horse.shoeBack === false;
  const isAmericanSulky = horse.sulkyType === 'american' && isAuto;

  if (horse.shoeChanged && isBarfotaRuntOm) {
    equipText =
      'Skoryck till barfota runt om! En klassisk ändring som ofta ger hästen en helt ny växel.';
    equipPositive = true;
  } else if (isBarfotaRuntOm) {
    equipText = 'Anmäld barfota runt om – maximal och lätt balans som ger bra spänst i steget.';
    equipPositive = true;
  } else if (isBarfotaFram) {
    equipText = 'Barfota fram ger bättre lätthet och rappare aktion över upploppet.';
    equipPositive = true;
  } else if (isBarfotaBak) {
    equipText = 'Barfota bak hjälper till med drivet och skjutkraften i kurvorna.';
    equipPositive = true;
  } else {
    equipText = 'Går med skor runt om – en trygg och beprövad balans utan krusiduller.';
    equipPositive = true;
  }

  if (isAmericanSulky) {
    equipText += ' Dessutom amerikansk sulky (jänkarvagn), vilket brukar lyfta hästen bakom bilen.';
    equipPositive = true;
  }

  reasons.push({
    category: 'balans',
    title: 'Balans & vagn',
    text: equipText,
    isPositive: equipPositive,
  });

  // 3. Kapacitet & meriter
  let formText = '';
  const record = horse.record;
  const earnings = horse.earningsTotal;

  if (record && earnings && earnings > 300000) {
    formText = `Visat hög kapacitet med rekordet ${record} och över ${formatMoneySwedish(earnings)} på kontot. Van vid tuff konkurrens.`;
  } else if (record) {
    formText = `Har ett personbästa på ${record}, vilket räcker långt i den här klassen om formen sitter där.`;
  } else if (earnings && earnings > 100000) {
    formText = `Möter lagom motstånd för sina meriter (${formatMoneySwedish(earnings)} intjänat).`;
  } else {
    formText =
      'Spännande travare som utvecklas för varje start och passar väl i loppets proposition.';
  }

  reasons.push({
    category: 'form_klass',
    title: 'Kapacitet & klass',
    text: formText,
    isPositive: true,
  });

  // 4. Kusk
  if (horse.driverWinPercentage && horse.driverWinPercentage >= 12) {
    reasons.push({
      category: 'kusk',
      title: 'Kusk & styrning',
      text: `${horse.driverName || 'Kusken'} har stark form med ${Math.round(horse.driverWinPercentage)} % segrar på banorna. En klar trygghet i loppet.`,
      isPositive: true,
    });
  } else if (horse.driverName) {
    reasons.push({
      category: 'kusk',
      title: 'Kusk',
      text: `Körs av ${horse.driverName}, som känner hästen väl och vet hur loppet ska läggas upp.`,
      isPositive: true,
    });
  }

  // 5. Spelvärde och rollsammanfattning
  const betPct = Math.round((horse.betDistribution || 0.05) * 100);
  const winOdds = horse.winOdds ? horse.winOdds.toFixed(1).replace('.', ',') : undefined;

  let summary = '';
  if (role === 'basta_chansen') {
    if (impliedWinProb >= 0.4) {
      summary = `Loppets klart bästa segerchans. Förtjänar sitt favoritskap och är omgångens givna grundpelare.`;
    } else {
      summary = `Förstahäst i loppet tack vare förutsättningarna, men fältet är inte utan motstånd.`;
    }
  } else if (role === 'skrall') {
    if (valueRatio >= 1.3) {
      summary = `Mycket spelvärd skräll! Endast streckad till ${betPct} %${winOdds ? ` (odds ${winOdds})` : ''} trots goda förutsättningar.`;
    } else {
      summary = `Farlig outsider om favoriterna kör för hårt mot varandra i täten.`;
    }
  } else {
    // motbud
    summary = `Tidigaste utmanaren till segern. Givet streck vid gardering om favoriten skulle svika.`;
  }

  // Spelvärdespunkt
  reasons.push({
    category: 'spelvarde',
    title: 'Spelvärde & streck',
    text: `Streckad på ${betPct} %${winOdds ? ` med ${winOdds} i vinnarodds` : ''}. ${summary}`,
    isPositive: role === 'skrall' || valueRatio >= 1.0,
  });

  return { reasons, summary };
}

function formatMoneySwedish(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' kr';
}
