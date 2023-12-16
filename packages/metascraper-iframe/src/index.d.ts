type Options = {
  /**
   * https://github.com/sindresorhus/got#options
   */
  gotOpts?: import('got').Options,
}

export default function rules(options?: Options): import('metascraper').Rules;
