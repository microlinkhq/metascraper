type DOMNOdeAtributes = Record<string, any>

type Options = {
  /**
   * Enable favicon.ico detection
   * @default true
   */
  favicon?: boolean,

  /**
   * Enable retrieve logo from Google API.
   * @default true
   */
  google?: boolean,

  /**
   * https://github.com/sindresorhus/got#options
   */
  gotOpts?: import('got').Options,

  /**
   * https://github.com/microlinkhq/keyv/tree/master/packages/memoize#keyvoptions
   */
  keyvOpts?: import('@keyvhq/core').Options<any>,

  /**
   * The function to pick the favicon from the list of favicons.
   */
  pickFn?: (sizes: DOMNOdeAtributes[]) => DOMNOdeAtributes,

  /**
   * It will be used to determine if a favicon URL is valid.
   */
  resolveFaviconUrl?: (faviconUrl: string, contentTypes: string[], gotOpts: import('got').Options) => Promise<import('got').Response<string> | undefined>,

  /**
   * Enable favicon.ico using the root domain for subdomains
   * @default true
   */
  rootFavicon?: boolean | RegExp,
}

declare function rules(options?: Options): import('metascraper').Rules;
export = rules;


