'use strict'

const {
  getUrls,
  author,
  image,
  memoizeOne,
  parseUrl,
  title,
  toRule,
  description,
  url
} = require('@metascraper/helpers')

const toAuthor = toRule(author)
const toImage = toRule(image)
const toTitle = toRule(title)
const toDescription = toRule(description)
const toUrl = toRule(url)

const test = memoizeOne(url =>
  ['twitter.com', 'x.com'].includes(parseUrl(url).domain)
)

module.exports = ({ resolveUrls = false, resolveUrl = url => url } = {}) => {
  const rules = {
    author: [
      toAuthor($ => {
        const author = $('meta[property="og:title"]').attr('content')
        return author?.includes(' on X') ? author.split(' on X')[0] : author
      })
    ],
    title: [
      toTitle(
        ($, url) => `@${new URL(url).pathname.toString().split('/')[1]} on X`
      )
    ],
    url: [
      toUrl($ =>
        $('link[rel="canonical"]').attr('href')?.replace('twitter.com', 'x.com')
      )
    ],
    description: [
      toDescription(async $ => {
        let description = $('meta[property="og:description"]').attr('content')
        if (!resolveUrls) return description
        const urls = getUrls(description)
        const resolvedUrls = await Promise.all(urls.map(resolveUrl))

        for (const [index, url] of resolvedUrls.entries()) {
          const original = urls[index]
          description = description.replace(original, url)
        }

        return description
      })
    ],
    image: [
      toImage($ => {
        let imageUrl = $('meta[property="og:image"]').attr('content')
        if (imageUrl?.endsWith('_200x200.jpg')) {
          imageUrl = imageUrl.replace('_200x200.jpg', '_400x400.jpg')
        }
        return imageUrl
      })
    ],
    publisher: () => 'X'
  }

  rules.test = ({ url }) => test(url)

  return rules
}

module.exports.test = test
