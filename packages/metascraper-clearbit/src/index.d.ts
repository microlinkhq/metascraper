type Options = {
  /**
   * https://github.com/sindresorhus/got#options
   */
  gotOpts?: import('got').Options,
  /**
   * https://github.com/microlinkhq/keyv/tree/master/packages/memoize#keyvoptions
   */
  keyvOpts?: import('@keyvhq/core').Options,
  /**
   * https://dashboard.clearbit.com/docs#logo-api
   */
  logoOpts?: {
    size: number,
    format: "png" | "jpg"
    greyscale: false
  }
}

declare function rules(options?: Options): import('metascraper').Rules;
export = rules;
