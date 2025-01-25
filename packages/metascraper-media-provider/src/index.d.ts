type Options = {
  /**
   * The directory where the youtube-dl binary will be downloaded.
   * @default undefined
   */
  cacheDir?: string;
  /**
   * Whether to get the proxy from the environment variable.
   * @default false
   */
  getProxy?: boolean;
  /**
   * The timeout in milliseconds.
   * @default 30000
   */
  timeout?: number;
  /**
   * The number of retries.
   * @default 2
   */
  retry?: number;
  /**
   * The options to pass to https://github.com/sindresorhus/got#options
   * @default {}
   */
  gotOpts: import('got').Options;
} & import('youtube-dl-exec').Flags;

declare function rules(options?: Options): import('metascraper').Rules
export = rules;
