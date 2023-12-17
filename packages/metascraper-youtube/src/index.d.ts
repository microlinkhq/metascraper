type Options = {
  /**
   * https://github.com/sindresorhus/got#options
   */
  gotOpts?: import('got').Options,
}

declare function rules(Option?): import('metascraper').Rules;
export = rules;
