/**
 * It creates a [metascraper](https://metascraper.js.org/) instance, declaring the rules bundle to be used explicitly.
 * @param rules - The [rules bundles](https://metascraper.js.org/#/?id=rules-bundles) to be applied for metadata extraction.
 */
declare function createMetascraper(
  rules: createMetascraper.Rules[]
): createMetascraper.Metascraper;

export = createMetascraper;

declare namespace createMetascraper {
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
     * The Cheerio instance for extracting the content.
     */
    htmlDom?: import("cheerio").CheerioAPI;
    /**
     * You can pass additional rules to add on execution time.
     * These rules will be merged with your loaded rules at the beginning.
     */
    rules?: Rules[];
    /**
     * Ensure the URL provided is validated as a WHATWG URL API compliant.
     */
    validateUrl?: boolean;
    /**
     * A Set of property names to omit from the metadata extraction process.
     * These properties will be filtered out before processing the rules.
     */
    omitPropNames?: Set<string>;
    /**
     * A Set of property names to pick for the metadata extraction process.
     * When provided, only rules for these properties will be executed.
     * Takes precedence over omitPropNames when both are specified.
     */
    pickPropNames?: Set<string>;
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
     * Get title property from HTML markup.
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

  type NamedRules = {
    [C in keyof Metadata as string extends C ? never : C]?: Array<RulesOptions> | RulesOptions;
  };

  /**
   * Pre-run gate for a rule. A falsy result skips the rule entirely.
   */
  export type Test = (options: RulesTestOptions) => boolean;

  /**
   * Post-accept check for a rule candidate. Falsy or throw rejects the
   * candidate and findRule continues with the next rule.
   */
  export type Validate = (
    value: string,
    options: RulesTestOptions,
    debug: Debug
  ) => boolean | Promise<boolean>;

  /**
   * The `metascraper:find-rule` logger, so a validate can explain a rejection.
   * Only writes when `DEBUG=metascraper:find-rule` is enabled.
   */
  export interface Debug {
    (...args: Array<string | object>): void;
    readonly enabled: boolean | undefined;
    info(...args: Array<string | object>): void;
    warn(...args: Array<string | object>): void;
    error(...args: Array<string | object>): void;
  }

  export interface Rules extends NamedRules {
    /**
     * The test function to be executed for skipping rules that doesn't return `true`.
     */
    test?: Test;
    /**
     * Copied onto each rule in the bundle. Runs after a rule produces a value;
     * falsy or throw rejects that candidate and continues.
     */
    validate?: Validate;
    /**
     * The package name associated with the rule, used for debugging purposes.
     */
    pkgName?: string;
    /**
     * allow any other string key to be
     * a rule-function (for ad-hoc metadata),
     * or the special keys above.
     **/
    [key: string]:
      | Array<RulesOptions>
      | RulesOptions
      | Test
      | Validate
      | string
      | undefined;
  }

  export interface RulesOptions {
    (options: RulesTestOptions):
      | string
      | null
      | undefined
      | Promise<string | null | undefined>;
    test?: Test;
    validate?: Validate;
    pkgName?: string;
  }

  export interface RulesTestOptions {
    htmlDom: import("cheerio").CheerioAPI;
    url: string;
  }

  export type Metascraper = (options: MetascraperOptions) => Promise<Metadata>;
}
