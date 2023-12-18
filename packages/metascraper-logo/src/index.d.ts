type Options = {
  filter?: (url: string) => boolean
}

declare function rules(options?: Options): import('metascraper').Rules;
export = rules;
