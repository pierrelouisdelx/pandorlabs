/**
 * Per-brand content for the `/products/shopping/[brand]` landing pages.
 *
 * One entry per dedicated scraper in the backend's `categories/shopping`
 * module. `scraperId` matches the id the scraper registers itself under, so a
 * page and its collector can always be traced to one another.
 *
 * Everything here is rendered as page copy and fed into JSON-LD, so keep the
 * prose specific to the brand — templated filler is what gets these pages
 * treated as thin content.
 */

export type BrandSegment =
  | 'high-street'
  | 'contemporary'
  | 'luxury-marketplace'
  | 'luxury-house'
  | 'independent'

export interface BrandFaq {
  question: string
  answer: string
}

export interface Brand {
  /** URL segment: /products/shopping/<slug> */
  slug: string
  /**
   * The brand's own colour, used to theme its page. Where the identity is
   * monochrome — most of luxury — this is the neutral the brand actually
   * presents in rather than an invented hue. Run through `accentTokens()`
   * before use: several of these are too dark or too light to apply directly.
   */
  accent: string
  /** Backend scraper id (`categories/shopping/scrapers/<id>`) */
  scraperId: string
  name: string
  siteUrl: string
  /** Bare hostname, shown in the spec table. */
  domain: string
  segment: BrandSegment
  /** Short origin line — country, and founding year where it is well documented. */
  origin: string
  /** Product families the collector covers. */
  categories: string[]
  /** How the collector reaches the catalogue, in plain language. */
  method: string
  /** 2–4 sentences on the brand itself. */
  intro: string
  /** 2–3 sentences on who buys this feed and what they do with it. */
  whyItMatters: string
  /** Fields that are notable or unusual for this particular source. */
  notableFields: string[]
  /** Brand-specific questions. Generic ones are appended by the page. */
  faqs: BrandFaq[]
}

export const BRAND_SEGMENT_LABELS: Record<BrandSegment, string> = {
  'high-street': 'High street & fast fashion',
  contemporary: 'Contemporary & direct-to-consumer',
  'luxury-marketplace': 'Luxury marketplace & e-tail',
  'luxury-house': 'Luxury house',
  independent: 'Independent & artisan',
}

export const BRAND_SEGMENT_ORDER: BrandSegment[] = [
  'high-street',
  'contemporary',
  'luxury-marketplace',
  'luxury-house',
  'independent',
]

