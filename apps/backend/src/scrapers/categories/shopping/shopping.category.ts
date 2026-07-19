import { Connection } from 'mongoose';
import { BaseCategory } from '../../base/base-category.abstract';
import { ScraperCategory } from '../../enums';
import { ProxyService } from '../../services/proxy.service';
import * as scrapers from './scrapers';

/**
 * Shopping category — fashion/e-commerce scrapers migrated from fynd-scraper.
 *
 * Registers one `ShopifyScraper` instance per storefront in `SHOPIFY_STORES`
 * (each gets its own scraper id + Mongo collection) plus every dedicated
 * bespoke-site scraper. Cookie/anti-bot-gated sites are registered too; they
 * run with impit-only and degrade to a FAILED execution when blocked.
 */
export class ShoppingCategory extends BaseCategory {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(ScraperCategory.SHOPPING, connection, proxyService);
  }

  protected registerScrapers(): void {
    // One generic Shopify scraper per storefront.
    for (const store of scrapers.SHOPIFY_STORES) {
      this.registerScraper(
        new scrapers.ShopifyScraper(store, this.connection, this.proxyService),
      );
    }

    // Dedicated bespoke-site scrapers.
    const dedicated = [
      new scrapers.AnnielScraper(this.connection, this.proxyService),
      new scrapers.ApointetcScraper(this.connection, this.proxyService),
      new scrapers.ArketScraper(this.connection, this.proxyService),
      new scrapers.AtorieScraper(this.connection, this.proxyService),
      new scrapers.CasadeiScraper(this.connection, this.proxyService),
      new scrapers.CettireScraper(this.connection, this.proxyService),
      new scrapers.CosScraper(this.connection, this.proxyService),
      new scrapers.DrogheriaCrivelliniScraper(
        this.connection,
        this.proxyService,
      ),
      new scrapers.DunstStudioScraper(this.connection, this.proxyService),
      new scrapers.EmanuelaCarousoScraper(this.connection, this.proxyService),
      new scrapers.FalconeriScraper(this.connection, this.proxyService),
      new scrapers.FalieroSartiScraper(this.connection, this.proxyService),
      new scrapers.FarfetchScraper(this.connection, this.proxyService),
      new scrapers.FilippaKScraper(this.connection, this.proxyService),
      new scrapers.FwrdScraper(this.connection, this.proxyService),
      new scrapers.HmScraper(this.connection, this.proxyService),
      new scrapers.HomeOfHaiScraper(this.connection, this.proxyService),
      new scrapers.HvoyaScraper(this.connection, this.proxyService),
      new scrapers.InouiEditionsScraper(this.connection, this.proxyService),
      new scrapers.IntimissimiScraper(this.connection, this.proxyService),
      new scrapers.ItalistScraper(this.connection, this.proxyService),
      new scrapers.JcrewScraper(this.connection, this.proxyService),
      new scrapers.KjacquesScraper(this.connection, this.proxyService),
      new scrapers.LaDoubleJScraper(this.connection, this.proxyService),
      new scrapers.LilysilkScraper(this.connection, this.proxyService),
      new scrapers.LouisVuittonScraper(this.connection, this.proxyService),
      new scrapers.LuisaviaromaScraper(this.connection, this.proxyService),
      new scrapers.MadewellScraper(this.connection, this.proxyService),
      new scrapers.MangoScraper(this.connection, this.proxyService),
      new scrapers.MassimoDuttiScraper(this.connection, this.proxyService),
      new scrapers.MeherKakaliaScraper(this.connection, this.proxyService),
      new scrapers.ModaOperandiScraper(this.connection, this.proxyService),
      new scrapers.MuunScraper(this.connection, this.proxyService),
      new scrapers.MyTheresaScraper(this.connection, this.proxyService),
      new scrapers.NetAPorterScraper(this.connection, this.proxyService),
      new scrapers.QuinceScraper(this.connection, this.proxyService),
      new scrapers.RalphLaurenScraper(this.connection, this.proxyService),
      new scrapers.RevolveScraper(this.connection, this.proxyService),
      new scrapers.RivecourScraper(this.connection, this.proxyService),
      new scrapers.SensoScraper(this.connection, this.proxyService),
      new scrapers.SezaneScraper(this.connection, this.proxyService),
      new scrapers.ShopbopScraper(this.connection, this.proxyService),
      new scrapers.SsenseScraper(this.connection, this.proxyService),
      new scrapers.StandStudioScraper(this.connection, this.proxyService),
      new scrapers.StefanelScraper(this.connection, this.proxyService),
      new scrapers.TheOutnetScraper(this.connection, this.proxyService),
      new scrapers.TheReformationScraper(this.connection, this.proxyService),
      new scrapers.VibiveneziaScraper(this.connection, this.proxyService),
      new scrapers.ZaraScraper(this.connection, this.proxyService),
    ];
    for (const scraper of dedicated) {
      this.registerScraper(scraper);
    }

    this.logger.log(`Registered ${this.scrapers.size} shopping scrapers`);
  }
}
