declare function rules(): import('metascraper').Rules;

declare namespace rules {
  function test(input: { url: string }): boolean;

  /** Extract the numeric status id from an X status/article URL, if any. */
  function parseTweetId(url: string): string | undefined;

  /** Deterministic syndication token derived from a status id. */
  function getToken(id: string): string;

  /** Build a clean HTML document from a syndication tweet payload. */
  function buildHtml(tweet: object, url: string): string;

  /** Resolve an X status/article URL into HTML built from the public syndication payload. */
  function getEmbed(
    url: string,
    opts?: { fetch?: typeof globalThis.fetch; timeout?: number }
  ): Promise<{ html: string; tweet: object } | undefined>;
}

export = rules;
