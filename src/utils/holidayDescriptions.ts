/**
 * Holiday descriptions and historical context
 */
export interface HolidayDescription {
  name: string;
  description: string;
  type: 'regular' | 'special' | 'special-working';
  historical?: string;
}

export const holidayDescriptions: Record<string, HolidayDescription> = {
  "New Year's Day": {
    name: "New Year's Day",
    description: "The first day of the year, celebrated with fireworks and family gatherings.",
    type: 'regular',
    historical: "Celebrated worldwide as the beginning of the Gregorian calendar year."
  },
  "Araw ng Kagitingan": {
    name: "Araw ng Kagitingan (Day of Valor)",
    description: "Commemorates the fall of Bataan during World War II.",
    type: 'regular',
    historical: "Also known as Bataan Day, it honors the Filipino and American soldiers who defended the Bataan peninsula in 1942."
  },
  "Maundy Thursday": {
    name: "Maundy Thursday",
    description: "Christian holy day during Holy Week, commemorating the Last Supper of Jesus Christ.",
    type: 'regular',
    historical: "Part of the Holy Week observance, date changes annually based on the liturgical calendar."
  },
  "Good Friday": {
    name: "Good Friday",
    description: "Christian holy day commemorating the crucifixion of Jesus Christ.",
    type: 'regular',
    historical: "Observed during Holy Week with solemn processions and religious services."
  },
  "Labor Day": {
    name: "Labor Day",
    description: "Celebrates the contributions of workers to the nation's economy and society.",
    type: 'regular',
    historical: "International Workers' Day celebrated worldwide on May 1st."
  },
  "Independence Day": {
    name: "Independence Day",
    description: "Commemorates the declaration of Philippine independence from Spain in 1898.",
    type: 'regular',
    historical: "Declared on June 12, 1898 in Kawit, Cavite by General Emilio Aguinaldo."
  },
  "National Heroes Day": {
    name: "National Heroes Day",
    description: "Honors all Philippine national heroes, known and unknown.",
    type: 'regular',
    historical: "Celebrated on the last Monday of August to recognize the contributions of Filipino heroes."
  },
  "Bonifacio Day": {
    name: "Bonifacio Day",
    description: "Commemorates the birth of Andres Bonifacio, founder of the Katipunan.",
    type: 'regular',
    historical: "Andres Bonifacio (1863-1897) was known as the 'Father of the Philippine Revolution'."
  },
  "Christmas Day": {
    name: "Christmas Day",
    description: "Christian celebration of the birth of Jesus Christ.",
    type: 'regular',
    historical: "One of the most important holidays in the predominantly Catholic Philippines."
  },
  "Rizal Day": {
    name: "Rizal Day",
    description: "Commemorates the death of national hero Dr. Jose Rizal.",
    type: 'regular',
    historical: "Dr. Jose Rizal was executed on December 30, 1896, sparking the Philippine Revolution."
  },
  "Chinese New Year": {
    name: "Chinese New Year",
    description: "Celebrates the beginning of the lunar new year in the Chinese calendar.",
    type: 'special',
    historical: "Reflects the strong Chinese influence on Philippine culture and history."
  },
  "People Power Anniversary": {
    name: "People Power Anniversary",
    description: "Commemorates the 1986 peaceful revolution that toppled the Marcos dictatorship.",
    type: 'special',
    historical: "The EDSA People Power Revolution restored democracy in the Philippines from February 22-25, 1986."
  },
  "Black Saturday": {
    name: "Black Saturday",
    description: "Christian holy day following Good Friday, commemorating Jesus' burial.",
    type: 'special',
    historical: "Part of the Holy Week observance, traditionally a day of mourning."
  },
  "Ninoy Aquino Day": {
    name: "Ninoy Aquino Day",
    description: "Commemorates the assassination of Senator Benigno 'Ninoy' Aquino Jr.",
    type: 'special',
    historical: "His death on August 21, 1983 became a catalyst for the People Power Revolution."
  },
  "All Saints' Day": {
    name: "All Saints' Day",
    description: "Christian day to honor all saints and martyrs.",
    type: 'special',
    historical: "Filipinos traditionally visit cemeteries to honor deceased loved ones."
  },
  "All Souls' Day": {
    name: "All Souls' Day",
    description: "Christian day to pray for the souls of the departed.",
    type: 'special',
    historical: "Continuation of All Saints' Day traditions, with families gathering at cemeteries."
  },
  "Feast of the Immaculate Conception of Mary": {
    name: "Feast of the Immaculate Conception of Mary",
    description: "Catholic feast day celebrating the Immaculate Conception of the Virgin Mary.",
    type: 'special',
    historical: "The Philippines is the largest Catholic country in Asia, making this a significant religious holiday."
  },
  "Christmas Eve": {
    name: "Christmas Eve",
    description: "The evening before Christmas Day, celebrated with family gatherings and midnight mass.",
    type: 'special',
    historical: "Filipino families traditionally hold Noche Buena, a festive family dinner on Christmas Eve."
  },
  "New Year's Eve": {
    name: "New Year's Eve",
    description: "The last day of the year, celebrated with fireworks and media noche (midnight meal).",
    type: 'special',
    historical: "Filipinos believe loud noises and fireworks drive away evil spirits for the coming year."
  },
  "EDSA People Power Revolution Anniversary": {
    name: "EDSA People Power Revolution Anniversary",
    description: "Commemorates the 1986 peaceful revolution (declared as special working day for 2026).",
    type: 'special-working',
    historical: "In 2026, this was declared a special working day instead of a special non-working holiday."
  }
};

/**
 * Get holiday description by name
 * @param name The holiday name
 * @returns Holiday description or null if not found
 */
export const getHolidayDescription = (name: string): HolidayDescription | null => {
  return holidayDescriptions[name] || null;
};
