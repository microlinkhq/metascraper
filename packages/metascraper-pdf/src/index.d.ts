declare function rules(options?: rules.Options): import('metascraper').Rules;

declare namespace rules {
  interface Options {
    /**
     * How many pages to read text from. Only the first page is used for the
     * title, author and publisher; extra pages feed the description fallback.
     *
     * @default 2
     */
    maxPages?: number;
    /**
     * https://github.com/sindresorhus/got#options
     */
    gotOpts?: import('got').Options;
    /**
     * https://github.com/microlinkhq/keyv/tree/master/packages/memoize#keyvoptions
     */
    keyvOpts?: import('@keyvhq/core').Options<any>;
    /**
     * Called to get the PDF bytes behind `url`. Defaults to a `got` download.
     */
    getPdf?: (url: string) => Buffer | Uint8Array | null | undefined | Promise<Buffer | Uint8Array | null | undefined>;
  }

  /** `true` when `url` points at a PDF document. */
  function test(props: { url?: string }): boolean;
}

export = rules;