export const BRANDS: Brand[] = [
  {
    slug: 'zara',
    accent: '#D8D2C8',
    scraperId: 'zara',
    name: 'Zara',
    siteUrl: 'https://www.zara.com/us/en/',
    domain: 'zara.com',
    segment: 'high-street',
    origin: 'Spain — founded 1975 in A Coruña',
    categories: ['Womenswear', 'Menswear', 'Shoes', 'Bags', 'Accessories'],
    method:
      "Zara's own category and product JSON endpoints, read through the storefront's internal ajax layer rather than by parsing rendered HTML",
    intro:
      'Zara is the flagship chain of Inditex and the reference point for the whole fast-fashion category. Its buying model turns new styles around in weeks rather than seasons, which means the catalogue on zara.com is one of the fastest-moving in retail: colourways appear, sell through, and disappear inside a single month. A snapshot taken today and a snapshot taken three weeks from now describe substantially different assortments.',
    whyItMatters:
      'Because Zara sets the pace, its assortment is the benchmark competitors trend-map against. Merchandising teams use the feed to see which silhouettes and colour stories get scaled, pricing teams use it to position their own entry price points, and trend forecasters use the drop cadence itself as a leading signal for the rest of the high street.',
    notableFields: [
      'Per-colourway product variants with their own image sets',
      'Composition and care text extracted from the product detail payload',
      'Category and subcategory path as Zara itself classifies the item',
      'Full-size price history when the feed is collected on a schedule',
    ],
    faqs: [
      {
        question: 'Which Zara region and language does the feed cover?',
        answer:
          'The default collector runs against the US English storefront, which carries USD pricing and the US assortment. Zara localises both catalogue and price by market, so if you need EU, UK, or APAC pricing we run a separate collection per locale and return them as distinct feeds you can join on product reference. Adding locales is part of standard onboarding rather than a custom build.',
      },
      {
        question: 'How quickly do new Zara drops appear in the data?',
        answer:
          'That is set by the refresh cadence you choose rather than by any limit on our side. Teams tracking drop velocity typically run Zara daily, which is enough to catch a style within a day of it going live. Slower cadences still capture the assortment accurately, they just blur the exact moment a product landed.',
      },
    ],
  },
  {
    slug: 'hm',
    accent: '#F5474F',
    scraperId: 'hm',
    name: 'H&M',
    siteUrl: 'https://www2.hm.com/en_us/women.html',
    domain: 'hm.com',
    segment: 'high-street',
    origin: 'Sweden — founded 1947 in Västerås',
    categories: ['Womenswear', 'Menswear', 'Shoes', 'Accessories'],
    method:
      "H&M's listing API together with the article endpoints that back its product pages, so variant and stock detail arrives structured",
    intro:
      'H&M is one of the largest apparel retailers in the world and operates at a scale that makes its catalogue useful as a market-wide index rather than a single competitor view. The assortment spans core basics that persist for years alongside trend pieces with short lifecycles, and the two behave very differently in a price series — which is precisely what makes the source interesting.',
    whyItMatters:
      'H&M is the volume anchor of the mass market, so its entry price on a category effectively sets the floor everyone else is measured against. Retail analysts use the feed for basket-level price indices, and private-label teams use it to check whether their own margin assumptions still hold as H&M moves.',
    notableFields: [
      'Article-level variants with per-colour codes and imagery',
      'Marked-down price alongside the original list price',
      'Materials and sustainability attributes where H&M publishes them',
      'Availability signals per size where the storefront exposes them',
    ],
    faqs: [
      {
        question: 'Does the feed separate H&M markdowns from list price?',
        answer:
          'Yes. H&M exposes both the current selling price and the original price on discounted articles, and we carry both through as separate fields rather than collapsing them. That makes discount depth directly computable, which is usually the number pricing teams actually want rather than the sale price on its own.',
      },
      {
        question: 'Can you cover H&M Group brands beyond H&M itself?',
        answer:
          'We already run dedicated collectors for COS and Arket, both H&M Group labels, and they are delivered on the same schema. Running the group as one combined feed with a brand field is a supported configuration, so you can analyse the portfolio as a whole or split it back out per label.',
      },
    ],
  },
  {
    slug: 'mango',
    accent: '#F2A93B',
    scraperId: 'mango',
    name: 'Mango',
    siteUrl: 'https://shop.mango.com/us',
    domain: 'shop.mango.com',
    segment: 'high-street',
    origin: 'Spain — founded 1984 in Barcelona',
    categories: ['Womenswear', 'Menswear', 'Shoes', 'Bags', 'Accessories'],
    method:
      "Mango's structured catalogue responses, read per category so the brand's own taxonomy is preserved on the way out",
    intro:
      'Mango sits a step above the pure fast-fashion tier, with a Mediterranean tailoring and occasionwear bias that separates it from its Spanish neighbour Inditex. Its assortment turns over quickly but holds price better than the true value end of the market, which makes it a useful mid-point when you are trying to place a brand between the high street and contemporary labels.',
    whyItMatters:
      'For anyone benchmarking European mid-market apparel, Mango is the comparison that stops a price index being purely Inditex-shaped. Its promotional calendar is also distinctly Spanish, so tracking it surfaces markdown windows that do not line up with US or UK retail rhythms.',
    notableFields: [
      'Colourway variants with per-variant imagery',
      'Category and subcategory as classified by Mango',
      'Composition text where the product detail exposes it',
      'Original and discounted price during promotional periods',
    ],
    faqs: [
      {
        question: 'Which Mango storefront is collected?',
        answer:
          'The US storefront by default, which returns USD prices. Mango runs materially different pricing and assortment across its European markets, so if you are benchmarking Spain or the wider EU we collect those locales separately and hand back one feed per market, joinable on product reference.',
      },
      {
        question: 'Does the feed include Mango Man and Mango Kids?',
        answer:
          'Womenswear is the default scope because it is what most customers benchmark, but the collector is not limited to it. Menswear and kidswear are collected on request and arrive on the same schema with a department field, so you can widen coverage without changing anything downstream.',
      },
    ],
  },
  {
    slug: 'massimo-dutti',
    accent: '#C8A96A',
    scraperId: 'massimodutti',
    name: 'Massimo Dutti',
    siteUrl: 'https://www.massimodutti.com/us/',
    domain: 'massimodutti.com',
    segment: 'high-street',
    origin: 'Spain — Inditex group, Barcelona',
    categories: ['Womenswear', 'Menswear', 'Shoes', 'Leather goods'],
    method:
      "Inditex's internal catalogue JSON endpoints, the same structured feed that backs the storefront's own category grids",
    intro:
      'Massimo Dutti is the elevated end of the Inditex portfolio: tailoring, leather, and knitwear priced well above Zara but assorted with the same supply-chain discipline. The catalogue moves more slowly than its sister chains and holds full price longer, so its price series behaves much more like a contemporary label than a fast-fashion one.',
    whyItMatters:
      'Massimo Dutti is the clearest example of a fast-fashion operator competing on quality perception rather than price, which makes it the benchmark contemporary brands are most often measured against. Tracking it alongside Zara shows exactly how much price separation Inditex maintains between its own tiers.',
    notableFields: [
      'Leather and fabric composition detail from the product payload',
      'Colourway variants with dedicated imagery per colour',
      "Inditex's own category path, preserved rather than remapped",
      'List and promotional price captured separately',
    ],
    faqs: [
      {
        question: 'How does Massimo Dutti data compare to the Zara feed?',
        answer:
          'Both come from Inditex systems, so the underlying structure is similar and the two are genuinely comparable once normalised — which is the point. The difference is behavioural: Massimo Dutti carries fewer styles, holds them longer, and discounts less often, so a like-for-like price series across the two shows the group tiering its own portfolio.',
      },
      {
        question: 'Are menswear and womenswear both covered?',
        answer:
          'Yes. Massimo Dutti is one of the few sources where menswear is as commercially significant as womenswear, so both departments are collected by default and arrive tagged with a department field on the same schema.',
      },
    ],
  },
  {
    slug: 'cos',
    accent: '#D6D2CB',
    scraperId: 'cos',
    name: 'COS',
    siteUrl: 'https://www.cos.com/en-us/women',
    domain: 'cos.com',
    segment: 'high-street',
    origin: 'United Kingdom — launched 2007, H&M Group',
    categories: ['Womenswear', 'Menswear', 'Shoes', 'Accessories'],
    method:
      "COS's internal search API plus the Next.js data endpoints behind its product pages, so the structured payload is read directly",
    intro:
      'COS — Collection of Style — was H&M Group\'s first move upmarket, and it defined the architectural minimalism that a decade of contemporary labels went on to copy. The assortment is deliberately small, heavily repeated season to season, and priced at a premium that the group protects carefully. Very little of it is ever deeply discounted.',
    whyItMatters:
      'COS is the reference point for minimalist contemporary pricing, and because its core styles persist across seasons its catalogue makes an unusually clean longitudinal series. Brands positioning in the same space use it to check whether their own price ladder reads as premium or as high street.',
    notableFields: [
      'Stable product identifiers across seasonal carry-over styles',
      'Composition and care detail from the structured page data',
      'Colourway variants with per-colour image sets',
      'Category taxonomy as COS classifies it',
    ],
    faqs: [
      {
        question: 'Is COS worth tracking if I already collect H&M?',
        answer:
          'They answer different questions. H&M tells you where the volume market sits; COS tells you what the same group charges when it removes price from the pitch. Customers benchmarking premium basics almost always want COS specifically, because H&M pricing is not a useful comparison at that tier.',
      },
      {
        question: 'Does the feed capture carry-over styles across seasons?',
        answer:
          'Yes, and it is one of the more useful properties of this source. COS repeats core styles year after year under stable identifiers, so a collection run on a regular cadence produces a genuine multi-year price and availability series rather than a set of disconnected seasonal snapshots.',
      },
    ],
  },
  {
    slug: 'arket',
    accent: '#E0A98F',
    scraperId: 'arket',
    name: 'Arket',
    siteUrl: 'https://www.arket.com/en-ww/women/',
    domain: 'arket.com',
    segment: 'high-street',
    origin: 'Sweden — launched 2017, H&M Group',
    categories: ['Womenswear', 'Menswear', 'Kidswear', 'Home'],
    method:
      "Arket's internal search API, queried per category so pagination is handled server-side and the full assortment is enumerated",
    intro:
      'Arket is H&M Group\'s Nordic essentials label, built around durable everyday pieces, transparent material sourcing, and a smaller, slower-moving assortment than anything else in the group. It spans womenswear, menswear, kidswear, and home from a single catalogue, which is unusual at its price point.',
    whyItMatters:
      'Arket is where sustainability claims and price meet in a way that is actually measurable: the storefront publishes material composition and provenance alongside price, so the feed supports both pricing analysis and materials-sourcing research from one source. Its cross-category assortment also makes it a useful single-brand proxy for lifestyle retail.',
    notableFields: [
      'Material composition and provenance where Arket publishes it',
      'Department coverage spanning womenswear, menswear, kids, and home',
      'Colourway variants with dedicated imagery',
      'Category path as Arket classifies it',
    ],
    faqs: [
      {
        question: 'Does the Arket feed include the home and kids ranges?',
        answer:
          'It can. The collector is driven by category, so the departments included are a configuration choice rather than a rebuild. Womenswear is the default; adding home, kids, or menswear is part of onboarding and they arrive on the same schema with a department field.',
      },
      {
        question: 'Can I get Arket material and sustainability attributes?',
        answer:
          'Where Arket publishes them on the product page, yes — composition and provenance are extracted into their own fields rather than left inside a description blob. Coverage depends on what the brand chooses to disclose per product, so treat those fields as populated-where-available rather than guaranteed.',
      },
    ],
  },
  {
    slug: 'stefanel',
    accent: '#C9B79C',
    scraperId: 'stefanel',
    name: 'Stefanel',
    siteUrl: 'https://www.stefanel.com/ie/women',
    domain: 'stefanel.com',
    segment: 'high-street',
    origin: 'Italy — founded 1959 in the Veneto',
    categories: ['Womenswear', 'Knitwear', 'Outerwear'],
    method:
      'the structured product responses behind the Stefanel storefront, read per category so pricing arrives already separated from presentation markup',
    intro:
      'Stefanel is an Italian knitwear house that grew out of the Veneto textile district and built its name on wool and cotton knits rather than on trend turnover. The assortment is knit-led and seasonal, with a price position squarely in the European mid-market.',
    whyItMatters:
      'Knitwear is one of the hardest categories to benchmark because gauge and fibre drive price far more than silhouette does. Stefanel is a useful anchor precisely because it is knit-specialised: its ladder tells you what the European mid-market charges for a given fibre content, which is hard to extract from generalist retailers.',
    notableFields: [
      'Fibre composition, which drives price in the knitwear category',
      'Seasonal category classification from the storefront',
      'List and promotional price captured separately',
      'Colourway variants with imagery',
    ],
    faqs: [
      {
        question: 'Which Stefanel market does the feed cover?',
        answer:
          'The default run is the Irish English storefront, which returns euro pricing and the EU assortment. Other European markets are available as separate feeds if you need per-country price comparison, since Stefanel does not price uniformly across the region.',
      },
      {
        question: 'Is knitwear composition reliably captured?',
        answer:
          'Composition is extracted into its own field wherever Stefanel publishes it, which for a knit-led brand is most of the catalogue. It is the single most useful attribute in this feed, because comparing a merino piece against an acrylic one on price alone tells you nothing.',
      },
    ],
  },
  {
    slug: 'falconeri',
    accent: '#D2B48C',
    scraperId: 'falconeri',
    name: 'Falconeri',
    siteUrl: 'https://www.falconeri.com',
    domain: 'falconeri.com',
    segment: 'high-street',
    origin: 'Italy — Calzedonia Group, Verona',
    categories: ['Knitwear', 'Cashmere', 'Womenswear', 'Menswear'],
    method:
      "Salesforce Commerce Cloud's shopper-search and shopper-products JSON APIs, which return the catalogue in a stable documented shape",
    intro:
      'Falconeri is the Calzedonia Group\'s cashmere and fine-knit label, selling directly at prices that undercut traditional cashmere houses by a wide margin. The whole proposition rests on fibre quality at an accessible price, so the catalogue is unusually explicit about material grade.',
    whyItMatters:
      'Falconeri is the clearest available benchmark for the accessible-cashmere segment, a category that has grown quickly and where price transparency is poor. Anyone selling cashmere essentials is being compared to Falconeri whether they track it or not.',
    notableFields: [
      'Fibre grade and composition, the core price driver in this catalogue',
      'SFCC product identifiers, stable across collection runs',
      'Colourway variants with per-colour imagery',
      'Original and promotional pricing captured separately',
    ],
    faqs: [
      {
        question: 'Why does the SFCC-backed collection matter here?',
        answer:
          'Falconeri runs on Salesforce Commerce Cloud, so the catalogue is available through documented shopper APIs rather than only as rendered HTML. That means stable product identifiers and structured attributes, and it means layout redesigns on the storefront do not break the feed the way they would with a markup-based extractor.',
      },
      {
        question: 'Are both the womenswear and menswear lines covered?',
        answer:
          'Yes. Falconeri sells materially to both, and because they share a catalogue structure both departments are collected by default and tagged with a department field.',
      },
    ],
  },
  {
    slug: 'intimissimi',
    accent: '#EE8CA6',
    scraperId: 'intimissimi',
    name: 'Intimissimi',
    siteUrl: 'https://www.intimissimi.com/en-us/',
    domain: 'intimissimi.com',
    segment: 'high-street',
    origin: 'Italy — Calzedonia Group, Verona',
    categories: ['Lingerie', 'Loungewear', 'Hosiery'],
    method:
      'category page collection with per-product enrichment, tuned for a catalogue where size and cup variants matter as much as colour',
    intro:
      'Intimissimi is the Calzedonia Group\'s lingerie chain and one of the largest specialist intimates retailers in Europe. Its catalogue is structured around size and cup grids rather than the simple size runs used in outerwear, which makes it a genuinely different shape of data from a typical apparel feed.',
    whyItMatters:
      'Lingerie pricing is difficult to benchmark because assortment depth sits in the size grid, not the style count — two brands with the same number of styles can differ enormously in inventory commitment. Intimissimi is the European volume reference for that category, and the grid detail is what makes the comparison meaningful.',
    notableFields: [
      'Size and cup grid depth per style, not just a style count',
      'Colourway variants with per-colour imagery',
      'Category classification across lingerie, loungewear, and hosiery',
      'List and promotional price captured separately',
    ],
    faqs: [
      {
        question: 'Does the feed capture the full size and cup grid?',
        answer:
          'It captures the grid as the storefront exposes it, which is the meaningful measure for this category. Style-count comparisons are misleading in lingerie because assortment depth lives in the grid — a brand offering a style in four cups and six bands has committed far more inventory than one offering the same style in two sizes.',
      },
      {
        question: 'Is hosiery included alongside lingerie?',
        answer:
          'Yes, where the storefront carries it. Hosiery, loungewear, and lingerie are collected together and arrive tagged by category, so you can split them apart or analyse the assortment as a whole.',
      },
    ],
  },
  {
    slug: 'j-crew',
    accent: '#E15A5A',
    scraperId: 'jcrew',
    name: 'J.Crew',
    siteUrl: 'https://www.jcrew.com',
    domain: 'jcrew.com',
    segment: 'contemporary',
    origin: 'United States — New York',
    categories: ['Womenswear', 'Menswear', 'Shoes', 'Accessories'],
    method:
      'listing and product page collection with the long-form product description extracted into its own field',
    intro:
      'J.Crew is the definitive American preppy classic label, built on chinos, oxford shirts, and cashmere, with a promotional calendar that is aggressive even by US retail standards. Sitewide percentage-off events run frequently enough that list price and selling price diverge for much of the year.',
    whyItMatters:
      'J.Crew is the best available case study in US promotional retail: the gap between list and realised price is large, persistent, and visible. Pricing teams use the feed to model promotional depth and cadence rather than just to read a current price, which is what makes it more valuable than a single-snapshot comparison.',
    notableFields: [
      'Long-form product descriptions carried through as structured text',
      'List price alongside promotional price during sitewide events',
      'Colourway variants with dedicated imagery',
      'Category path across both departments',
    ],
    faqs: [
      {
        question: 'Does the feed track J.Crew promotional events?',
        answer:
          'It captures list and selling price separately on every run, so a scheduled collection reconstructs the promotional calendar as a by-product. For a retailer that discounts as often as J.Crew, that series is usually more useful than any single price reading.',
      },
      {
        question: 'Is Madewell available on the same schema?',
        answer:
          'Yes — Madewell has its own dedicated collector and delivers on the identical schema, so the two sister brands can be analysed as one feed with a brand field or kept separate. Denim price comparison across the pair is a common reason customers take both.',
      },
    ],
  },
  {
    slug: 'madewell',
    accent: '#6D93CC',
    scraperId: 'madewell',
    name: 'Madewell',
    siteUrl: 'https://www.madewell.com',
    domain: 'madewell.com',
    segment: 'contemporary',
    origin: 'United States — denim-led, J.Crew Group',
    categories: ['Denim', 'Womenswear', 'Menswear', 'Shoes', 'Bags'],
    method:
      'listing and product page collection, with fit and wash attributes pulled out of the denim product detail',
    intro:
      'Madewell is a denim-first American label, sister to J.Crew, whose catalogue is organised around fit names and washes more than around seasonal collections. Jeans persist under stable fit identifiers for years while washes rotate constantly, which produces a very particular data shape.',
    whyItMatters:
      'Denim is one of the few apparel categories where fit is a durable, comparable attribute across brands, and Madewell is the US contemporary benchmark for it. Merchandisers use the feed to track which fits get expanded or retired and how wash rotation drives markdown behaviour.',
    notableFields: [
      'Fit and wash attributes extracted from denim product detail',
      'Stable fit identifiers persisting across seasons',
      'Inseam and size run coverage where published',
      'List and promotional price captured separately',
    ],
    faqs: [
      {
        question: 'Are denim fit and wash separated in the data?',
        answer:
          'Yes, and that separation is the point of this source. Fit is durable and comparable across brands while wash rotates seasonally, so keeping them in distinct fields lets you track fit lifecycle and wash turnover independently instead of treating every new wash as a new product.',
      },
      {
        question: 'Can Madewell and J.Crew be delivered together?',
        answer:
          'Yes. Both run on the same schema, so we can deliver a combined J.Crew Group feed with a brand field or two separate feeds, whichever fits your pipeline. The combined form is the usual choice when the goal is group-level promotional analysis.',
      },
    ],
  },
  {
    slug: 'quince',
    accent: '#9FB292',
    scraperId: 'quince',
    name: 'Quince',
    siteUrl: 'https://www.quince.com',
    domain: 'quince.com',
    segment: 'contemporary',
    origin: 'United States — factory-direct essentials',
    categories: ['Womenswear', 'Menswear', 'Home', 'Bags', 'Accessories'],
    method:
      'the structured product data embedded in Quince product pages, including the schema markup the storefront publishes for its own SEO',
    intro:
      'Quince built its business on a single argument: cut the brand markup and sell cashmere, silk, and leather essentials at factory-adjacent prices. The catalogue spans apparel, home, and accessories, and almost every listing is framed as an explicit comparison against what a traditional brand would charge.',
    whyItMatters:
      'Quince is the most aggressive price disruptor in premium basics, which makes it the single most useful competitive reference for anyone selling cashmere, silk, or leather essentials. When Quince moves a price on a category, it moves the perceived fair value of that category.',
    notableFields: [
      'Material composition, which is central to the Quince proposition',
      'Structured schema data published by the storefront itself',
      'Cross-category coverage spanning apparel, home, and accessories',
      'Colourway variants with per-colour imagery',
    ],
    faqs: [
      {
        question: 'Why is Quince a useful benchmark specifically?',
        answer:
          'Because it prices premium materials against factory cost rather than against category convention. If you sell cashmere or silk essentials, Quince is the number your customer is comparing you to, and its price on a comparable fibre grade is the most actionable single data point in that category.',
      },
      {
        question: 'Does the feed cover the home range as well as apparel?',
        answer:
          'Yes. Quince runs bedding, bath, and home goods on the same catalogue structure as apparel, so the collector covers them under the same schema with a category field. That is unusual — most apparel feeds stop at clothing.',
      },
    ],
  },
  {
    slug: 'reformation',
    accent: '#E4655C',
    scraperId: 'thereformation',
    name: 'Reformation',
    siteUrl: 'https://www.thereformation.com',
    domain: 'thereformation.com',
    segment: 'contemporary',
    origin: 'United States — founded 2009 in Los Angeles',
    categories: ['Womenswear', 'Dresses', 'Denim', 'Shoes'],
    method:
      'collection pages combined with the Salesforce Commerce Cloud search grid, so both the curated collection view and the full catalogue are captured',
    intro:
      'Reformation is the Los Angeles label that made sustainability a mainstream selling point rather than a niche claim, publishing environmental impact data alongside price on its product pages. Its assortment is dress-heavy and occasion-led, with a distinctive silhouette vocabulary that other contemporary brands track closely.',
    whyItMatters:
      'Reformation is the reference brand for sustainability-positioned contemporary womenswear, and because it publishes impact claims next to price it is one of the few sources where you can study what a sustainability position actually costs the customer. Trend teams also watch it as an early indicator for occasionwear silhouettes.',
    notableFields: [
      'Sustainability and material attributes where Reformation publishes them',
      'Collection membership as well as flat category classification',
      'Dress silhouette and length attributes from product detail',
      'List and promotional price captured separately',
    ],
    faqs: [
      {
        question: 'Are sustainability claims captured as structured fields?',
        answer:
          'Where Reformation publishes them on the product page, yes — they land in their own fields rather than buried in a description string. Coverage tracks whatever the brand discloses per product, so treat it as populated-where-available. It is one of the few catalogues where this analysis is possible at all.',
      },
      {
        question: 'Does the feed reflect Reformation collections and drops?',
        answer:
          'Yes. Collection membership is captured alongside the flat category path, because Reformation merchandises heavily by drop and losing that grouping would flatten out exactly the signal trend teams are looking for.',
      },
    ],
  },
  {
    slug: 'filippa-k',
    accent: '#CDD4D8',
    scraperId: 'filippa_k',
    name: 'Filippa K',
    siteUrl: 'https://www.filippa-k.com/us/en/woman/',
    domain: 'filippa-k.com',
    segment: 'contemporary',
    origin: 'Sweden — founded 1993 in Stockholm',
    categories: ['Womenswear', 'Outerwear', 'Knitwear', 'Tailoring'],
    method:
      "Salesforce Commerce Cloud's Search-UpdateGrid endpoint, which returns the paginated listing grid as structured data",
    intro:
      'Filippa K is a Stockholm label built on Scandinavian minimalism, longevity, and a deliberately restrained seasonal palette. Its assortment is small and heavily repeated, with tailoring and outerwear carrying the price ladder and core pieces persisting across years rather than seasons.',
    whyItMatters:
      'Filippa K anchors the premium end of Scandinavian minimalism, and its slow-moving catalogue makes it an unusually stable comparison point over time. Brands positioning against COS or Arket use it to check what the tier above those charges for comparable pieces.',
    notableFields: [
      'Stable identifiers across carry-over core styles',
      'Composition and fabric detail from product data',
      'Colourway variants with dedicated imagery',
      'SFCC pagination handled server-side for complete enumeration',
    ],
    faqs: [
      {
        question: 'How does Filippa K compare with COS and Arket?',
        answer:
          'All three are Scandinavian-minimal in aesthetic, but Filippa K sits a clear tier above on price and its catalogue turns over more slowly. Customers usually take all three together, because the interesting number is the price separation between them rather than any single brand in isolation.',
      },
      {
        question: 'Is menswear covered?',
        answer:
          'Womenswear is the default scope. Menswear is collected on request and arrives on the same schema with a department field, so widening coverage does not change anything downstream.',
      },
    ],
  },
  {
    slug: 'sezane',
    accent: '#E05548',
    scraperId: 'sezane',
    name: 'Sézane',
    siteUrl: 'https://www.sezane.com/us-en',
    domain: 'sezane.com',
    segment: 'contemporary',
    origin: 'France — founded 2013 in Paris',
    categories: ['Womenswear', 'Shoes', 'Bags', 'Accessories'],
    method:
      "collection pages combined with Sézane's store-product API, so limited drops are captured alongside the permanent range",
    intro:
      'Sézane was the first French digital-native fashion brand to reach real scale, and it built that scale on scarcity: limited monthly drops, frequent sell-outs, and a permanent collection that stays deliberately small. Very little of the catalogue is ever discounted.',
    whyItMatters:
      'Sézane is the case study for drop-driven direct-to-consumer retail, and its sell-out behaviour is the signal — availability tells you more about demand here than price ever will. Anyone modelling scarcity-based merchandising uses it as the reference implementation.',
    notableFields: [
      'Availability and sell-out state, the primary signal for this source',
      'Drop and collection membership alongside category',
      'Colourway variants with per-colour imagery',
      'French and US market pricing when both locales are collected',
    ],
    faqs: [
      {
        question: 'Does the feed capture Sézane sell-outs?',
        answer:
          'Yes, and for this brand availability is the point. Sézane discounts rarely, so price series are flat and uninformative while availability transitions are where the demand signal lives. A regular cadence turns those transitions into a sell-through proxy.',
      },
      {
        question: 'Can you collect the French storefront as well as the US one?',
        answer:
          'Yes. The US English storefront is the default, and the French market is available as a separate feed. Both are worth taking if you are studying how the brand stages drops across markets, since timing does not always align.',
      },
    ],
  },
  {
    slug: 'lilysilk',
    accent: '#DCC28E',
    scraperId: 'lilysilk',
    name: 'LILYSILK',
    siteUrl: 'https://www.lilysilk.com',
    domain: 'lilysilk.com',
    segment: 'contemporary',
    origin: 'Direct-to-consumer silk specialist',
    categories: ['Silk apparel', 'Bedding', 'Sleepwear', 'Accessories'],
    method:
      "LILYSILK's category product-list API, which returns the catalogue with its silk-specific attributes attached",
    intro:
      'LILYSILK sells mulberry silk apparel and bedding direct to consumer, and it competes almost entirely on a single specification: momme weight, the measure of silk density that determines both feel and price. The catalogue spans clothing, sleepwear, and bedding from one structure.',
    whyItMatters:
      'Silk is a category where a single specification drives price, which makes it unusually tractable for competitive analysis — but only if you capture that specification. LILYSILK is the volume reference for direct silk, and momme weight is what makes its prices comparable to anyone else\'s.',
    notableFields: [
      'Momme weight and silk grade, the price driver in this category',
      'Coverage spanning apparel, sleepwear, and bedding',
      'Colourway variants with per-colour imagery',
      'List and promotional price captured separately',
    ],
    faqs: [
      {
        question: 'Is silk momme weight captured?',
        answer:
          'Where LILYSILK publishes it, yes, as its own field. Without it a silk price comparison is meaningless — a 19 momme and a 25 momme piece are different products at different costs, and comparing them on price alone produces conclusions that are simply wrong.',
      },
      {
        question: 'Does the feed cover bedding as well as clothing?',
        answer:
          'Yes. Bedding is a significant part of the LILYSILK business and runs on the same catalogue structure, so it is collected under the same schema with a category field.',
      },
    ],
  },
  {
    slug: 'stand-studio',
    accent: '#C9D0D8',
    scraperId: 'standstudio',
    name: 'Stand Studio',
    siteUrl: 'https://www.standstudio.com/eu',
    domain: 'standstudio.com',
    segment: 'contemporary',
    origin: 'Sweden — Stockholm',
    categories: ['Outerwear', 'Faux leather', 'Faux shearling', 'Womenswear'],
    method:
      'the structured product data behind the Stand Studio storefront, read per category with material attributes preserved',
    intro:
      'Stand Studio is a Stockholm label that built its name on faux leather and faux shearling outerwear, arriving at exactly the moment the market started treating alternatives to animal materials as a design choice rather than a compromise. The catalogue is outerwear-dominated and highly seasonal.',
    whyItMatters:
      'Stand Studio is the clearest benchmark for premium alternative-material outerwear, a segment that grew fast and prices very differently from traditional leather. Its seasonality is also extreme, which makes it a good test case for anyone modelling outerwear markdown curves.',
    notableFields: [
      'Material attributes distinguishing alternative from traditional leather',
      'Strong seasonal category classification',
      'Colourway variants with dedicated imagery',
      'List and promotional price captured separately',
    ],
    faqs: [
      {
        question: 'Why track outerwear separately from general apparel?',
        answer:
          'Outerwear has the steepest markdown curve in apparel and a compressed selling window, so blending it into a general apparel index hides both effects. A dedicated outerwear source like Stand Studio lets you model that curve properly instead of averaging it away.',
      },
      {
        question: 'Which market does the feed cover?',
        answer:
          'The EU storefront by default, returning euro pricing. Other markets are available as separate feeds joinable on product reference if you need cross-region price comparison.',
      },
    ],
  },
  {
    slug: 'la-doublej',
    accent: '#FF62A8',
    scraperId: 'la_doublej',
    name: 'La DoubleJ',
    siteUrl: 'https://www.ladoublej.com/en',
    domain: 'ladoublej.com',
    segment: 'contemporary',
    origin: 'Italy — Milan',
    categories: ['Womenswear', 'Dresses', 'Homeware', 'Tableware'],
    method:
      'the structured product data behind La DoubleJ product pages, with print and pattern attributes preserved',
    intro:
      'La DoubleJ is a Milanese label built entirely around archival Italian prints, applied with equal seriousness to dresses and to tableware. It is one of very few fashion brands where homeware is a first-class part of the catalogue rather than an afterthought, and print identity matters more than silhouette.',
    whyItMatters:
      'Print-driven brands are difficult to analyse with conventional apparel attributes, because the print is the product. La DoubleJ is the reference case for that model, and its fashion-plus-homeware catalogue makes it useful to anyone studying how a print licence carries across product categories.',
    notableFields: [
      'Print and pattern identity carried as a first-class attribute',
      'Cross-category coverage spanning apparel and homeware',
      'Colourway and print variants with dedicated imagery',
      'Category path as La DoubleJ classifies it',
    ],
    faqs: [
      {
        question: 'Is the homeware range included?',
        answer:
          'Yes. Tableware and homeware sit in the same catalogue as apparel and are collected under the same schema with a category field. For this brand that matters — the same print running across a dress and a plate is the commercial idea, and splitting the two would break the analysis.',
      },
      {
        question: 'How is print handled in the data?',
        answer:
          'Print identity is preserved as an attribute rather than collapsed into a colour field. In a catalogue where the same silhouette ships in a dozen archival prints at the same price, print is the only thing that distinguishes the variants.',
      },
    ],
  },
  {
    slug: 'dunst-studio',
    accent: '#A9B7A2',
    scraperId: 'dunststudio',
    name: 'Dunst Studio',
    siteUrl: 'https://en.dunststudio.com',
    domain: 'dunststudio.com',
    segment: 'contemporary',
    origin: 'South Korea — Seoul',
    categories: ['Unisex', 'Outerwear', 'Womenswear', 'Menswear'],
    method:
      "Dunst's internal product listing endpoint, which returns the catalogue as structured records rather than rendered markup",
    intro:
      'Dunst is a Seoul label working in oversized, genderless silhouettes, and it sits inside the Korean contemporary scene that has become one of the most influential trend sources in global fashion. Much of the assortment is genuinely unisex rather than duplicated across departments.',
    whyItMatters:
      'Korean contemporary labels now lead rather than follow on silhouette, so tracking them gives you a lead time that Western contemporary brands cannot. Dunst is also a useful structural case: a genuinely unisex catalogue breaks the department-split assumption most apparel data models are built on.',
    notableFields: [
      'Unisex classification rather than forced department split',
      'Oversized fit and silhouette attributes from product detail',
      'Colourway variants with per-colour imagery',
      'Korean and international pricing where both are exposed',
    ],
    faqs: [
      {
        question: 'How is unisex sizing represented?',
        answer:
          'It is carried through as-is rather than duplicated into separate mens and womens records. Forcing a unisex catalogue into a department split double-counts the assortment and distorts every downstream count, so we keep the brand\'s own classification.',
      },
      {
        question: 'Why track Korean contemporary brands?',
        answer:
          'Silhouette trends increasingly originate in the Korean and wider East Asian contemporary scene and reach Western contemporary labels a season or more later. For trend teams that lead time is the whole value of the source.',
      },
    ],
  },
  {
    slug: 'atorie',
    accent: '#BFB2DD',
    scraperId: 'atorie',
    name: 'Atorie',
    siteUrl: 'https://shopatorie.com',
    domain: 'shopatorie.com',
    segment: 'contemporary',
    origin: 'Independent direct-to-consumer label',
    categories: ['Womenswear', 'Clothing'],
    method:
      "Atorie's internal search API, queried directly so the full catalogue is enumerated without depending on page markup",
    intro:
      'Atorie is a small independent label selling direct from its own storefront, with a tightly edited womenswear assortment and no wholesale distribution to muddy its pricing. Catalogues this size behave very differently from mass retail: every style is a deliberate bet.',
    whyItMatters:
      'Small direct-to-consumer labels are where new silhouettes and price experiments show up first, before larger brands commit. Tracking a set of them alongside the majors is how trend teams see movement early — and because there is no wholesale channel, the price you see is the price the market pays.',
    notableFields: [
      'Complete catalogue enumeration rather than a sampled subset',
      'Colourway variants with per-colour imagery',
      'Direct-to-consumer pricing with no wholesale distortion',
      'Availability state per style',
    ],
    faqs: [
      {
        question: 'Why include small independent labels in a data feed?',
        answer:
          'Because they move first. Large retailers commit to a silhouette only once it is proven, while small direct-to-consumer labels test constantly. A basket of them is a leading indicator, and each one is small enough that we can enumerate its catalogue completely rather than sampling.',
      },
      {
        question: 'Is the whole catalogue captured?',
        answer:
          'Yes. At this catalogue size complete enumeration is straightforward, so the feed is the full assortment rather than a sample. That matters for trend work, where the interesting item is usually the outlier rather than the bestseller.',
      },
    ],
  },
  {
    slug: 'farfetch',
    accent: '#C9D4E0',
    scraperId: 'farfetch',
    name: 'Farfetch',
    siteUrl: 'https://www.farfetch.com',
    domain: 'farfetch.com',
    segment: 'luxury-marketplace',
    origin: 'United Kingdom — founded 2007 in London',
    categories: ['Luxury womenswear', 'Menswear', 'Shoes', 'Bags', 'Watches'],
    method:
      "Farfetch's internal JSON API, which returns the multi-boutique inventory with seller attribution intact",
    intro:
      'Farfetch is the largest luxury marketplace in the world, aggregating stock from hundreds of independent boutiques and brand partners into a single storefront. Because inventory is federated rather than owned, the same designer product frequently appears at different prices from different sellers in different countries.',
    whyItMatters:
      'That federated structure is exactly what makes Farfetch valuable as data: it is the widest available view of luxury inventory and the only practical way to observe cross-boutique price dispersion on the same SKU. Brands use it to monitor how their products are actually being priced in the wholesale channel.',
    notableFields: [
      'Seller and boutique attribution per listing',
      'Designer and brand as separate fields from the product name',
      'Cross-boutique price dispersion on identical products',
      'Size availability per seller',
    ],
    faqs: [
      {
        question: 'Does the feed identify which boutique holds each listing?',
        answer:
          'Yes. Seller attribution is preserved per listing, and for a marketplace it is the most important field in the record. Without it you cannot tell whether a price gap reflects a genuine market move or simply two different boutiques in two different countries.',
      },
      {
        question: 'Can I track a specific designer across the marketplace?',
        answer:
          'Yes. Designer is a first-class field, so the feed can be filtered to one brand and used to monitor how that brand is priced and discounted across every boutique on the platform. That is the most common use for this source among brand-side customers.',
      },
    ],
  },
  {
    slug: 'net-a-porter',
    accent: '#EFE6D8',
    scraperId: 'net_a_porter',
    name: 'NET-A-PORTER',
    siteUrl: 'https://www.net-a-porter.com',
    domain: 'net-a-porter.com',
    segment: 'luxury-marketplace',
    origin: 'United Kingdom — founded 2000 in London',
    categories: ['Luxury womenswear', 'Shoes', 'Bags', 'Jewellery', 'Beauty'],
    method:
      'the structured product data behind NET-A-PORTER product pages, including the editorial detail the retailer publishes per product',
    intro:
      'NET-A-PORTER invented luxury e-commerce as a category and remains its editorial standard, combining a tightly curated designer assortment with magazine-quality product content. Unlike a marketplace it owns its inventory, so its prices are buying decisions rather than aggregated seller listings.',
    whyItMatters:
      'Because NET-A-PORTER buys rather than aggregates, its assortment is a direct read on what a leading luxury buyer thinks will sell — which no marketplace feed can tell you. Its markdown timing is also the one the rest of luxury e-commerce watches and follows.',
    notableFields: [
      'Editorial product copy carried through as structured text',
      'Designer as a separate field from product name',
      'Owned-inventory pricing without seller dispersion',
      'Size availability and sell-through state',
    ],
    faqs: [
      {
        question: 'How does this differ from the Farfetch feed?',
        answer:
          'NET-A-PORTER owns its stock; Farfetch aggregates other people\'s. So NET-A-PORTER shows you one buyer\'s curated view with one price per product, while Farfetch shows you the whole market with price dispersion across sellers. Most customers take both, because they answer opposite questions.',
      },
      {
        question: 'Is THE OUTNET available too?',
        answer:
          'Yes, on its own collector and the same schema. Taking both is the standard configuration for tracking how luxury stock moves from full price into off-season clearance, since THE OUTNET is where much of NET-A-PORTER\'s unsold inventory eventually lands.',
      },
    ],
  },
  {
    slug: 'the-outnet',
    accent: '#F2836B',
    scraperId: 'the_outnet',
    name: 'THE OUTNET',
    siteUrl: 'https://www.theoutnet.com',
    domain: 'theoutnet.com',
    segment: 'luxury-marketplace',
    origin: 'United Kingdom — off-season luxury, launched 2009',
    categories: ['Off-season luxury', 'Womenswear', 'Shoes', 'Bags'],
    method:
      'product page collection with the discount structure preserved, so original and clearance price arrive as separate fields',
    intro:
      'THE OUTNET is the off-season outlet arm of the NET-A-PORTER group, selling previous-season designer stock at structural discounts. Every listing carries both an original price and a clearance price, which makes it one of the few catalogues where markdown depth is explicit rather than inferred.',
    whyItMatters:
      'Clearance is where luxury inventory risk becomes visible. Tracking THE OUTNET tells you which designers are over-producing, how deep the market will discount them, and how long stock sits before it clears — none of which is observable from full-price channels.',
    notableFields: [
      'Original price and clearance price as separate explicit fields',
      'Discount depth directly computable per listing',
      'Designer attribution across the clearance assortment',
      'Season attribution where published',
    ],
    faqs: [
      {
        question: 'Is discount depth directly available?',
        answer:
          'Yes. THE OUTNET publishes both the original and the clearance price, and we carry both through rather than collapsing them, so discount depth is a computed field rather than an estimate. That is the main reason customers choose this source over a general luxury feed.',
      },
      {
        question: 'What does clearance data tell me that full-price data cannot?',
        answer:
          'Where the inventory risk actually sits. A full-price catalogue shows intent; a clearance catalogue shows what did not sell, how deeply it had to be cut, and how long it took. For anyone modelling designer over-production, that is the signal.',
      },
    ],
  },
  {
    slug: 'mytheresa',
    accent: '#D8CFC4',
    scraperId: 'my_theresa',
    name: 'Mytheresa',
    siteUrl: 'https://www.mytheresa.com',
    domain: 'mytheresa.com',
    segment: 'luxury-marketplace',
    origin: 'Germany — Munich, online since 2006',
    categories: ['Luxury womenswear', 'Menswear', 'Shoes', 'Bags', 'Kids'],
    method:
      "Mytheresa's internal GraphQL API, which returns exactly the fields requested with stable typing",
    intro:
      'Mytheresa grew out of a single Munich boutique into one of the most disciplined luxury e-tailers in the market, known for a tightly edited assortment and an unusually affluent customer base. It buys its own inventory and carries a narrower, deeper selection than the large marketplaces.',
    whyItMatters:
      'Mytheresa is the European counterweight to NET-A-PORTER, and comparing the two shows how differently two expert buyers read the same designer season. Its narrow assortment also means inclusion is itself a signal: a product carried by Mytheresa has passed a stricter filter than one listed on a marketplace.',
    notableFields: [
      'GraphQL-sourced fields with stable typing across runs',
      'Designer attribution separate from product name',
      'Owned-inventory pricing and markdown timing',
      'Size availability per product',
    ],
    faqs: [
      {
        question: 'Why does the GraphQL source matter?',
        answer:
          'GraphQL returns typed, explicitly-requested fields, so the feed is more stable across runs than markup extraction and does not silently break when the storefront is redesigned. In practice that means fewer schema surprises and less remediation on your side.',
      },
      {
        question: 'Is menswear covered?',
        answer:
          'Yes. Mytheresa runs a substantial menswear business alongside womenswear, and both are collected on the same schema with a department field. Kidswear is available on request.',
      },
    ],
  },
  {
    slug: 'ssense',
    accent: '#E9ECEF',
    scraperId: 'ssense',
    name: 'SSENSE',
    siteUrl: 'https://www.ssense.com/en-us',
    domain: 'ssense.com',
    segment: 'luxury-marketplace',
    origin: 'Canada — founded 2003 in Montreal',
    categories: ['Luxury womenswear', 'Menswear', 'Streetwear', 'Shoes'],
    method:
      "SSENSE's JSON product endpoints, read per category so the assortment is enumerated completely",
    intro:
      'SSENSE is the Montreal retailer that merged luxury and streetwear into one credible assortment before most of the industry accepted the two belonged together. Its buy is younger and more design-forward than traditional luxury e-tail, and its editorial voice drives real demand for the brands it backs.',
    whyItMatters:
      'SSENSE is where emerging designers get validated, so its assortment functions as a leading indicator for which labels are about to matter. For anyone tracking the luxury-streetwear intersection it is the single most informative source in the market.',
    notableFields: [
      'Designer attribution across an unusually wide brand roster',
      'Coverage of emerging labels absent from traditional luxury e-tail',
      'Both womenswear and menswear on one schema',
      'Markdown timing across seasonal sale windows',
    ],
    faqs: [
      {
        question: 'Why is SSENSE useful for spotting emerging designers?',
        answer:
          'Its buy skews younger and more experimental than traditional luxury e-tail, so labels appear on SSENSE well before they reach the established retailers. Tracking new designer entries over time gives you a watchlist that consistently leads the rest of the market.',
      },
      {
        question: 'Are womenswear and menswear both included?',
        answer:
          'Yes, and menswear is genuinely significant here rather than an afterthought — it is a large part of why SSENSE matters. Both departments are collected by default on the same schema.',
      },
    ],
  },
  {
    slug: 'cettire',
    accent: '#AFC3DB',
    scraperId: 'cettire',
    name: 'Cettire',
    siteUrl: 'https://www.cettire.com',
    domain: 'cettire.com',
    segment: 'luxury-marketplace',
    origin: 'Australia — founded 2017',
    categories: ['Discounted luxury', 'Womenswear', 'Menswear', 'Bags', 'Shoes'],
    method:
      'Algolia search combined with the storefront GraphQL API, which together enumerate a very large catalogue reliably',
    intro:
      'Cettire is an Australian luxury marketplace that grew fast by listing designer product at prices consistently below the brands\' own channels, sourced through a supply network that the industry watches closely. Its catalogue is enormous relative to its age.',
    whyItMatters:
      'Cettire is the clearest available window into luxury grey-market pricing — where designer product is sold outside brand-controlled channels and at what discount. Brands use the feed for channel monitoring; retailers use it to understand the price pressure they are actually competing against.',
    notableFields: [
      'Designer attribution across a very large catalogue',
      'Discount relative to typical brand-channel pricing',
      'Algolia-backed enumeration for complete category coverage',
      'Size and availability per listing',
    ],
    faqs: [
      {
        question: 'Why do brands monitor Cettire specifically?',
        answer:
          'Because it is where their product turns up priced below their own channels. Channel monitoring is one of the most common reasons brand-side customers take this feed: they need to see which of their SKUs are listed, at what discount, and how that moves over time.',
      },
      {
        question: 'How is such a large catalogue enumerated reliably?',
        answer:
          'The collector uses the storefront\'s Algolia search layer for enumeration rather than walking paginated HTML, then enriches through the GraphQL API. That combination is what makes complete coverage of a catalogue this size practical rather than best-effort.',
      },
    ],
  },
  {
    slug: 'luisaviaroma',
    accent: '#D9C7A8',
    scraperId: 'luisaviaroma',
    name: 'LuisaViaRoma',
    siteUrl: 'https://www.luisaviaroma.com',
    domain: 'luisaviaroma.com',
    segment: 'luxury-marketplace',
    origin: 'Italy — Florence, retailing since 1930',
    categories: ['Luxury womenswear', 'Menswear', 'Shoes', 'Bags', 'Kids'],
    method:
      "LuisaViaRoma's internal catalogue application API, read per category with designer attribution preserved",
    intro:
      'LuisaViaRoma is a Florentine boutique that has been trading since 1930 and moved online early enough to become one of the defining European luxury e-tailers. Its buy retains a distinctly Italian point of view, with strong representation of Italian houses that global marketplaces under-weight.',
    whyItMatters:
      'LuisaViaRoma is the Italian-perspective counterpart to the London and Munich e-tailers, and its assortment surfaces Italian designers that a UK- or US-centric feed will miss entirely. For European market analysis that difference is the reason to take it.',
    notableFields: [
      'Strong Italian designer representation not found in every feed',
      'Designer attribution separate from product name',
      'Multi-department coverage including kidswear',
      'Seasonal markdown timing on the Italian calendar',
    ],
    faqs: [
      {
        question: 'What does LuisaViaRoma add over the larger e-tailers?',
        answer:
          'An Italian buying perspective. Its assortment carries Italian houses and smaller Florentine and Milanese labels that London- and US-centric retailers under-weight or skip. If your analysis is European, leaving it out biases the sample.',
      },
      {
        question: 'Does the feed cover kidswear?',
        answer:
          'Yes, where the storefront carries it. LuisaViaRoma runs a genuine luxury kidswear business, which is unusual and makes it one of the few practical sources for that segment.',
      },
    ],
  },
  {
    slug: 'italist',
    accent: '#8FC7A5',
    scraperId: 'italist',
    name: 'Italist',
    siteUrl: 'https://www.italist.com/us',
    domain: 'italist.com',
    segment: 'luxury-marketplace',
    origin: 'Italy — direct from Italian boutiques',
    categories: ['Luxury womenswear', 'Menswear', 'Shoes', 'Bags'],
    method:
      'the structured catalogue behind Italist listings, with boutique-sourced pricing and description detail preserved',
    intro:
      'Italist connects buyers directly to Italian boutiques, selling at Italian retail prices rather than the marked-up levels those products reach in export markets. The whole proposition is geographic price arbitrage made visible.',
    whyItMatters:
      'Italist is the cleanest read available on the gap between Italian domestic luxury pricing and what the same product costs elsewhere. For anyone studying regional price harmonisation in luxury, it is the reference source.',
    notableFields: [
      'Italian domestic pricing on export-market listings',
      'Boutique sourcing reflected in the listing detail',
      'Designer attribution separate from product name',
      'Size availability per listing',
    ],
    faqs: [
      {
        question: 'What makes Italist pricing distinctive?',
        answer:
          'It reflects Italian domestic retail rather than export-market pricing. That gap — often substantial on the same SKU — is exactly what customers use this feed to measure, and it is not observable from any brand-controlled channel.',
      },
      {
        question: 'Can Italist be compared against Farfetch on the same product?',
        answer:
          'Yes, and it is a common configuration. Both deliver on the same normalised schema with designer as a field, so the same designer product can be matched across the two and the price gap read directly.',
      },
    ],
  },
  {
    slug: 'moda-operandi',
    accent: '#E3AFB8',
    scraperId: 'modaoperandi',
    name: 'Moda Operandi',
    siteUrl: 'https://www.modaoperandi.com',
    domain: 'modaoperandi.com',
    segment: 'luxury-marketplace',
    origin: 'United States — founded 2010',
    categories: ['Runway pre-order', 'Luxury womenswear', 'Bags', 'Jewellery'],
    method:
      "Moda Operandi's internal GraphQL API, which exposes both the in-season assortment and the trunkshow pre-order catalogue",
    intro:
      'Moda Operandi invented the trunkshow model for online luxury: customers pre-order directly from the runway, months before the collection reaches conventional retail. That makes its catalogue structurally different from every other luxury source — much of it is product that does not exist yet.',
    whyItMatters:
      'The trunkshow catalogue is the earliest commercially available view of a designer season, typically months ahead of what any in-season retailer lists. For trend forecasting and competitive assortment planning that lead time is the entire value of the source.',
    notableFields: [
      'Trunkshow pre-order listings ahead of general retail availability',
      'Runway collection and season attribution',
      'Designer attribution separate from product name',
      'Both pre-order and in-season assortment on one schema',
    ],
    faqs: [
      {
        question: 'How far ahead does the trunkshow data run?',
        answer:
          'Trunkshow listings appear shortly after the runway show, typically months before the collection reaches conventional retail. No in-season retailer feed can give you that view, which is why forecasting teams take this source specifically.',
      },
      {
        question: 'Are pre-order and in-season items distinguishable?',
        answer:
          'Yes. They arrive tagged distinctly, because mixing them would corrupt any availability analysis — a pre-order listing is a statement of intent, not stock on hand.',
      },
    ],
  },
  {
    slug: 'revolve',
    accent: '#F2A07E',
    scraperId: 'revolve',
    name: 'Revolve',
    siteUrl: 'https://www.revolve.com',
    domain: 'revolve.com',
    segment: 'luxury-marketplace',
    origin: 'United States — founded 2003 in Los Angeles',
    categories: ['Contemporary womenswear', 'Dresses', 'Shoes', 'Beauty'],
    method:
      'listing and product page collection across the full brand roster, with brand attribution preserved per listing',
    intro:
      'Revolve is the Los Angeles retailer that built modern influencer commerce, carrying hundreds of contemporary brands with an occasionwear and event-dressing bias. Its assortment moves fast and is unusually responsive to social demand signals.',
    whyItMatters:
      'Revolve is the largest single view of the US contemporary market and the best available proxy for influencer-driven demand. Brands use it to see how they are merchandised and discounted next to their direct competitors on the same shelf.',
    notableFields: [
      'Brand attribution across a very large multi-brand roster',
      'Occasionwear and event category classification',
      'List and promotional price captured separately',
      'Size availability per listing',
    ],
    faqs: [
      {
        question: 'How many brands does the Revolve feed cover?',
        answer:
          'Revolve carries hundreds of contemporary labels and the collector enumerates the roster rather than a selected subset. Brand is a first-class field, so you can filter to your own label and its direct competitors and read the shelf as your customer sees it.',
      },
      {
        question: 'Is FWRD included?',
        answer:
          'FWRD is Revolve Group\'s luxury arm and has its own dedicated collector on the same schema. Taking both shows how the group separates contemporary from luxury in assortment and price, which is the usual reason customers want the pair.',
      },
    ],
  },
  {
    slug: 'fwrd',
    accent: '#B9C2CC',
    scraperId: 'fwrd',
    name: 'FWRD',
    siteUrl: 'https://www.fwrd.com',
    domain: 'fwrd.com',
    segment: 'luxury-marketplace',
    origin: 'United States — luxury arm of Revolve Group',
    categories: ['Luxury womenswear', 'Menswear', 'Shoes', 'Bags'],
    method:
      'server-rendered listing fragments, collected per category so the full designer assortment is enumerated',
    intro:
      'FWRD is Revolve Group\'s luxury division, carrying established designer houses with the same social-first merchandising instincts that built its sister site. It sits deliberately above Revolve on price while sharing an audience and an operating model.',
    whyItMatters:
      'FWRD is the clearest example of a contemporary retailer moving upmarket without changing its playbook, and running it alongside Revolve shows exactly where a single group draws the line between the two tiers. That separation is hard to observe anywhere else.',
    notableFields: [
      'Designer attribution across the luxury roster',
      'Price positioning directly comparable to the Revolve feed',
      'Both womenswear and menswear on one schema',
      'Markdown timing across sale windows',
    ],
    faqs: [
      {
        question: 'Should I take FWRD and Revolve together?',
        answer:
          'Usually yes. Individually each is a retailer feed; together they show how one operator tiers contemporary against luxury for the same customer. Both deliver on the same schema, so combining them is a configuration choice rather than an integration task.',
      },
      {
        question: 'Is menswear covered?',
        answer:
          'Yes. FWRD runs a designer menswear assortment alongside womenswear, and both are collected on the same schema with a department field.',
      },
    ],
  },
  {
    slug: 'shopbop',
    accent: '#86C5D8',
    scraperId: 'shopbop',
    name: 'Shopbop',
    siteUrl: 'https://www.shopbop.com',
    domain: 'shopbop.com',
    segment: 'luxury-marketplace',
    origin: 'United States — founded 1999, Amazon-owned',
    categories: ['Contemporary womenswear', 'Denim', 'Shoes', 'Bags'],
    method:
      "Shopbop's public products catalogue API, which returns the multi-brand assortment as structured records",
    intro:
      'Shopbop is a US contemporary retailer, owned by Amazon, carrying a broad multi-brand assortment with particular strength in denim and American contemporary labels. Its catalogue API returns clean structured records, which makes it one of the more dependable sources in this set.',
    whyItMatters:
      'Shopbop is the US contemporary benchmark with Amazon\'s operational discipline behind it, and its promotional cadence is distinct from the influencer-led rhythm of the West Coast retailers. Running it against Revolve separates genuine market moves from one retailer\'s calendar.',
    notableFields: [
      'Brand attribution across the contemporary roster',
      'Structured catalogue API records with stable identifiers',
      'Denim fit and wash detail where published',
      'List and promotional price captured separately',
    ],
    faqs: [
      {
        question: 'How reliable is the Shopbop source?',
        answer:
          'More reliable than most. It exposes a structured products catalogue API, so records come back with stable identifiers and typed fields instead of being reconstructed from markup. Storefront redesigns do not disturb it.',
      },
      {
        question: 'Does it overlap with Revolve?',
        answer:
          'There is meaningful brand overlap, and that is useful rather than redundant — the same product carried by both is a direct read on retailer-level price and markdown differences. Customers benchmarking US contemporary typically take both for exactly that reason.',
      },
    ],
  },
  {
    slug: 'louis-vuitton',
    accent: '#C9A227',
    scraperId: 'louis_vuitton',
    name: 'Louis Vuitton',
    siteUrl: 'https://us.louisvuitton.com/eng-us',
    domain: 'louisvuitton.com',
    segment: 'luxury-house',
    origin: 'France — founded 1854 in Paris',
    categories: ['Bags', 'Leather goods', 'Womenswear', 'Menswear', 'Shoes'],
    method:
      "the structured product data behind Louis Vuitton's own storefront, read per category with material and line attribution preserved",
    intro:
      'Louis Vuitton is the largest luxury brand in the world and the one that sets the reference price for the whole leather goods category. It sells almost exclusively through its own channels and does not discount, which makes its price moves deliberate signals rather than market reactions.',
    whyItMatters:
      'Because Louis Vuitton never discounts, every price change is a decision — and the industry treats those increases as the benchmark for what the market will bear. Tracking its price history on core lines is the standard way to measure luxury inflation, and there is no wholesale channel to muddy the reading.',
    notableFields: [
      'Product line and collection attribution (Monogram, Damier, and others)',
      'Material and canvas type from product detail',
      'Full-price-only series with no discount noise',
      'Regional pricing when multiple locales are collected',
    ],
    faqs: [
      {
        question: 'Why track a brand that never discounts?',
        answer:
          'Precisely because it never discounts. The price series is pure signal — every movement is a deliberate increase rather than a promotional artefact, which makes it the cleanest luxury inflation index available and the number the rest of the category anchors on.',
      },
      {
        question: 'Can you capture regional price differences?',
        answer:
          'Yes. Louis Vuitton prices differently by market, and regional gaps on identical products are large enough to drive real cross-border demand. Each locale is collected as its own feed, joinable on product reference.',
      },
    ],
  },
  {
    slug: 'ralph-lauren',
    accent: '#87A9D6',
    scraperId: 'ralphlauren',
    name: 'Ralph Lauren',
    siteUrl: 'https://www.ralphlauren.com',
    domain: 'ralphlauren.com',
    segment: 'luxury-house',
    origin: 'United States — founded 1967 in New York',
    categories: ['Womenswear', 'Menswear', 'Home', 'Shoes', 'Accessories'],
    method:
      'the structured product data behind the Ralph Lauren storefront, with sub-label attribution preserved per product',
    intro:
      'Ralph Lauren is an American lifestyle house operating a deliberate tier structure, from Purple Label and Collection at the top through Polo and down to the more accessible lines. The same storefront carries products separated by an order of magnitude in price, which is unusual and analytically useful.',
    whyItMatters:
      'Ralph Lauren is the textbook case of brand architecture used as a pricing instrument, and it is all visible in one catalogue. Tracking sub-label separation shows how a house stretches from accessible to luxury without collapsing the tiers into each other.',
    notableFields: [
      'Sub-label attribution across Purple Label, Collection, Polo, and others',
      'Cross-category coverage including home',
      'List and promotional price captured separately per tier',
      'Colourway variants with dedicated imagery',
    ],
    faqs: [
      {
        question: 'Are the Ralph Lauren sub-labels distinguishable in the data?',
        answer:
          'Yes, and it is essential that they are. Purple Label and Polo are different businesses at different price points sharing one storefront, so averaging them into a single brand price produces a number that describes nothing. Sub-label is carried as its own field.',
      },
      {
        question: 'Is the home range included?',
        answer:
          'Yes, where the storefront carries it. Ralph Lauren Home runs on the same catalogue structure as apparel and is collected under the same schema with a category field.',
      },
    ],
  },
  {
    slug: 'casadei',
    accent: '#E24B4B',
    scraperId: 'casadei',
    name: 'Casadei',
    siteUrl: 'https://www.casadei.com/en-us/',
    domain: 'casadei.com',
    segment: 'luxury-house',
    origin: 'Italy — founded 1958 in San Mauro Pascoli',
    categories: ['Luxury footwear', 'Heels', 'Boots', 'Bags'],
    method:
      "Salesforce Commerce Cloud's shopper-search API, which returns the catalogue with stable identifiers and typed attributes",
    intro:
      'Casadei is an Italian luxury footwear house from San Mauro Pascoli, the Romagna district that produces a large share of the world\'s luxury shoes. It is best known for sculptural heel construction, and heel height and shape function as genuine product specifications rather than descriptive detail.',
    whyItMatters:
      'Footwear is under-served by generalist apparel data because the attributes that drive price — heel height, construction, leather grade — are usually lost in description text. Casadei is a specialist benchmark where those attributes are explicit, and it anchors the Italian luxury footwear tier.',
    notableFields: [
      'Heel height and construction attributes from product detail',
      'Leather and material grade where published',
      'SFCC identifiers stable across collection runs',
      'Size run coverage per style',
    ],
    faqs: [
      {
        question: 'Are footwear-specific attributes captured?',
        answer:
          'Yes, where Casadei publishes them — heel height, construction, and material land in their own fields rather than staying inside a description blob. In luxury footwear those are the price drivers, so losing them makes the price data far less useful.',
      },
      {
        question: 'Why does the SFCC source matter?',
        answer:
          'Salesforce Commerce Cloud exposes documented shopper APIs, so the catalogue arrives with stable product identifiers and typed attributes. Storefront redesigns do not break the feed the way they would with markup-based extraction.',
      },
    ],
  },
  {
    slug: 'senso',
    accent: '#F08CA0',
    scraperId: 'senso',
    name: 'Senso',
    siteUrl: 'https://senso.com.au',
    domain: 'senso.com.au',
    segment: 'independent',
    origin: 'Australia — Sydney',
    categories: ['Footwear', 'Boots', 'Sandals', 'Heels'],
    method:
      'WooCommerce category and product pages, parsed for the structured attributes the platform exposes',
    intro:
      'Senso is a Sydney footwear label with a distinctly Australian design language — sculptural, colour-forward, and built around a Southern Hemisphere seasonal calendar that runs opposite to Europe and North America.',
    whyItMatters:
      'Southern Hemisphere brands are systematically missing from Northern-centric datasets, which skews any global seasonality analysis. Senso supplies the counter-seasonal footwear signal, and its inverted markdown calendar is exactly what makes it worth including.',
    notableFields: [
      'Counter-seasonal availability relative to Northern Hemisphere sources',
      'Footwear category and construction detail',
      'Colourway variants with per-colour imagery',
      'AUD pricing with sale price captured separately',
    ],
    faqs: [
      {
        question: 'Why does Southern Hemisphere seasonality matter?',
        answer:
          'Because a dataset built only from Northern brands treats one hemisphere\'s calendar as universal. Australian brands run the opposite season, so including them lets you separate genuine trend movement from seasonal artefact instead of confusing the two.',
      },
      {
        question: 'Is pricing returned in AUD?',
        answer:
          'The storefront prices in AUD and we carry the native currency through rather than converting silently. Currency conversion happens downstream at a rate and date you control, so you can always reconstruct the original figure.',
      },
    ],
  },
  {
    slug: 'k-jacques',
    accent: '#C89A6B',
    scraperId: 'kjacques',
    name: 'K.Jacques',
    siteUrl: 'https://www.kjacques.fr/en',
    domain: 'kjacques.fr',
    segment: 'independent',
    origin: 'France — Saint-Tropez, since 1933',
    categories: ['Sandals', 'Leather footwear'],
    method:
      'collection pages combined with variant data, so the leather and size options behind each style are captured',
    intro:
      'K.Jacques has made leather sandals in Saint-Tropez since 1933, and its core styles have barely changed in decades. The catalogue is built on a small set of enduring silhouettes offered across many leathers and colours, which produces a wide variant grid over a narrow style count.',
    whyItMatters:
      'K.Jacques is the reference for artisanal French leather sandals and one of the few catalogues where the same style can be priced continuously across half a century. Its variant-heavy structure also makes it a useful test of whether a data model handles variant depth properly.',
    notableFields: [
      'Deep variant grid across leathers and colours per style',
      'Leather type as an explicit attribute',
      'Stable style identifiers persisting across many years',
      'Size run coverage per variant',
    ],
    faqs: [
      {
        question: 'How is the variant grid handled?',
        answer:
          'Variants are captured individually rather than collapsed into the parent style. K.Jacques offers a small number of silhouettes in a very large number of leather and colour combinations, so a style-level count would understate the assortment by an order of magnitude.',
      },
      {
        question: 'Are the classic styles trackable over time?',
        answer:
          'Yes, and it is one of the more interesting properties of this source. The core silhouettes persist under stable identifiers year after year, so a scheduled collection produces a genuine long-run price series on an unchanged product.',
      },
    ],
  },
  {
    slug: 'anniel',
    accent: '#D9AE8E',
    scraperId: 'anniel',
    name: 'Anniel',
    siteUrl: 'https://www.annielshop.com',
    domain: 'annielshop.com',
    segment: 'independent',
    origin: 'Italy — hand-finished footwear',
    categories: ['Ballet flats', 'Loafers', 'Footwear'],
    method:
      'category listing pages, parsed for product, price, and variant detail',
    intro:
      'Anniel is an Italian footwear label known for soft, hand-finished ballet flats and loafers made in the Italian shoemaking tradition. The catalogue is small and construction-led, with material and finish carrying the price rather than seasonal design.',
    whyItMatters:
      'Ballet flats returned to the centre of the footwear market, and Anniel is one of the authentic Italian makers the revival is measured against. For anyone pricing in that category it is the craft benchmark rather than the volume one.',
    notableFields: [
      'Leather and finish detail from product listings',
      'Colourway variants with per-colour imagery',
      'Complete catalogue enumeration at this size',
      'Size availability per style',
    ],
    faqs: [
      {
        question: 'Why include a small Italian maker in a competitive feed?',
        answer:
          'Because volume brands set the floor and craft makers set the ceiling, and a category benchmark needs both. Anniel establishes what authentic Italian construction costs in a category that mass retailers have flooded — without it, the top of the ladder is missing.',
      },
      {
        question: 'Is the full catalogue captured?',
        answer:
          'Yes. The assortment is small enough to enumerate completely on every run, so the feed is the whole catalogue rather than a sample.',
      },
    ],
  },
  {
    slug: 'vibi-venezia',
    accent: '#A08CD6',
    scraperId: 'vibivenezia',
    name: 'Vibi Venezia',
    siteUrl: 'https://www.vibivenezia.com',
    domain: 'vibivenezia.com',
    segment: 'independent',
    origin: 'Italy — Venice',
    categories: ['Velvet slippers', 'Footwear', 'Furlane'],
    method:
      'the storefront catalogue, collected through its protected form flow so the full assortment is reachable',
    intro:
      'Vibi Venezia makes furlane — the Venetian velvet slipper traditionally built on a recycled bicycle-tyre sole — in a range of colours and fabrics. It is a single-product house executing one regional craft with an unusually wide colour and material range.',
    whyItMatters:
      'Single-product artisan houses are almost entirely absent from commercial retail datasets, and Vibi Venezia is a useful example of the category: one silhouette, deep variant range, and pricing driven by fabric rather than design. It is also a genuinely regional craft product, which is rare in structured data.',
    notableFields: [
      'Fabric and material as the primary price-driving attribute',
      'Deep colour variant range over a single silhouette',
      'Complete catalogue enumeration',
      'Size availability per variant',
    ],
    faqs: [
      {
        question: 'How is a protected storefront collected?',
        answer:
          'Vibi Venezia serves its catalogue behind a token-protected form flow rather than plain listing pages. The collector completes that flow the way a browser would, so the full assortment is reachable — this is the kind of source-specific handling that makes a dedicated collector worth building.',
      },
      {
        question: 'Why track a single-product brand?',
        answer:
          'Because it isolates one variable. With one silhouette and many fabrics, price differences are attributable to material alone, which is a much cleaner read than you get from a catalogue where silhouette, material, and season all move at once.',
      },
    ],
  },
  {
    slug: 'muun',
    accent: '#D9C08C',
    scraperId: 'muun',
    name: 'Muun',
    siteUrl: 'https://www.muun-collection.com',
    domain: 'muun-collection.com',
    segment: 'independent',
    origin: 'France — handcrafted bags',
    categories: ['Bags', 'Handbags', 'Accessories'],
    method:
      'WooCommerce bag category pages, parsed for product, variant, and material detail',
    intro:
      'Muun is a French label making handcrafted bags in natural materials — raffia, straw, and leather — with a strong seasonal skew toward summer. The catalogue is small, material-led, and priced well below the luxury houses while sitting clearly above high-street accessories.',
    whyItMatters:
      'Natural-material bags are a fast-growing accessories segment that generalist feeds handle poorly, because material is the price driver and it usually gets lost in description text. Muun is a clean benchmark for the artisanal middle of that market.',
    notableFields: [
      'Natural material attribution as an explicit field',
      'Strong seasonal availability pattern',
      'Colourway variants with imagery',
      'EUR pricing with sale price captured separately',
    ],
    faqs: [
      {
        question: 'Is material captured as a structured field?',
        answer:
          'Yes, where the storefront publishes it. In this category material is the price driver — raffia, straw, and leather occupy different price bands — so leaving it inside a description string would make the price data much harder to use.',
      },
      {
        question: 'How seasonal is this catalogue?',
        answer:
          'Very. The assortment expands sharply for spring and summer and contracts afterwards, which makes it a good stress test for seasonality models and a poor source to read from a single snapshot.',
      },
    ],
  },
  {
    slug: 'meher-kakalia',
    accent: '#E08A4F',
    scraperId: 'meher_kakalia',
    name: 'Meher Kakalia',
    siteUrl: 'https://www.meherkakalia.com',
    domain: 'meherkakalia.com',
    segment: 'independent',
    origin: 'Hand-embroidered artisan footwear',
    categories: ['Footwear', 'Sandals', 'Boots'],
    method:
      'category and product pages, parsed for the embroidery and construction detail that distinguishes each style',
    intro:
      'Meher Kakalia makes hand-embroidered footwear, with each style carrying craft detail that is genuinely specific to the piece rather than to a production run. Assortment is small and the construction detail, not the silhouette, is what sets the price.',
    whyItMatters:
      'Hand-worked product is the hardest kind to represent in structured data, because the value sits in detail that resists categorisation. Meher Kakalia is a useful benchmark for the artisan tier of footwear and a good test of how far a data model can go before craft detail flattens out.',
    notableFields: [
      'Embroidery and hand-work detail preserved from product copy',
      'Construction and material attributes',
      'Complete catalogue enumeration at this size',
      'Size availability per style',
    ],
    faqs: [
      {
        question: 'How is craft detail represented in structured data?',
        answer:
          'Descriptive craft detail is preserved as structured text alongside the categorical fields rather than being discarded to fit a schema. Forcing hand-embroidery into an enum would lose the only attribute that actually distinguishes the products.',
      },
      {
        question: 'Why include artisan brands at all?',
        answer:
          'They mark the top of the price ladder in a category. A footwear benchmark built only from volume brands has no ceiling, and artisan makers are what establishes what the category can support at its upper end.',
      },
    ],
  },
  {
    slug: 'faliero-sarti',
    accent: '#C6ABAF',
    scraperId: 'falierosarti',
    name: 'Faliero Sarti',
    siteUrl: 'https://www.falierosarti.com/en/',
    domain: 'falierosarti.com',
    segment: 'independent',
    origin: 'Italy — Tuscan textile house since 1949',
    categories: ['Scarves', 'Accessories', 'Textiles'],
    method:
      'category pages parsed for product, fibre composition, and colourway detail',
    intro:
      'Faliero Sarti is a Tuscan textile house that has woven fabrics since 1949 and sells finished scarves under its own name while also supplying fabric to luxury houses. Its catalogue is fibre-led: cashmere, silk, modal, and blends, with composition doing almost all of the pricing work.',
    whyItMatters:
      'Scarves and soft accessories are a category where fibre composition determines price almost entirely, and Faliero Sarti is one of the few sources where that composition is published consistently. For accessories pricing it is a far more useful benchmark than a generalist retailer.',
    notableFields: [
      'Fibre composition and blend ratios as explicit fields',
      'Weave and finish detail where published',
      'Colourway variants with per-colour imagery',
      'EUR pricing with sale price captured separately',
    ],
    faqs: [
      {
        question: 'Is fibre composition reliably available?',
        answer:
          'Yes, it is published consistently across this catalogue, which is exactly why the source is valuable. A cashmere-silk blend and a modal blend are different products at different costs, and without composition the price data cannot support any real comparison.',
      },
      {
        question: 'Does the feed cover the full accessories range?',
        answer:
          'The scarf and soft-accessories catalogue is collected in full. Faliero Sarti also supplies fabric to other houses, but that is a wholesale business and does not appear on the consumer storefront.',
      },
    ],
  },
  {
    slug: 'inoui-editions',
    accent: '#5FBFB0',
    scraperId: 'inoui_editions',
    name: 'Inouï Éditions',
    siteUrl: 'https://inoui-editions.com',
    domain: 'inoui-editions.com',
    segment: 'independent',
    origin: 'France — Paris',
    categories: ['Scarves', 'Accessories', 'Bags'],
    method:
      "Next.js data JSON endpoints, which return the catalogue as structured records including each product's print identity",
    intro:
      'Inouï Éditions is a Parisian accessories house built around original printed designs, applied across scarves, bags, and soft accessories. Print is the product: the same silhouette ships in many prints at the same price, and the print is what the customer chooses.',
    whyItMatters:
      'Print-led accessories are a category where conventional apparel attributes explain almost nothing about price or demand. Inouï Éditions is a clean example of the model, and its Next.js data layer means the print and collection structure arrives already organised rather than needing to be inferred.',
    notableFields: [
      'Print and design identity as a first-class attribute',
      'Fibre composition where published',
      'Collection membership alongside category',
      'Structured records from the Next.js data layer',
    ],
    faqs: [
      {
        question: 'How is print identity handled?',
        answer:
          'As its own attribute rather than folded into colour. When a dozen variants share a silhouette and a price and differ only by print, print is the entire distinguishing dimension — collapsing it into colour would make the variants indistinguishable.',
      },
      {
        question: 'Why does the Next.js data source matter?',
        answer:
          'The storefront serves its catalogue through Next.js data endpoints, so records come back structured and typed instead of reconstructed from markup. That makes the feed stable across visual redesigns.',
      },
    ],
  },
  {
    slug: 'drogheria-crivellini',
    accent: '#8FA8E0',
    scraperId: 'drogheriacrivellini',
    name: 'Drogheria Crivellini',
    siteUrl: 'https://drogheriacrivellini.com/en/',
    domain: 'drogheriacrivellini.com',
    segment: 'independent',
    origin: 'Italy — Venice',
    categories: ['Accessories', 'Hosiery', 'Small goods'],
    method:
      'collection pages parsed for product, material, and colourway detail',
    intro:
      'Drogheria Crivellini is a Venetian house selling a tightly curated range of accessories and small goods with a strong colour identity, sold direct from its own storefront. The assortment is deliberately narrow and colour-led.',
    whyItMatters:
      'Small Italian accessories houses are systematically absent from commercial datasets, yet they define the craft end of categories that mass retailers compete in. Drogheria Crivellini supplies that reference point for Venetian small goods, where colour range rather than silhouette count is the assortment story.',
    notableFields: [
      'Deep colour range as the primary assortment dimension',
      'Material composition where published',
      'Complete catalogue enumeration at this size',
      'EUR pricing with sale price captured separately',
    ],
    faqs: [
      {
        question: 'How large is this catalogue?',
        answer:
          'Small, and deliberately so — which means it is enumerated completely on every run rather than sampled. For a curated house the full assortment is the meaningful unit of analysis.',
      },
      {
        question: 'Why does colour matter more than category here?',
        answer:
          'Because the assortment is built on colour range across a narrow silhouette set. Counting styles understates it badly; the colour dimension is where the actual breadth lives, so that is what the feed preserves.',
      },
    ],
  },
  {
    slug: 'emanuela-caruso',
    accent: '#63C3D0',
    scraperId: 'emanuela_carouso',
    name: 'Emanuela Caruso',
    siteUrl: 'https://emanuelacaruso.com/us/',
    domain: 'emanuelacaruso.com',
    segment: 'independent',
    origin: 'Italy — Capri sandals',
    categories: ['Sandals', 'Footwear'],
    method:
      'category pages parsed for product, leather, and variant detail',
    intro:
      'Emanuela Caruso makes Capri sandals in the Southern Italian tradition, with leather and embellishment carrying the price across a small set of enduring silhouettes. The style vocabulary is regional and has changed very little over time.',
    whyItMatters:
      'The Capri sandal is a distinct regional craft category that generalist footwear data treats as ordinary flats, which erases the thing that makes it priceable. Emanuela Caruso is a specialist benchmark for it, with leather grade and embellishment doing the pricing work.',
    notableFields: [
      'Leather grade and embellishment as price-driving attributes',
      'Regional silhouette classification',
      'Colourway variants with imagery',
      'Complete catalogue enumeration',
    ],
    faqs: [
      {
        question: 'What distinguishes Capri sandals as a category?',
        answer:
          'A specific regional construction and silhouette vocabulary, priced on leather grade and hand embellishment. Generalist footwear taxonomies file them as flats, which loses exactly the attributes that determine what they cost.',
      },
      {
        question: 'Is the full catalogue captured?',
        answer:
          'Yes. The assortment is small enough to enumerate completely on every run rather than sampling it.',
      },
    ],
  },
  {
    slug: 'rivecour',
    accent: '#B9C4B0',
    scraperId: 'rivecour',
    name: 'Rivecour',
    siteUrl: 'https://www.rivecour.com/en',
    domain: 'rivecour.com',
    segment: 'independent',
    origin: 'European direct-to-consumer label',
    categories: ['Womenswear', 'Knitwear', 'Accessories'],
    method:
      'category pages parsed with cheerio for product, price, and material detail',
    intro:
      'Rivecour is a European direct-to-consumer label with a small, material-led assortment sold entirely through its own storefront. With no wholesale channel the listed price is the market price, and the catalogue is small enough to read in full.',
    whyItMatters:
      'Direct-to-consumer labels give you price signals uncontaminated by wholesale margin structures, which is unusual and useful. A basket of them alongside the majors is how you separate genuine category movement from retailer promotional behaviour.',
    notableFields: [
      'Direct-to-consumer pricing with no wholesale distortion',
      'Material composition where published',
      'Complete catalogue enumeration',
      'Colourway variants with imagery',
    ],
    faqs: [
      {
        question: 'Why is direct-to-consumer pricing analytically useful?',
        answer:
          'Because there is no wholesale layer between the brand and the price. A multi-brand retailer\'s price reflects its own margin and promotional calendar; a direct label\'s price is the brand\'s own position, which is a cleaner input to any pricing model.',
      },
      {
        question: 'How often is this source refreshed?',
        answer:
          'On whatever cadence you set. Small catalogues are inexpensive to collect completely, so a daily run is entirely practical if you want to catch every price and availability change.',
      },
    ],
  },
  {
    slug: 'hvoya',
    accent: '#6FBF8F',
    scraperId: 'hvoya',
    name: 'Hvoya',
    siteUrl: 'https://hvoya.ua/en',
    domain: 'hvoya.ua',
    segment: 'independent',
    origin: 'Ukraine — independent label',
    categories: ['Womenswear', 'Outerwear', 'Accessories'],
    method:
      'storefront category pages parsed for product, description, and material detail',
    intro:
      'Hvoya is a Ukrainian independent label selling direct from its own storefront, part of a design scene that has continued to build internationally recognised brands under exceptionally difficult conditions.',
    whyItMatters:
      'Eastern European independent labels are essentially invisible in commercial fashion datasets, which leaves a real gap for anyone doing genuinely global trend or price analysis. Hvoya extends coverage into a market that Western-centric sources simply do not reach.',
    notableFields: [
      'Coverage of a market absent from Western-centric datasets',
      'Native-currency pricing carried through unconverted',
      'Material and composition detail where published',
      'Complete catalogue enumeration',
    ],
    faqs: [
      {
        question: 'Why extend coverage into Eastern European labels?',
        answer:
          'Because a dataset built only from Western Europe and North America is not a global dataset, however large it is. Regional independent labels change the composition of trend and price analysis in ways that adding another major retailer does not.',
      },
      {
        question: 'How is currency handled?',
        answer:
          'Native currency is carried through as published and not silently converted. Conversion happens downstream at a rate and date you control, so the original figure is always recoverable.',
      },
    ],
  },
  {
    slug: 'home-of-hai',
    accent: '#D4A5C9',
    scraperId: 'homeofhai',
    name: 'Home of Hai',
    siteUrl: 'https://www.homeofhai.com',
    domain: 'homeofhai.com',
    segment: 'independent',
    origin: 'Independent direct-to-consumer label',
    categories: ['Womenswear', 'Accessories'],
    method:
      "the Shopify products.json API, which returns the full catalogue with variant and inventory structure intact",
    intro:
      'Home of Hai is an independent label running on Shopify and selling direct to consumer. Shopify-hosted storefronts expose a documented products endpoint, which makes their catalogues among the most completely and reliably collectable sources in retail.',
    whyItMatters:
      'The Shopify long tail is where most new fashion brands now start, and it is invisible to datasets built around major retailers. Because the platform exposes structured product data, these catalogues can be captured completely rather than approximately — a rare combination of hard-to-find and easy-to-trust.',
    notableFields: [
      'Complete catalogue via the documented Shopify products endpoint',
      'Variant-level structure with per-variant pricing',
      'Product type and tag taxonomy as the merchant defines it',
      'Publication and update timestamps from the platform',
    ],
    faqs: [
      {
        question: 'Why is Shopify-hosted data more reliable?',
        answer:
          'The platform exposes a documented products endpoint, so the catalogue is read as structured records rather than reconstructed from markup. Theme changes do not break the feed, and variant structure and timestamps come through natively.',
      },
      {
        question: 'Can you cover other Shopify storefronts?',
        answer:
          'Yes. We maintain a generic Shopify collector alongside the dedicated brand collectors and already run it across a large set of storefronts. Adding a new one is configuration rather than engineering, so onboarding a brand you care about is quick.',
      },
    ],
  },
  {
    slug: 'apointetc',
    accent: '#BFCBA8',
    scraperId: 'apointetc',
    name: 'A Pointe Etc',
    siteUrl: 'https://www.apointetc.com',
    domain: 'apointetc.com',
    segment: 'independent',
    origin: 'Independent direct-to-consumer label',
    categories: ['Womenswear', 'Accessories'],
    method:
      "the embedded warmup-data JSON blob the storefront's Wix platform serves alongside each page",
    intro:
      'A Pointe Etc is a small independent label selling direct from a Wix-hosted storefront. Wix embeds its catalogue as a JSON payload inside the page rather than exposing a public API, so the structured data is there — it just has to be read out of the document.',
    whyItMatters:
      'A large share of small independent brands sell on hosted platforms like Wix, and they are usually skipped by data providers because there is no obvious API. Reading the embedded payload makes those catalogues fully collectable, which is what extends coverage into the genuine long tail rather than stopping at brands with developer-friendly storefronts.',
    notableFields: [
      'Structured records read from the embedded platform payload',
      'Variant-level pricing and availability',
      'Complete catalogue enumeration at this size',
      'Product imagery per variant',
    ],
    faqs: [
      {
        question: 'How is a Wix storefront collected?',
        answer:
          'Wix embeds the catalogue as a JSON warmup-data blob inside the page. The collector reads that payload directly instead of parsing rendered markup, so the data arrives structured and survives theme changes.',
      },
      {
        question: 'Can you cover other hosted-platform storefronts?',
        answer:
          'Yes. Wix, Shopify, WooCommerce, and Salesforce Commerce Cloud each expose their catalogue in a recognisable way, and we already run collectors against all four. Onboarding a new storefront on a platform we support is quick.',
      },
    ],
  },
]

