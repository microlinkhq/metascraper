'use strict'

const reachableUrl = require('reachable-url')
const getVideoId = require('get-video-id')
const pLocate = require('p-locate')

const {
  $filter,
  author,
  memoizeOne,
  title,
  toRule
} = require('@metascraper/helpers')

const THUMBAILS_RESOLUTIONS = [
  'maxresdefault.jpg',
  'sddefault.jpg',
  'hqdefault.jpg',
  'mqdefault.jpg',
  'default.jpg'
]

const getThumbnailUrl = (id, gotOpts) => {
  const urls = THUMBAILS_RESOLUTIONS.map(
    res => `https://img.youtube.com/vi/${id}/${res}`
  )

  return pLocate(urls, async url =>
    reachableUrl.isReachable(await reachableUrl(url, gotOpts))
  )
}

const toAuthor = toRule(author)

const toTitle = toRule(title)

const getVideoInfo = memoizeOne(getVideoId)

const test = memoizeOne(url => getVideoInfo(url).service === 'youtube')

module.exports = ({ gotOpts } = {}) => {
  const rules = {
    title: [toTitle($ => $('title').text().replace(' - YouTube', ''))],
    author: [
      toAuthor($ => $filter($, $('[class*="user-info" i]'))),
      toAuthor($ => $('[itemprop="author"] [itemprop="name"]').attr('content'))
    ],
    publisher: () => 'YouTube',
    image: [
      ({ url }) => {
        const { id } = getVideoId(url)
        return id && getThumbnailUrl(id, gotOpts)
      }
    ]
  }

  rules.test = ({ url }) => test(url)

  rules.pkgName = 'metascraper-youtube'

  return rules
}

module.exports.test = test
