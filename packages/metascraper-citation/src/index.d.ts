declare function rules(): import('metascraper').Rules;

declare namespace rules {
  /**
   * `true` when the document has at least one Highwire (`citation_*`)
   * or Dublin Core (`dc.*` / `dcterms.*`) meta tag.
   */
  function test(htmlDom: import('cheerio').CheerioAPI): boolean;
}

export = rules;
