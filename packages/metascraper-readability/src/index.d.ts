type Options = {
  getDocument: ({url: string, html: string }) => Document,
  readabilityOpts: import('readability').ReadabilityOptions,
}

declare function rules(options?: Options): import('metascraper').Rules;
export = rules;
