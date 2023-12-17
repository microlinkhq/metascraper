type Options = {
  /**
   * https://github.com/sindresorhus/got#options
   */
  gotOpts?: import('got').Options,
}

declare function rules(options?: Options): import('metascraper').Rules;
export = rules;
