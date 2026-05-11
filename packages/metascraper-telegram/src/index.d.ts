type Options = {
  /**
   * https://github.com/sindresorhus/got#options
   */
  gotOpts?: import('got').Options,
  /**
   * https://github.com/microlinkhq/keyv/tree/master/packages/memoize#keyvoptions
   */
  keyvOpts?: import('@keyvhq/core').Options<any>,
  /**
   * Custom iframe resolver, useful for testing.
   */
  getIframe?: (
    url: string,
    htmlDom: ReturnType<import('cheerio').load>
  ) => Promise<string> | string,
}

declare function rules(options?: Options): import('metascraper').Rules;
export = rules;
