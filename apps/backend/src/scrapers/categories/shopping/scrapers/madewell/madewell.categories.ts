/** Madewell category → sub-category listing paths. */
export interface MadewellSub {
  name: string;
  link: string;
}

export interface MadewellCategory {
  main: string;
  link: string;
  subs: MadewellSub[];
}

export const MADEWELL_CATEGORIES: MadewellCategory[] = [
  {
    main: 'CLOTHING',
    link: 'https://www.madewell.com/womens/clothing/',
    subs: [
      { name: 'JEANS', link: '/womens/clothing/jeans/' },
      { name: 'SWEATERS', link: '/womens/clothing/sweaters/' },
      { name: 'PANTS', link: '/womens/clothing/pants/' },
      { name: 'TEES', link: '/womens/clothing/tees/' },
      { name: 'TOPS_SHIRTS', link: '/womens/clothing/tops-shirts/' },
      { name: 'COATS_JACKETS', link: '/womens/clothing/jackets-coats/' },
    ],
  },
  {
    main: 'SHOES',
    link: 'https://www.madewell.com/womens/shoes/',
    subs: [
      { name: 'BOOTS', link: '/womens/shoes/?r_categories=Boots' },
      { name: 'TALL_BOOTS', link: '/womens/shoes/?r_categories=Tall%20Boots' },
      {
        name: 'BALLET_FLATS',
        link: '/womens/shoes/?r_categories=Ballet%20Flats',
      },
      {
        name: 'FLATS_LOAFERS',
        link: '/womens/shoes/?r_categories=Flats%20%2B%20Loafers',
      },
      { name: 'HEELS', link: '/womens/shoes/?r_categories=Heels' },
      { name: 'SNEAKERS', link: '/womens/shoes/?r_categories=Sneakers' },
    ],
  },
  {
    main: 'JEWELRY',
    link: 'https://www.madewell.com/womens/accessories/jewelry/',
    subs: [
      {
        name: 'EARRINGS',
        link: '/womens/accessories/jewelry/?r_categories=Earrings',
      },
      {
        name: 'NECKLACES',
        link: '/womens/accessories/jewelry/?r_categories=Necklaces',
      },
      {
        name: 'RINGS',
        link: '/womens/accessories/jewelry/?r_categories=Rings',
      },
      {
        name: 'BRACELETS',
        link: '/womens/accessories/jewelry/?r_categories=Bracelets',
      },
      {
        name: 'DEMI_FINE',
        link: '/womens/accessories/jewelry/?r_categories=Demi-Fine',
      },
      {
        name: 'CHARMS',
        link: '/womens/accessories/jewelry/?r_categories=Charms',
      },
    ],
  },
  {
    main: 'BAGS',
    link: 'https://www.madewell.com/womens/accessories/bags/',
    subs: [
      { name: 'TOTES', link: '/womens/accessories/bags/?r_categories=Totes' },
      {
        name: 'BUCKET_BAGS',
        link: '/womens/accessories/bags/?r_categories=Bucket%20Bags',
      },
      {
        name: 'SHOULDER_BAGS',
        link: '/womens/accessories/bags/?r_categories=Shoulder%20Bags',
      },
      {
        name: 'MINI_BAGS',
        link: '/womens/accessories/bags/?r_categories=Mini%20Bags',
      },
      {
        name: 'CROSSBODY_BAGS',
        link: '/womens/accessories/bags/?r_categories=Crossbody%20Bags',
      },
      {
        name: 'SUEDE_BAGS',
        link: '/womens/accessories/bags/?r_fabricMaterial-detail=Suede',
      },
    ],
  },
  {
    main: 'ACCESSORIES',
    link: 'https://www.madewell.com/womens/accessories/',
    subs: [
      { name: 'BELTS', link: '/womens/accessories/belts/' },
      { name: 'HATS', link: '/womens/accessories/hats/' },
      { name: 'POUCHES_WALLETS', link: '/womens/accessories/pouches-wallets/' },
      { name: 'SOCKS', link: '/womens/accessories/socks/' },
    ],
  },
];
