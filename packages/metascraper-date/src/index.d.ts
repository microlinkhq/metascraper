type Options = {
  /**
   * Whether to add the date published and date modified to the result.
   * @default true
   */
  datePublished?: boolean,
  /**
   * Whether to add the date published and date modified to the result.
   * @default true
   */
  dateModified?: boolean
}

declare function rules(options?: Options): import('metascraper').Rules;
export = rules;
