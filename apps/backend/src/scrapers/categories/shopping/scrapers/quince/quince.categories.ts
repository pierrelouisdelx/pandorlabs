/** Quince category → collection-slug listing, ported verbatim from the Python `QuinceScraper.categories`. */
export interface QuinceSub {
  name: string;
  slug: string;
}

export interface QuinceCategory {
  main: string;
  subs: QuinceSub[];
}

export const QUINCE_CATEGORIES: QuinceCategory[] = [
  {
    main: 'CLOTHING',
    subs: [
      { name: 'Sweaters ', slug: '/women/sweaters-&-jackets' },
      { name: 'Tops & Blouses', slug: '/women/shirts-&-blouses' },
      { name: 'Tees & Tanks', slug: '/women/tees' },
      { name: 'Jackets & Coats', slug: '/women/jackets' },
      { name: 'Dresses & Jumpsuits', slug: '/women/dresses' },
      { name: 'Pants', slug: '/women/pants' },
      { name: 'Jeans', slug: '/women/jeans' },
      { name: 'Skirts', slug: '/women/skirts' },
      { name: 'Shorts', slug: '/women/shorts' },
      { name: 'Blazers', slug: '/women/blazers' },
      { name: 'Loungewear & Pajamas', slug: '/women/loungewear' },
      { name: 'Activewear', slug: '/women/activewear' },
      { name: 'Sweatshirts & Sweatpants', slug: '/women/sweatshirts' },
      { name: 'Intimates & Shapewear', slug: '/women/intimates-&-shapewear' },
      { name: 'Swimwear', slug: '/women/swim' },
    ],
  },
  {
    main: 'SHOES',
    subs: [
      { name: 'Flats', slug: '/women/shoes/flats' },
      { name: 'Boots', slug: '/women/shoes/boots' },
      { name: 'Loafers', slug: '/women/shoes/loafers' },
      { name: 'Sandals', slug: '/women/shoes/sandals' },
      { name: 'Heels', slug: '/women/shoes/heels' },
      { name: 'Sneakers', slug: '/women/shoes/sneakers' },
    ],
  },
  {
    main: 'BAGS',
    subs: [
      { name: 'Bags & Leather Goods', slug: '/women/bags-&-leather-goods' },
    ],
  },
  {
    main: 'ACCESSORIES',
    subs: [
      { name: 'Hats, Scarves & Gloves', slug: '/women/hats-&-scarves' },
      { name: 'Belts', slug: '/women/belts' },
      { name: 'Sunglasses & Eyewear', slug: '/women/sunglasses' },
      { name: 'Socks', slug: '/women/socks' },
      { name: 'Travel', slug: '/home/travel' },
      { name: 'Tech Accessories', slug: '/tech-accessories' },
      { name: 'Pickleball Sets', slug: '/pickleball-sets' },
    ],
  },
  {
    main: 'JEWELRY',
    subs: [
      { name: 'Earrings', slug: '/women/jewelry/earrings-all' },
      { name: 'Rings', slug: '/women/jewelry/rings-all' },
      { name: 'Necklaces', slug: '/women/jewelry/necklaces-all' },
      { name: 'Bracelets', slug: '/women/jewelry/bracelets-all' },
      {
        name: 'Lab Grown Diamond Jewelry',
        slug: '/women/jewelry/lab-grown-diamond-jewelry-all',
      },
      { name: 'Diamond Jewelry', slug: '/women/jewelry/diamond-jewelry-all' },
      { name: 'Engagement Rings', slug: '/women/jewelry/engagement-rings-all' },
      { name: 'Wedding Bands', slug: '/women/jewelry/wedding-bands-all' },
    ],
  },
];
