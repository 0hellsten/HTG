export const MOCK_TIP_PROVIDERS = [
  { id: 'travronden', label: 'Travronden' },
  { id: 'expressen', label: 'Expressen' },
  { id: 'aftonbladet', label: 'Aftonbladet' },
  { id: 'sulkysport', label: 'Sulkysport' },
];

export function getMockAllTips() {
  const todayStr = new Date().toISOString().slice(0, 10);

  const articles = [
    {
      id: 'art_1',
      sourceId: 'travronden',
      sourceLabel: 'Travronden',
      title: 'V75-krönika: Omgångens bästa spik och hetaste motbud',
      summary:
        'Vi har vänt på varje sten inför V75 på Solvalla. Här är dragen som spelarkollektivet har missat.',
      url: '#',
      publishedAt: `${todayStr}T09:30:00Z`,
      author: 'Travronden Redaktionen',
      gameType: 'V75',
    },
    {
      id: 'art_2',
      sourceId: 'expressen',
      sourceLabel: 'Expressen',
      title: 'Expressens V75-tips: Spiken är stenklar i Gulddivisionen',
      summary:
        'Toppform i stallet och perfekt spår. Vi tvekar inte en sekund på lördagens bästa spik.',
      url: '#',
      publishedAt: `${todayStr}T10:15:00Z`,
      author: 'Eskil Hellberg',
      gameType: 'V75',
    },
    {
      id: 'art_3',
      sourceId: 'aftonbladet',
      sourceLabel: 'Aftonbladet',
      title: 'Sportbladets travtips: Omgångens miljonskräll i avdelning 4',
      summary:
        'Låg streckprocent trots kanonform i backspegeln. Hästen är helt bortglömd av spelarna.',
      url: '#',
      publishedAt: `${todayStr}T11:00:00Z`,
      author: 'Sportbladet Trav',
      gameType: 'V75',
    },
    {
      id: 'art_4',
      sourceId: 'sulkysport',
      sourceLabel: 'Sulkysport',
      title: 'Sulkysports analys: Balansändringar och barfotaeffekt',
      summary:
        'Viktiga skoryck och jänkarvagnar inför lördagens omgång. Vi listar hästarna som gynnas mest.',
      url: '#',
      publishedAt: `${todayStr}T11:45:00Z`,
      author: 'Sulkysport',
      gameType: 'V75',
    },
  ];

  const raceTips = Array.from({ length: 8 }, (_, i) => ({
    raceId: `race_${i + 1}`,
    raceNumber: i + 1,
    tips: [
      {
        sourceId: 'travronden',
        sourceLabel: 'Travronden',
        rankedHorseNumbers: [1, 3, 5, 2, 7],
        bestBetHorseNumber: 1,
        outsiderHorseNumber: 5,
        analysisText: 'Klar förstahäst från innerspår. Kan leda runt om.',
      },
      {
        sourceId: 'expressen',
        sourceLabel: 'Expressen',
        rankedHorseNumbers: [3, 1, 4, 8],
        bestBetHorseNumber: 3,
        outsiderHorseNumber: 4,
        analysisText: 'Spetsstrid att vänta. Draget från tredje spår är högintressant.',
      },
      {
        sourceId: 'aftonbladet',
        sourceLabel: 'Aftonbladet',
        rankedHorseNumbers: [1, 4, 3, 6],
        bestBetHorseNumber: 1,
        outsiderHorseNumber: 6,
        analysisText: 'Stabil prestation senast. Går med optimal balans nu.',
      },
      {
        sourceId: 'sulkysport',
        sourceLabel: 'Sulkysport',
        rankedHorseNumbers: [2, 1, 5, 3],
        bestBetHorseNumber: 2,
        outsiderHorseNumber: 5,
        analysisText: 'Första barfota runt om kan fälla avgörandet.',
      },
    ],
  }));

  return {
    sources: MOCK_TIP_PROVIDERS.map((p) => ({
      id: p.id,
      label: p.label,
      status: 'ok',
      fetchedAt: `${todayStr}T12:00:00Z`,
      ageSeconds: 120,
      message: 'Färska tips hämtade',
    })),
    articles,
    raceTips,
  };
}

export function getMockRaceTips(raceId: string) {
  const all = getMockAllTips();
  const match = all.raceTips.find((rt) => rt.raceId === raceId);
  return (
    match || {
      raceId,
      raceNumber: 1,
      tips: all.raceTips[0].tips,
    }
  );
}

export function getMockKallorStatus() {
  const now = new Date().toISOString();
  return [
    {
      id: 'atg-racinginfo',
      label: 'ATG Tävlingsinfo',
      status: 'ok',
      fetchedAt: now,
      ageSeconds: 45,
      message: 'Färska startlistor',
    },
    {
      id: 'atg-odds',
      label: 'ATG Odds & Streck',
      status: 'ok',
      fetchedAt: now,
      ageSeconds: 30,
      message: 'Färska odds',
    },
    {
      id: 'svensk-travsport',
      label: 'Svensk Travsport',
      status: 'ok',
      fetchedAt: now,
      ageSeconds: 300,
      message: 'Sportinfo uppdaterad',
    },
    {
      id: 'travronden',
      label: 'Travronden',
      status: 'ok',
      fetchedAt: now,
      ageSeconds: 600,
      message: 'Dagens tips tillgängliga',
    },
    {
      id: 'expressen',
      label: 'Expressen',
      status: 'ok',
      fetchedAt: now,
      ageSeconds: 650,
      message: 'Dagens tips tillgängliga',
    },
    {
      id: 'aftonbladet',
      label: 'Aftonbladet',
      status: 'ok',
      fetchedAt: now,
      ageSeconds: 700,
      message: 'Dagens tips tillgängliga',
    },
    {
      id: 'sulkysport',
      label: 'Sulkysport',
      status: 'ok',
      fetchedAt: now,
      ageSeconds: 720,
      message: 'Dagens tips tillgängliga',
    },
    {
      id: 'smhi-weather',
      label: 'SMHI Väder vid banan',
      status: 'ok',
      fetchedAt: now,
      ageSeconds: 900,
      message: 'Aktuellt väder och banunderlag',
    },
  ];
}
