/** Shopbop category → `categoryId` listing, ported verbatim from the Python `ShopbopScraper.categories`. */
export interface ShopbopSub {
  link: string; // categoryId
  name: string;
}

export interface ShopbopCategory {
  main: string;
  subs: ShopbopSub[];
}

export const SHOPBOP_CATEGORIES: ShopbopCategory[] = [
  {
    main: 'CLOTHING',
    subs: [
      { link: '74367', name: 'Activewear' },
      { link: '13351', name: 'Dresses' },
      { link: '62708', name: 'Inclusive Sizes' },
      { link: '13414', name: 'Jackets & Coats' },
      { link: '13377', name: 'Jeans' },
      { link: '13267', name: 'Jumpsuits & Rompers' },
      { link: '13269', name: 'Lingerie' },
      { link: '13346', name: 'Matching Sets' },
      { link: '13281', name: 'Pants' },
      { link: '13297', name: 'Shorts' },
      { link: '13302', name: 'Skirts' },
      { link: '13317', name: 'Sweaters & Knits' },
      { link: '13311', name: 'Swimsuits & Cover-Ups' },
      { link: '13332', name: 'Tops' },
    ],
  },
  {
    main: 'SHOES',
    subs: [
      { link: '13460', name: 'Boots' },
      { link: '67599', name: 'Clogs' },
      { link: '13487', name: 'Espadrilles' },
      { link: '13455', name: 'Flats' },
      { link: '13449', name: 'Pumps' },
      { link: '13490', name: 'Rain & Winter Boots' },
      { link: '13441', name: 'Sandals' },
      { link: '13439', name: 'Sneakers & Athletic' },
    ],
  },
  {
    main: 'BAGS',
    subs: [
      { link: '13505', name: 'All Bags' },
      { link: '13512', name: 'Backpacks' },
      { link: '13521', name: 'Beach & Straw Bags' },
      { link: '36613', name: 'Bucket Bags' },
      { link: '13511', name: 'Clutches' },
      { link: '13513', name: 'Cross Body Bags' },
      { link: '13506', name: 'Luggage & Weekenders' },
      { link: '59452', name: 'Mini Bags' },
      { link: '13509', name: 'Shoulder Bags' },
      { link: '56475', name: 'Sling & Belt Bags' },
      { link: '13524', name: 'Top Handle Bags' },
      { link: '13507', name: 'Totes' },
    ],
  },
  {
    main: 'ACCESSORIES',
    subs: [
      { link: '13577', name: 'Belts' },
      { link: '13576', name: 'Gloves' },
      { link: '13575', name: 'Hair Accessories' },
      { link: '13574', name: 'Hats' },
      { link: '13564', name: 'Scarves & Wraps' },
      { link: '13578', name: 'Socks & Tights' },
      { link: '13558', name: 'Sunglasses & Eyewear' },
      { link: '13586', name: 'Travel Accessories' },
    ],
  },
  {
    main: 'JEWELRY',
    subs: [
      { link: '13547', name: 'Bracelets' },
      { link: '13544', name: 'Earrings' },
      { link: '13543', name: 'Necklaces' },
      { link: '13541', name: 'Rings' },
      { link: '13561', name: 'Watches' },
      { link: '48184', name: 'Fine Jewelry' },
    ],
  },
];
