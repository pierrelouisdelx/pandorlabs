/** Massimo Dutti category → sub-category id listing, ported verbatim from the Python scraper. */
export interface MassimoDuttiSub {
  name: string;
  link: string;
}

export interface MassimoDuttiCategory {
  main: string;
  subs: MassimoDuttiSub[];
}

export const MASSIMO_DUTTI_CATEGORIES: MassimoDuttiCategory[] = [
  {
    main: 'SHOES',
    subs: [
      { name: 'SANDALS', link: '1767035' },
      { name: 'FLAT_SHOES', link: '2097275' },
      { name: 'PUMPS', link: '2097277' },
      { name: 'SNEAKERS', link: '2097276' },
      { name: 'BOOTS_ANKLE_BOOTS', link: '2131333' },
      { name: 'ALL', link: '1887045' },
    ],
  },
  {
    main: 'CLOTHING',
    subs: [
      { name: 'JACKETS & TRENCH COATS', link: '2263535' },
      { name: 'COATS', link: '2164383' },
      { name: 'LEATHER', link: '2263537' },
      { name: 'SWEATERS & CARDIGANS', link: '2263541' },
      { name: 'CASHMERE', link: '2263539' },
      { name: 'BLAZERS', link: '2263540' },
      { name: 'DRESSES', link: '2263541' },
      { name: 'SHIRTS & BLOUSES', link: '2263542' },
      { name: 'T-SHIRTS', link: '2263544' },
      { name: 'TOPS', link: '2263543' },
      { name: 'SKIRTS', link: '2263547' },
      { name: 'TROUSERS', link: '2263545' },
      { name: 'JEANS', link: '2263546' },
      { name: 'SUITS', link: '2029059' },
    ],
  },
  {
    main: 'JEWELRY',
    subs: [{ name: 'JEWELLERY', link: '2014016' }],
  },
  {
    main: 'BAGS',
    subs: [{ name: 'BAGS', link: '2263552' }],
  },
  {
    main: 'ACCESSORIES',
    subs: [
      { name: 'BELTS', link: '1928536' },
      { name: 'HATS', link: '2263530' },
      { name: 'SCARVES', link: '1739573' },
      { name: 'BIBS', link: '1739568' },
      { name: 'SOCKS', link: '2198923' },
      { name: 'SUNGLASSES', link: '2127827' },
    ],
  },
];
