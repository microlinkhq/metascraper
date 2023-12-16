type Options = {
  /**
   * https://github.com/sindresorhus/got#options
   */
  gotOpts?: import('got').Options,
}

export default function rules(Option?): import('metascraper').Rules;
