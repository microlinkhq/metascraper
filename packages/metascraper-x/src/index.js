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

const getAuthorName = memoizeOne(ogTitle =>
  ogTitle?.split(' on X:')[0].split(' (@')[0].trim()
)

module.exports = ({ resolveUrl = url => url } = {}) => {
  const rules = {
    author: [
      toAuthor($ =>
        getAuthorName($('meta[property="og:title"]').attr('content'))
      )
    ],
    title: [
      toTitle(($, url) => {
        const username = new URL(url).pathname.split('/')[1]
        const authorName = getAuthorName(
          $('meta[property="og:title"]').attr('content')
        )
        return authorName
          ? `${authorName} (@${username}) on X`
          : `@${username} on X`
      })
    ],
    url: [toUrl($ => $('link[rel="canonical"]').attr('href'))],
    description: [
      toDescription(async $ => {
        let description =
          $jsonld('mainEntity.description')($) ||
          $('meta[property="og:description"]').attr('content')

        if (!description) {
          const ogTitle = $('meta[property="og:title"]').attr('content')
          if (ogTitle?.includes(' on X: "')) {
            description = ogTitle.split(' on X: "')[1].split('" / X')[0]
            const urls = getUrls(description)
            if (urls.length > 1) {
              const lastUrl = urls[urls.length - 1]
              if (description.endsWith(lastUrl)) {
                description = description.replace(lastUrl, '').trim()
              }
            }
          }
        }

        if (!description) return

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
        const imageUrl =
          $jsonld('mainEntity.image.contentUrl')($) ||
          $('video').attr('poster') ||
          $('meta[property="og:image"]').attr('content')

        return imageUrl?.endsWith('_200x200.jpg')
          ? imageUrl.replace('_200x200.jpg', '_400x400.jpg')
          : imageUrl
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
