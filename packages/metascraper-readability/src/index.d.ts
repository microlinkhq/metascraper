type Options = {
  readabilityOpts: import('readability').ReadabilityOptions,
}

declare function rules(options?: Options): import('metascraper').Rules;
export = rules;
