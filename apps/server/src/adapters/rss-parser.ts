// Enkel och säker RSS 2.0-parser utan externa beroenden
// Stallbacken — HTG

export interface ParsedRssItem {
  title: string;
  link?: string;
  description?: string;
  author?: string;
  pubDate: string;
  guid?: string;
}

/**
 * Rensar CDATA, HTML-taggar, entiteter och eventuella annonstexter från text.
 */
function cleanText(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('<![CDATA[') && cleaned.endsWith(']]>')) {
    cleaned = cleaned.slice(9, -3).trim();
  }
  // Avkoda vanliga HTML-entiteter
  cleaned = cleaned
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');

  // Ta bort HTML-taggar t.ex. <img ...> eller <p>
  cleaned = cleaned
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Klipp bort kommersiella andels-/annonstexter
  const annonsIdx = cleaned.search(/\bANNONS:/i);
  if (annonsIdx > 0) {
    cleaned = cleaned.slice(0, annonsIdx).trim();
  }
  return cleaned;
}

/**
 * Parsar en RSS 2.0 XML-sträng till en lista med artiklar.
 */
export function parseRssXml(xml: string): ParsedRssItem[] {
  const items: ParsedRssItem[] = [];
  const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) || [];

  for (const itemXml of itemMatches) {
    const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
    const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
    const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/i);
    const authorMatch = itemXml.match(/<author>([\s\S]*?)<\/author>/i);
    const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const guidMatch = itemXml.match(/<guid[\s\S]*?>([\s\S]*?)<\/guid>/i);

    const title = titleMatch ? cleanText(titleMatch[1]) : 'Ingen rubrik';
    const link = linkMatch ? linkMatch[1].trim() : undefined;
    const description = descMatch ? cleanText(descMatch[1]) : undefined;
    const author = authorMatch ? cleanText(authorMatch[1]) : undefined;
    const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
    const guid = guidMatch ? guidMatch[1].trim() : link;

    items.push({
      title,
      link,
      description,
      author,
      pubDate,
      guid,
    });
  }

  return items;
}
