import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

/**
 * ProxyService manages proxy configuration for scrapers
 * Loads proxies once at application startup from HC_PROXIES environment variable
 */
@Injectable()
export class ProxyService implements OnModuleInit {
  private readonly logger = new Logger(ProxyService.name);
  private proxies: string[] = [];

  /**
   * Lifecycle hook - loads proxies when module initializes
   */
  onModuleInit(): void {
    this.loadProxies();
  }

  /**
   * Load proxies from HC_PROXIES environment variable
   * Called once during module initialization
   */
  private loadProxies(): void {
    try {
      const proxiesEnv = process.env.HC_PROXIES;

      if (!proxiesEnv) {
        this.logger.warn(
          'HC_PROXIES not configured - scrapers will run without proxy',
        );
        return;
      }

      const parsedProxies: unknown = JSON.parse(proxiesEnv);

      if (!Array.isArray(parsedProxies)) {
        this.logger.error(
          'HC_PROXIES is not a valid JSON array - scrapers will run without proxy',
        );
        return;
      }

      if (parsedProxies.length === 0) {
        this.logger.warn(
          'HC_PROXIES array is empty - scrapers will run without proxy',
        );
        return;
      }

      // Validate all elements are strings
      if (!parsedProxies.every((item): item is string => typeof item === 'string')) {
        this.logger.error(
          'HC_PROXIES contains non-string values - scrapers will run without proxy',
        );
        return;
      }

      this.proxies = parsedProxies;
      this.logger.log(
        `✅ Successfully loaded ${this.proxies.length} proxies from configuration`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to parse HC_PROXIES: ${errorMessage} - scrapers will run without proxy`,
      );
    }
  }

  /**
   * Get a random proxy from the configured proxy pool
   * @returns Random proxy URL or undefined if no proxies available
   */
  getRandomProxy(): string | undefined {
    if (this.proxies.length === 0) {
      return undefined;
    }

    const randomIndex = Math.floor(Math.random() * this.proxies.length);
    return this.proxies[randomIndex];
  }

  /**
   * Check if proxies are available
   * @returns true if at least one proxy is configured
   */
  hasProxies(): boolean {
    return this.proxies.length > 0;
  }

  /**
   * Get the total number of configured proxies
   * @returns Number of available proxies
   */
  getProxyCount(): number {
    return this.proxies.length;
  }
}
