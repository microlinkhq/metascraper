type Options = {
  preprocess?: (document: Document, html: string) => void,
  defuddleOpts?: import('defuddle/node').DefuddleOptions
}

declare function rules(options?: Options): import('metascraper').Rules
export = rules
