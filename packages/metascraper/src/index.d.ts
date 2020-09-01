declare module 'metascraper' {
  export default function MetaParser(rules: Rule[]): Scraper;

  type Scraper = (options: ScrapOptions) => Promise<Metadata>;
  interface ScrapOptions {
    url: string;
    html?: string;
    rules?: Rule[];
  }
  interface Metadata {
    author: string;
    date: string;
    description: string;
    image: string;
    publisher: string;
    title: string;
    url: string;
  }
  type RuleSet = {
    [C in keyof Metadata]?: Array<Check>;
  };
  type Check = (options: CheckOptions) => string | null | undefined;
  interface CheckOptions {
    htmlDom: typeof import('cheerio');
    url: string
  }
  type Rule = () => RuleSet;
}

declare module 'metascraper-*' {
  export default function rules(): import('metascraper').Rule;
}
