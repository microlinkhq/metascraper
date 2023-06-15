declare module 'metascraper' {
  export default function MetaParser(rules: RuleSet[]): Scraper;

  type Scraper = (options: ScrapOptions) => Promise<Metadata>;

  interface ScrapOptions {
    url: string;
    html?: string;
    rules?: RuleSet[];
    validateUrl?: boolean;
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
  } & {
    test?: (options: CheckOptions) => boolean;
  }

  type Check = (options: CheckOptions) => string | null | undefined;

  interface CheckOptions {
    htmlDom: import('cheerio').CheerioAPI;
    url: string
  }
}

declare module 'metascraper-*' {
  export default function rules(): import('metascraper').RuleSet;
}