export const BRANDS_BY_SLUG: Record<string, Brand> = Object.fromEntries(
  BRANDS.map((brand) => [brand.slug, brand]),
)

/** Alphabetical, for the hub grid and the sitemap. */
export const BRAND_SLUGS: string[] = BRANDS.map((b) => b.slug).sort()

/**
 * Sibling brands in the same segment, used for the "related sources" block.
 * Internal links are the point of these pages, so every page gets some.
 */
export function relatedBrands(brand: Brand, limit = 6): Brand[] {
  const sameSegment = BRANDS.filter(
    (b) => b.slug !== brand.slug && b.segment === brand.segment,
  )
  const rest = BRANDS.filter(
    (b) => b.slug !== brand.slug && b.segment !== brand.segment,
  )

  // Rotate the same-segment list by the brand's own position so neighbouring
  // pages don't all link to the same first six entries.
  const offset = BRANDS.findIndex((b) => b.slug === brand.slug)
  const rotated = sameSegment.map(
    (_, i) => sameSegment[(i + offset) % sameSegment.length],
  )

  return [...rotated, ...rest].slice(0, limit)
}

export function brandsBySegment(): Array<{
  segment: BrandSegment
  label: string
  brands: Brand[]
}> {
  return BRAND_SEGMENT_ORDER.map((segment) => ({
    segment,
    label: BRAND_SEGMENT_LABELS[segment],
    brands: BRANDS.filter((b) => b.segment === segment).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  })).filter((group) => group.brands.length > 0)
}
