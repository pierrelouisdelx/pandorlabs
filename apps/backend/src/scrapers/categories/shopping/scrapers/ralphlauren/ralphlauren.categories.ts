/** Ralph Lauren category → `cgid` listing, ported verbatim from the Python `RalphLaurenScraper.categories`. */
export interface RalphLaurenSub {
  name: string;
  id: string;
}

export interface RalphLaurenCategory {
  main: string;
  subs: RalphLaurenSub[];
}

export const RALPH_LAUREN_CATEGORIES: RalphLaurenCategory[] = [
  {
    main: 'CLOTHING',
    subs: [
      { name: 'Sweaters', id: 'women-clothing-sweaters' },
      { name: 'Dresses & Jumpsuits', id: 'women-clothing-dresses-jumpsuits' },
      { name: 'Coats & Jackets', id: 'women-clothing-jackets-coats-vests' },
      { name: 'Blazers', id: 'women-clothing-blazers' },
      { name: 'Shirts & Blouses', id: 'women-clothing-shirts-blouses' },
      {
        name: 'Sweatshirts & Sweatpants',
        id: 'women-clothing-sweatshirts-sweatpants',
      },
      { name: 'Polo Shirts', id: 'women-clothing-polo-shirts' },
      { name: 'T-Shirts', id: 'women-clothing-t-shirts-tanks' },
      { name: 'Pants', id: 'women-clothing-pants' },
      { name: 'Jeans', id: 'women-clothing-jeans' },
      { name: 'Skirts', id: 'women-clothing-skirts' },
      { name: 'Sleepwear & Intimates', id: 'women-clothing-sleepwear' },
      { name: 'Shorts', id: 'women-clothing-shorts' },
      { name: 'Swim & Cover-Ups', id: 'women-clothing-swimwear' },
      { name: 'Vintage', id: 'women-clothing-vintage' },
      { name: 'All Clothing', id: 'women-clothing-view-all-mobile' },
    ],
  },
  {
    main: 'BAGS',
    subs: [
      { name: 'Shoulder Bags', id: 'women-handbags-shoulder-bags' },
      { name: 'Tote Bags', id: 'women-handbags-totes' },
      { name: 'Crossbody Bags & Clutches', id: 'women-handbags-crossbodys' },
      { name: 'Top Handles & Satchels', id: 'women-handbags-top-handles' },
      { name: 'Backpacks & Belt Bags', id: 'women-handbags-backpacks' },
      { name: 'All Bags', id: 'women-bags-view-all-mobile' },
    ],
  },
  {
    main: 'SHOES',
    subs: [
      { name: 'Boots & Booties', id: 'women-footwear-boots' },
      { name: 'Heels & Pumps', id: 'women-footwear-pumps' },
      { name: 'Flats', id: 'women-footwear-flats' },
      { name: 'Sneakers', id: 'women-footwear-sneakers' },
      { name: 'Sandals & Wedges', id: 'women-footwear-sandals' },
      { name: 'All Shoes', id: 'women-footwear-view-all-mobile' },
    ],
  },
  {
    main: 'JEWELRY',
    subs: [
      { name: 'Jewelry', id: 'women-accessories-jewelry' },
      { name: 'Watches & Fine Jewelry', id: 'women-watches-jewelry-feat-rd' },
      { name: 'Watches & Fine Jewelry', id: 'women-accessories-watches' },
    ],
  },
  {
    main: 'ACCESSORIES',
    subs: [
      {
        name: 'Hats, Scarves & Gloves',
        id: 'women-accessories-hats-scarves-gloves',
      },
      { name: 'Belts', id: 'women-accessories-belts' },
      { name: 'Socks', id: 'women-accessories-socks-tights' },
      {
        name: 'Wallets & Small Leather Goods',
        id: 'women-accessories-small-leather-goods',
      },
      { name: 'Sunglasses', id: 'women-accessories-sunglasses-eyewear' },
      { name: 'Lifestyle Accessories', id: 'women-accessories-lifestyle' },
      {
        name: 'All Accessories',
        id: 'women-shoes-and-accessories-view-all-mobile',
      },
    ],
  },
];
