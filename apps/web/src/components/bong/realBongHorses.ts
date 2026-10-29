// Riktiga tävlande elithästar för avdelningarna i Bong-maskinen
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

export interface StarterTemplate {
  id: string;
  name: string;
  driverName: string;
  trainerName: string;
}

export const LEG_REAL_HORSES: StarterTemplate[][] = [
  // Avd 1: Klass II / Rikstoto
  [
    {
      id: 'h_onas_prince',
      name: 'Önas Prince',
      driverName: 'Per Nordström',
      trainerName: 'Per Nordström',
    },
    { id: 'h_power', name: 'Power', driverName: 'Robert Bergh', trainerName: 'Robert Bergh' },
    {
      id: 'h_cyber_lane',
      name: 'Cyber Lane',
      driverName: 'Johan Untersteiner',
      trainerName: 'Johan Untersteiner',
    },
    {
      id: 'h_stoletheshow',
      name: 'Stoletheshow',
      driverName: 'Magnus A Djuse',
      trainerName: 'Frode Hamre',
    },
    {
      id: 'h_rackham',
      name: 'Rackham',
      driverName: 'Christoffer Eriksson',
      trainerName: 'Christoffer Eriksson',
    },
    {
      id: 'h_unico_broline',
      name: 'Unico Broline',
      driverName: 'Erik Adielsson',
      trainerName: 'Sofia Aronsson',
    },
    { id: 'h_chapuy', name: 'Chapuy', driverName: 'Åke Lindblom', trainerName: 'Åke Lindblom' },
    {
      id: 'h_oracle_tile',
      name: 'Oracle Tile',
      driverName: 'Kristian Malmin',
      trainerName: 'Kristian Malmin',
    },
    {
      id: 'h_lozano_di_quattro',
      name: 'Lozano di Quattro',
      driverName: 'Tobias J Gustafsson',
      trainerName: 'Per Henriksen',
    },
    {
      id: 'h_gamin_jaba',
      name: 'Gamin Jaba',
      driverName: 'Örjan Kihlström',
      trainerName: 'Daniel Redén',
    },
    {
      id: 'h_admiral_as',
      name: 'Admiral As',
      driverName: 'Daniel Redén',
      trainerName: 'Daniel Redén',
    },
    {
      id: 'h_milliondollarrhyme',
      name: 'Milliondollarrhyme',
      driverName: 'Fredrik B Larsson',
      trainerName: 'Fredrik B Larsson',
    },
  ],
  // Avd 2: Klass I
  [
    {
      id: 'h_borups_victory',
      name: 'Borups Victory',
      driverName: 'Daniel Wäjersten',
      trainerName: 'Daniel Wäjersten',
    },
    {
      id: 'h_hail_mary',
      name: 'Hail Mary',
      driverName: 'Örjan Kihlström',
      trainerName: 'Daniel Redén',
    },
    {
      id: 'h_don_fanucci_zet',
      name: 'Don Fanucci Zet',
      driverName: 'Örjan Kihlström',
      trainerName: 'Daniel Redén',
    },
    {
      id: 'h_san_moteur',
      name: 'San Moteur',
      driverName: 'Björn Goop',
      trainerName: 'Björn Goop',
    },
    {
      id: 'h_francesco_zet',
      name: 'Francesco Zet',
      driverName: 'Daniel Redén',
      trainerName: 'Daniel Redén',
    },
    {
      id: 'h_very_kronos',
      name: 'Very Kronos',
      driverName: 'Erik Adielsson',
      trainerName: 'Svante Båth',
    },
    {
      id: 'h_brother_bill',
      name: 'Brother Bill',
      driverName: 'Magnus A Djuse',
      trainerName: 'Timo Nurmos',
    },
    {
      id: '745678',
      name: 'Missle Hill',
      driverName: 'Örjan Kihlström',
      trainerName: 'Daniel Redén',
    },
    {
      id: 'h_horsy_dream',
      name: 'Horsy Dream',
      driverName: 'Pierre Belloche',
      trainerName: 'Pierre Belloche',
    },
    {
      id: 'h_idao_de_tillard',
      name: 'Idao de Tillard',
      driverName: 'Clément Duvaldestin',
      trainerName: 'Thierry Duvaldestin',
    },
    {
      id: 'h_joviality',
      name: 'Joviality',
      driverName: 'Erik Adielsson',
      trainerName: 'Sabine Kagebrant',
    },
    {
      id: 'h_readly_express',
      name: 'Readly Express',
      driverName: 'Jorma Kontio',
      trainerName: 'Timo Nurmos',
    },
  ],
  // Avd 3: Gulddivisionen
  [
    {
      id: 'h_brother_bill',
      name: 'Brother Bill',
      driverName: 'Magnus A Djuse',
      trainerName: 'Timo Nurmos',
    },
    {
      id: 'h_very_kronos',
      name: 'Very Kronos',
      driverName: 'Erik Adielsson',
      trainerName: 'Svante Båth',
    },
    {
      id: 'h_admiral_as',
      name: 'Admiral As',
      driverName: 'Örjan Kihlström',
      trainerName: 'Daniel Redén',
    },
    {
      id: 'h_san_moteur',
      name: 'San Moteur',
      driverName: 'Björn Goop',
      trainerName: 'Björn Goop',
    },
    {
      id: 'h_francesco_zet',
      name: 'Francesco Zet',
      driverName: 'Daniel Redén',
      trainerName: 'Daniel Redén',
    },
    {
      id: 'h_borups_victory',
      name: 'Borups Victory',
      driverName: 'Daniel Wäjersten',
      trainerName: 'Daniel Wäjersten',
    },
    {
      id: 'h_hail_mary',
      name: 'Hail Mary',
      driverName: 'Örjan Kihlström',
      trainerName: 'Daniel Redén',
    },
    {
      id: 'h_don_fanucci_zet',
      name: 'Don Fanucci Zet',
      driverName: 'Örjan Kihlström',
      trainerName: 'Daniel Redén',
    },
    {
      id: 'h_gamin_jaba',
      name: 'Gamin Jaba',
      driverName: 'Daniel Redén',
      trainerName: 'Daniel Redén',
    },
    {
      id: 'h_lozano_di_quattro',
      name: 'Lozano di Quattro',
      driverName: 'Tobias J Gustafsson',
      trainerName: 'Per Henriksen',
    },
    { id: 'h_chapuy', name: 'Chapuy', driverName: 'Åke Lindblom', trainerName: 'Åke Lindblom' },
    {
      id: 'h_milliondollarrhyme',
      name: 'Milliondollarrhyme',
      driverName: 'Fredrik B Larsson',
      trainerName: 'Fredrik B Larsson',
    },
  ],
  // Avd 4: Stoeliten / Diamantstoet
  [
    {
      id: 'h_felicia_zet',
      name: 'Felicia Zet',
      driverName: 'Örjan Kihlström',
      trainerName: 'Daniel Redén',
    },
    {
      id: 'h_zeudi_amg',
      name: 'Zeudi AMG',
      driverName: 'Alessandro Gocciadoro',
      trainerName: 'Alessandro Gocciadoro',
    },
    {
      id: 'h_glamorous_rain',
      name: 'Glamorous Rain',
      driverName: 'Daniel Redén',
      trainerName: 'Daniel Redén',
    },
    {
      id: 'h_lara_boko',
      name: 'Lara Boko',
      driverName: 'Magnus A Djuse',
      trainerName: 'Timo Nurmos',
    },
    {
      id: 'h_betting_pacer',
      name: 'Betting Pacer',
      driverName: 'Björn Goop',
      trainerName: 'Björn Goop',
    },
    {
      id: 'h_nova_mahiron',
      name: 'Nova Mahiron',
      driverName: 'Thomas Uhrberg',
      trainerName: 'Thomas Uhrberg',
    },
    {
      id: 'h_aurelia_express',
      name: 'Aurelia Express',
      driverName: 'Mats E Djuse',
      trainerName: 'Timo Nurmos',
    },
    {
      id: 'h_clarissa',
      name: 'Clarissa',
      driverName: 'Alessandro Gocciadoro',
      trainerName: 'Alessandro Gocciadoro',
    },
    {
      id: 'h_joviality',
      name: 'Joviality',
      driverName: 'Erik Adielsson',
      trainerName: 'Sabine Kagebrant',
    },
    {
      id: 'h_ina_scot',
      name: 'Ina Scot',
      driverName: 'Kjell P Dahlström',
      trainerName: 'Kjell P Dahlström',
    },
    {
      id: 'h_calgary_games',
      name: 'Calgary Games',
      driverName: 'Jorma Kontio',
      trainerName: 'Timo Nurmos',
    },
    {
      id: 'h_sebastian_k',
      name: 'Sebastian K.',
      driverName: 'Åke Svanstedt',
      trainerName: 'Åke Svanstedt',
    },
  ],
  // Avd 5: Bronsdivisionen
  [
    {
      id: 'h_oracle_tile',
      name: 'Oracle Tile',
      driverName: 'Kristian Malmin',
      trainerName: 'Kristian Malmin',
    },
    {
      id: 'h_rackham',
      name: 'Rackham',
      driverName: 'Christoffer Eriksson',
      trainerName: 'Christoffer Eriksson',
    },
    {
      id: 'h_unico_broline',
      name: 'Unico Broline',
      driverName: 'Erik Adielsson',
      trainerName: 'Sofia Aronsson',
    },
    { id: 'h_power', name: 'Power', driverName: 'Robert Bergh', trainerName: 'Robert Bergh' },
    {
      id: 'h_onas_prince',
      name: 'Önas Prince',
      driverName: 'Per Nordström',
      trainerName: 'Per Nordström',
    },
    {
      id: 'h_stoletheshow',
      name: 'Stoletheshow',
      driverName: 'Frode Hamre',
      trainerName: 'Frode Hamre',
    },
    {
      id: 'h_cyber_lane',
      name: 'Cyber Lane',
      driverName: 'Johan Untersteiner',
      trainerName: 'Johan Untersteiner',
    },
    {
      id: '745678',
      name: 'Missle Hill',
      driverName: 'Örjan Kihlström',
      trainerName: 'Daniel Redén',
    },
    { id: 'h_copiad', name: 'Copiad', driverName: 'Erik Berglöf', trainerName: 'Erik Berglöf' },
    { id: 'h_chapuy', name: 'Chapuy', driverName: 'Åke Lindblom', trainerName: 'Åke Lindblom' },
    {
      id: 'h_lozano_di_quattro',
      name: 'Lozano di Quattro',
      driverName: 'Tobias J Gustafsson',
      trainerName: 'Per Henriksen',
    },
    {
      id: 'h_gamin_jaba',
      name: 'Gamin Jaba',
      driverName: 'Daniel Redén',
      trainerName: 'Daniel Redén',
    },
  ],
  // Avd 6: Silverdivisionen
  [
    {
      id: 'h_borups_victory',
      name: 'Borups Victory',
      driverName: 'Daniel Wäjersten',
      trainerName: 'Daniel Wäjersten',
    },
    {
      id: 'h_hail_mary',
      name: 'Hail Mary',
      driverName: 'Örjan Kihlström',
      trainerName: 'Daniel Redén',
    },
    {
      id: 'h_brother_bill',
      name: 'Brother Bill',
      driverName: 'Magnus A Djuse',
      trainerName: 'Timo Nurmos',
    },
    {
      id: 'h_very_kronos',
      name: 'Very Kronos',
      driverName: 'Erik Adielsson',
      trainerName: 'Svante Båth',
    },
    {
      id: 'h_oracle_tile',
      name: 'Oracle Tile',
      driverName: 'Kristian Malmin',
      trainerName: 'Kristian Malmin',
    },
    {
      id: 'h_milliondollarrhyme',
      name: 'Milliondollarrhyme',
      driverName: 'Fredrik B Larsson',
      trainerName: 'Fredrik B Larsson',
    },
    {
      id: 'h_sebastian_k',
      name: 'Sebastian K.',
      driverName: 'Åke Svanstedt',
      trainerName: 'Åke Svanstedt',
    },
    {
      id: 'h_torvald_palema',
      name: 'Torvald Palema',
      driverName: 'Åke Svanstedt',
      trainerName: 'Åke Svanstedt',
    },
    {
      id: 'h_gidde_palema',
      name: 'Gidde Palema',
      driverName: 'Åke Svanstedt',
      trainerName: 'Åke Svanstedt',
    },
    {
      id: 'h_nuncio',
      name: 'Nuncio',
      driverName: 'Stefan Melander',
      trainerName: 'Stefan Melander',
    },
    {
      id: 'h_commander_crowe',
      name: 'Commander Crowe',
      driverName: 'Fabrice Souloy',
      trainerName: 'Fabrice Souloy',
    },
    {
      id: 'h_maharajah',
      name: 'Maharajah',
      driverName: 'Örjan Kihlström',
      trainerName: 'Stefan Hultman',
    },
  ],
  // Avd 7: Kallblodseliten
  [
    {
      id: 'h_havglimt',
      name: 'Havglimt',
      driverName: 'Öystein Tjomsland',
      trainerName: 'Öystein Tjomsland',
    },
    {
      id: 'h_jarvsoodin',
      name: 'Järvsöodin',
      driverName: 'Marcus Lilius',
      trainerName: 'Jan-Olov Persson',
    },
    {
      id: 'h_tangen_bork',
      name: 'Tangen Bork',
      driverName: 'Tom Erik Solberg',
      trainerName: 'Öystein Tjomsland',
    },
    {
      id: 'h_bw_rune',
      name: 'B.W.Rune',
      driverName: 'Mats E Djuse',
      trainerName: 'Mats E Djuse',
    },
    {
      id: 'h_philip_ess',
      name: 'Philip Ess',
      driverName: 'Öystein Tjomsland',
      trainerName: 'Öystein Tjomsland',
    },
    {
      id: 'h_oppgardsdrangen',
      name: 'Oppgårdsdrängen',
      driverName: 'Jan-Olov Persson',
      trainerName: 'Jan-Olov Persson',
    },
    {
      id: 'h_tekno_jerven',
      name: 'Tekno Jerven',
      driverName: 'Jimmy Jonsson',
      trainerName: 'Alf Jonsson',
    },
    {
      id: 'h_jarvsofaks',
      name: 'Järvsöfaks',
      driverName: 'Jan-Olov Persson',
      trainerName: 'Jan-Olov Persson',
    },
    {
      id: 'h_odd_herakles',
      name: 'Odd Herakles',
      driverName: 'Tom Erik Solberg',
      trainerName: 'Odd Paulsen',
    },
    {
      id: 'h_manlykke_am',
      name: 'Månlykke A.M.',
      driverName: 'Gunnar Melander',
      trainerName: 'Gunnar Melander',
    },
    { id: 'h_power', name: 'Power', driverName: 'Robert Bergh', trainerName: 'Robert Bergh' },
    {
      id: 'h_san_moteur',
      name: 'San Moteur',
      driverName: 'Björn Goop',
      trainerName: 'Björn Goop',
    },
  ],
  // Avd 8: Mästarmötet (för V86)
  [
    {
      id: 'h_victory_tilly',
      name: 'Victory Tilly',
      driverName: 'Stig H Johansson',
      trainerName: 'Stig H Johansson',
    },
    {
      id: 'h_commander_crowe',
      name: 'Commander Crowe',
      driverName: 'Christophe Martens',
      trainerName: 'Fabrice Souloy',
    },
    {
      id: 'h_nuncio',
      name: 'Nuncio',
      driverName: 'Stefan Melander',
      trainerName: 'Stefan Melander',
    },
    {
      id: 'h_gidde_palema',
      name: 'Gidde Palema',
      driverName: 'Åke Svanstedt',
      trainerName: 'Åke Svanstedt',
    },
    {
      id: 'h_torvald_palema',
      name: 'Torvald Palema',
      driverName: 'Åke Svanstedt',
      trainerName: 'Åke Svanstedt',
    },
    {
      id: 'h_readly_express',
      name: 'Readly Express',
      driverName: 'Jorma Kontio',
      trainerName: 'Timo Nurmos',
    },
    {
      id: 'h_maharajah',
      name: 'Maharajah',
      driverName: 'Örjan Kihlström',
      trainerName: 'Stefan Hultman',
    },
    {
      id: 'h_sebastian_k',
      name: 'Sebastian K.',
      driverName: 'Åke Svanstedt',
      trainerName: 'Åke Svanstedt',
    },
    {
      id: 'h_ina_scot',
      name: 'Ina Scot',
      driverName: 'Kjell P Dahlström',
      trainerName: 'Kjell P Dahlström',
    },
    { id: 'h_copiad', name: 'Copiad', driverName: 'Erik Berglöf', trainerName: 'Erik Berglöf' },
    {
      id: 'h_horsy_dream',
      name: 'Horsy Dream',
      driverName: 'Pierre Belloche',
      trainerName: 'Pierre Belloche',
    },
    {
      id: 'h_idao_de_tillard',
      name: 'Idao de Tillard',
      driverName: 'Thierry Duvaldestin',
      trainerName: 'Thierry Duvaldestin',
    },
  ],
];
