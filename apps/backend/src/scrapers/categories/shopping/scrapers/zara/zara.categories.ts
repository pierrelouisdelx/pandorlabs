/** Zara category → sub-category listing endpoints (ajax JSON). */
export interface ZaraSub {
  name: string;
  link: string;
}

export interface ZaraCategory {
  main: string;
  subs: ZaraSub[];
}

const cat = (id: string) =>
  `https://www.zara.com/us/en/category/${id}/products?ajax=true`;

export const ZARA_CATEGORIES: ZaraCategory[] = [
  {
    main: 'SHOES',
    subs: [
      { name: 'FLAT_SANDALS', link: cat('2419053') },
      { name: 'HIGH_HEELS', link: cat('2419179') },
      { name: 'SNEAKERS', link: cat('2419075') },
      { name: 'HEELED_SANDALS', link: cat('2419094') },
      { name: 'FLATS', link: cat('2419069') },
      { name: 'LEATHER', link: cat('2419076') },
    ],
  },
  {
    main: 'CLOTHING',
    subs: [
      { name: 'LEATHER', link: cat('2418883') },
      { name: 'JACKETS', link: cat('2417772') },
      { name: 'COATS_TRENCHES', link: cat('2419032') },
      { name: 'BLAZERS', link: cat('2420942') },
      { name: 'CARDIGANS_SWEATERS', link: cat('2419844') },
      { name: 'DRESSES_JUMPSUITS', link: cat('2420896') },
      { name: 'TOPS_JUMPSUITS', link: cat('2419940') },
      { name: 'COORDS_SETS', link: cat('2420285') },
      { name: 'KNITWEAR', link: cat('2420306') },
      { name: 'JEANS', link: cat('2419185') },
      { name: 'PANTS', link: cat('2420795') },
      { name: 'SHIRTS', link: cat('2420369') },
      { name: 'TSHIRTS', link: cat('2420417') },
      { name: 'SKIRTS', link: cat('2420454') },
      { name: 'SWEATSHIRTS', link: cat('2467841') },
    ],
  },
  {
    main: 'BAGS',
    subs: [{ name: 'BAGS', link: cat('2417728') }],
  },
  {
    main: 'ACCESSORIES',
    subs: [{ name: 'ACCESSORIES', link: cat('2418989') }],
  },
];
