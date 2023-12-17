type Options = {
  /**
   * The maximum length of the description.
   * @default Number.MAX_SAFE_INTEGER
   */
  truncateLength?: number,
  /**
   * The string to append if the description is truncated.
   * @default '…'
   */
  ellipsis?: string,
  /**
   * Whether to remove the byline from the description.
   * @default false
   */
  removeBy?: boolean,
  /**
   * Whether to remove the separator from the description.
   * @default false
   */
  removeSeparator?: boolean,
  /**
   * Whether to capitalize the description.
   * @default false
   */
  capitalize?: boolean
}

declare function rules(options?: Options): import('metascraper').Rules;
export = rules;
