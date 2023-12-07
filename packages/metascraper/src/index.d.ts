export interface MetascraperOptions {
  /**
   * The URL associated with the HTML markup.
   * It is used for resolve relative links that can be present in the HTML markup.
   * it can be used as fallback field for different rules as well.
   *
   */
  url: string;
  /**
   * The HTML markup for extracting the content.
   */
  html?: string;
  /**
   * You can pass additional rules to add on execution time.
   * These rules will be merged with your loaded rules at the beginning.
   */
  rules?: Rules[];
  /**
   * Ensure the URL provided is validated as a WHATWG URL API compliant.
   */
  validateUrl?: boolean;
}

export interface Metadata {
  /**
   * Get audio property from HTML markup
   * The package [metascraper-audio](https://example.com/metascraper-audio) needs to be loaded.
   */
  audio?: string;
  /**
   * Get author property from HTML markup.
   * The package [metascraper-author](https://example.com/metascraper-author) needs to be loaded.
   */
  author?: string;
  /**
   * Get date property from HTML markup.
   * The package [metascraper-date](https://example.com/metascraper-date) needs to be loaded.
   */
  date?: string;
  /**
   * Get description property from HTML markup.
   * The package [metascraper-description](https://example.com/metascraper-description) needs to be loaded.
   */
  description?: string;
  /**
   * Get image property from HTML markup.
   * The package [metascraper-image](https://example.com/metascraper-image) needs to be loaded.
   */
  image?: string;
  /**
   * Get lang property from HTML markup
   * The package [metascraper-lang](https://example.com/metascraper-lang) needs to be loaded.
   */
  lang?: string;
  /**
   * Get logo property from HTML markup
   * The package [metascraper-logo](https://example.com/metascraper-logo) needs to be loaded.
   */
  logo?: string;
  /**
   * Get publisher property from HTML markup
   * The package [metascraper-publisher](https://example.com/metascraper-publisher) needs to be loaded.
   */
  publisher?: string;
  /**
   * Get title property from HTML markup
   * The package [metascraper-title](https://example.com/metascraper-title) needs to be loaded.
   */
  title?: string;
  /**
   * Get url property from HTML markup
   * The package [metascraper-url](https://example.com/metascraper-url) needs to be loaded.
   */
  url?: string;
  /**
   * Get video property from HTML markup
   * The package [metascraper-video](https://example.com/metascraper-video) needs to be loaded.
   */
  video?: string;
  [key: string]: string | undefined;
}

export type Rules = {
  [C in keyof Metadata]?: Array<RulesOptions> | RulesOptions;
} & {
  test?: (options: RulesTestOptions) => boolean;
};

export type RulesOptions = (options: RulesTestOptions) => string | null | undefined;

export interface RulesTestOptions {
  htmlDom: import('cheerio').CheerioAPI;
  url: string;
}

export type Metascraper = (options: MetascraperOptions) => Promise<Metadata>;

/**
 * It creates a [metascraper](https://metascraper.js.org/) instance, declaring the rules bundle to be used explicitly.
 * @param rules - The [rules bundles](https://metascraper.js.org/#/?id=rules-bundles) to be applied for metadata extraction.
 */
export default function createMetascraper(rules: Rules[]): Metascraper;
