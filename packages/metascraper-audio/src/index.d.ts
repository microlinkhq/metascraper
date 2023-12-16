type IframeAttributes = {
  src: string
}

type Options = {
  getIframe?: (url: string, htmlDom: import('cheerio').CheerioAPI, iframeAttributes: IframeAttributes) => string;
}

export default function rules(options?: Options): import('metascraper').Rules;
