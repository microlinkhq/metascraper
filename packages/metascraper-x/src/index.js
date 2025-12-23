'use strict'

const {
  $jsonld,
  author,
  date,
  description,
  getUrls,
  image,
  memoizeOne,
  parseUrl,
  title,
  toRule,
  url
} = require('@metascraper/helpers')

const toDescription = toRule(description)
const toAuthor = toRule(author)
const toImage = toRule(image)
const toTitle = toRule(title)
const toDate = toRule(date)
const toUrl = toRule(url)

const test = memoizeOne(url =>
  ['twitter.com', 'x.com'].includes(parseUrl(url).domain)
)

module.exports = ({ resolveUrl = url => url } = {}) => {
  const rules = {
    author: [
      toAuthor($ => {
        const author = $('meta[property="og:title"]').attr('content')
        return author?.includes(' / X') ? author.split(' / X')[0] : author
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
        let description =
          $jsonld('mainEntity.description')($) ||
          $('meta[property="og:description"]').attr('content')

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
        let imageUrl =
          $jsonld('mainEntity.image.contentUrl')($) ||
          $('meta[property="og:image"]').attr('content')

        if (imageUrl?.endsWith('_200x200.jpg')) {
          imageUrl = imageUrl.replace('_200x200.jpg', '_400x400.jpg')
        }
        return imageUrl
      })
    ],
    date: [
      toDate(($, url) => {
        const { pathname } = new URL(url)
        const parts = pathname.split('/')
        const username = parts[1].toLowerCase()
        const isStatus = parts[2] === 'status'

        if (isStatus) {
          const statusId = parts[3]
          return (
            $(`a[href*="/status/${statusId}"] time`).attr('datetime') ||
            $('article time').attr('datetime') ||
            $('time').attr('datetime')
          )
        }

        return $(`a[href*="/${username}/status/" i] time`)
          .get()
          .reduce((acc, el) => {
            const datetime = $(el).attr('datetime')
            if (datetime && (!acc || datetime > acc)) {
              acc = datetime
            }
            return acc
          }, undefined)
      })
    ],
    publisher: () => 'X'
  }

  rules.test = ({ url }) => test(url)

  rules.pkgName = 'metascraper-x'

  return rules
}

module.exports.test = test
