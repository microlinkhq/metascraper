type Options = {
  /**
   * https://github.com/sindresorhus/got#options
   */
  gotOpts?: import('got').Options,
  /**
   * https://github.com/microlinkhq/keyv/tree/master/packages/memoize#keyvoptions
   */
  keyvOpts?: import('@keyvhq/core').Options<any>,
}

declare function rules(options?: Options): import('metascraper').Rules;
export = rules;
