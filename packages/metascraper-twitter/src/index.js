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

const REGEX_IMG_MODIFIERS = /_(?:bigger|mini|normal|x96)\./
const ORIGINAL_IMG_SIZE = '_400x400'

const isTweet = url => url.includes('/status/')

const avatarUrl = str =>
  str?.replace(REGEX_IMG_MODIFIERS, `${ORIGINAL_IMG_SIZE}.`)

module.exports = () => {
  const rules = {
    author: [
      toAuthor($jsonld('author.givenName')),
      toAuthor($ => {
        const author = $('meta[property="og:title"]').attr('content')
        return author?.includes(' on X') ? author.split(' on X')[0] : author
      })
    ],
    title: [toTitle(($, url) => `@${url.split('/')[3]} on X`)],
    date: [
      toDate(($, url) => {
        const id = url.replace('https://twitter.com', '')
        return $(`a[href="${id}"] time`).attr('datetime')
      })
    ],
    image: [
      toImage(
        ($, url) =>
          isTweet(url) && $('meta[property="og:image"]').attr('content')
      ),
      toImage(($, url) => isTweet(url) && $('video').attr('poster')),
      toImage($ => avatarUrl($jsonld('author.image.contentUrl')($))),
      toImage($ => avatarUrl($('article img[src]').attr('src')))
    ],
    video: [toVideo(($, url) => isTweet(url) && $('video').attr('src'))],
    publisher: () => 'X'
  }

  rules.test = ({ url }) => test(url)

  return rules
}

module.exports.test = test
