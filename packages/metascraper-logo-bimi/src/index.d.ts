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
   * It will be used to determine if the logo URL published in the BIMI record
   * is valid.
   */
  resolveLogoUrl?: (logoUrl: string, gotOpts?: import('got').Options) => Promise<string | undefined>,

  /**
   * The DNS resolver used to read the TXT record, matching the signature of
   * `dns.promises.resolveTxt`. Provide your own to run over DNS over HTTPS.
   * @default require('dns').promises.resolveTxt
   */
  resolveTxt?: (hostname: string) => Promise<string[][]>,

  /**
   * The BIMI selector to query, used as `<selector>._bimi.<domain>`.
   * @default 'default'
   */
  selector?: string
}

declare function rules(options?: Options): import('metascraper').Rules;
export = rules;
