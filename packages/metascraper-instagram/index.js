'use strict'

const { memoizeOne, composeRule } = require('@metascraper/helpers')
const { getDomainWithoutSuffix } = require('tldts')
const { JSDOM, VirtualConsole } = require('jsdom')
const { get } = require('lodash')

const isValidUrl = memoizeOne(
  url => getDomainWithoutSuffix(url) === 'instagram'
)

const extractData = memoizeOne((url, $) => {
  const dom = new JSDOM($.html(), {
    url,
    virtualConsole: new VirtualConsole(),
    runScripts: 'dangerously'
  })
  const sharedData = get(dom, 'window._sharedData')

  const media = get(
    sharedData,
    'entry_data.PostPage[0].graphql.shortcode_media'
  )

  const author = get(media, 'owner.full_name')
  const username = get(media, 'owner.username')

  return {
    author: author,
    video: get(media, 'video_url'),
    image: get(media, 'display_url'),
    date: get(media, 'taken_at_timestamp'),
    title: `${author} (@${username}) on Instagram`,
    description: get(media, 'edge_media_to_caption.edges[0].node.text')
  }
})
const getData = composeRule(($, url) => extractData(url, $))

module.exports = () => {
  const rules = {
    author: getData({ from: 'author' }),
    video: getData({ from: 'video' }),
    title: getData({ from: 'title' }),
    date: getData({ from: 'date' }),
    image: getData({ from: 'image' }),
    description: getData({ from: 'description' }),
    publisher: () => 'Instagram'
  }
  rules.test = ({ url }) => isValidUrl(url)
  return rules
}
