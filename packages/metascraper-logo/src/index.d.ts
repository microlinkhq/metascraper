type Options = {
  filter?: (url: string) => boolean
}

export default function rules(options?: Options): import('metascraper').Rules;
