'use strict'

const {
  $jsonld,
  author,
  date,
  image,
  memoizeOne,
  parseUrl,
  title,
  toRule,
  video
} = require('@metascraper/helpers')

const toAuthor = toRule(author)
const toDate = toRule(date)
const toImage = toRule(image)
const toVideo = toRule(video)
const toTitle = toRule(title)

const test = memoizeOne(url => parseUrl(url).domainWithoutSuffix === 'twitter')

const REGEX_IMG_MODIFIERS = /_(?:bigger|mini|normal)\./
const ORIGINAL_IMG_SIZE = '_400x400'

module.exports = () => {
  const rules = {
    author: [
      toAuthor($jsonld('author.givenName')),
      toAuthor($ => {
        const author = $('meta[property="og:title"]').attr('content')
        return author?.includes(' on Twitter')
          ? author.split(' on Twitter')[0]
          : author
      })
    ],
    title: [toTitle(($, url) => `@${url.split('/')[3]} on Twitter`)],
    date: [
      toDate(($, url) => {
        const id = url.replace('https://twitter.com', '')
        return $(`a[href="${id}"] time`).attr('datetime')
      })
    ],
    image: [
      toImage($jsonld('image.contentUrl')),
      toImage($ => $('video').attr('poster')),
      toImage($ => {
        const avatar = $('article img[src]').attr('src')
        return avatar?.replace(REGEX_IMG_MODIFIERS, `${ORIGINAL_IMG_SIZE}.`)
      })
    ],
    video: [toVideo($ => $('video').attr('src'))],
    publisher: () => 'Twitter'
  }

  rules.test = ({ url }) => test(url)

  return rules
}

module.exports.test = test
