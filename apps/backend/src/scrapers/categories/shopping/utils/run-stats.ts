/**
 * Per-run counters surfaced into `ScraperExecutionEntity.metadata` so the
 * dashboard can show partial failures, not just a binary success/fail.
 */
export class RunStats {
  linksFound = 0;
  pagesFetched = 0;
  itemsScraped = 0;
  itemsFailed = 0;
  fetchErrors = 0;

  toJSON(): Record<string, number> {
    return {
      linksFound: this.linksFound,
      pagesFetched: this.pagesFetched,
      itemsScraped: this.itemsScraped,
      itemsFailed: this.itemsFailed,
      fetchErrors: this.fetchErrors,
    };
  }
}
