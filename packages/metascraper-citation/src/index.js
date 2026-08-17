'use strict'

const {
  author,
  date,
  memoizeOne,
  publisher,
  title,
  toRule
} = require('@metascraper/helpers')

const toAuthor = toRule(author)
const toDate = toRule(date)
const toPublisher = toRule(publisher)
const toTitle = toRule(title)

const meta = name => $ => $(`meta[name="${name}" i]`).attr('content')

/** Collect JATS-style given-name + surname pairs when citation/DC author tags are absent. */
const $authors = $ => {
  const names = []
  const seen = new Set()

  $('.given-name').each((_, el) => {
    const given = $(el).text()
    const surname = $(el).nextAll('.surname').first().text()
    const name = `${given} ${surname}`.replace(/\s+/g, ' ').trim()
    if (!name || seen.has(name)) return
    seen.add(name)
    names.push(name)
  })

  return names.length ? names : undefined
}

const MARKUP =
  'meta[name^="citation_" i], meta[name^="dc." i], meta[name^="dcterms." i]'

const test = memoizeOne(
  $ => $(MARKUP).length > 0,
  memoizeOne.EqualityFirstArgument
)

module.exports = () => {
  const rules = {
    title: [
      toTitle(meta('citation_title')),
      toTitle(meta('dc.title')),
      toTitle(meta('dcterms.title'))
    ],
    author: [
      toAuthor(meta('citation_author')),
      toAuthor(meta('dc.creator')),
      toAuthor(meta('dcterms.creator')),
      toAuthor(meta('dc.contributor')),
      toAuthor(meta('dcterms.contributor')),
      toAuthor($authors)
    ],
    date: [
      toDate(meta('citation_publication_date')),
      toDate(meta('citation_date')),
      toDate(meta('citation_online_date')),
      toDate(meta('dcterms.issued')),
      toDate(meta('dcterms.created')),
      toDate(meta('dc.date')),
      toDate(meta('dcterms.date'))
    ],
    publisher: [
      toPublisher(meta('citation_publisher')),
      toPublisher(meta('citation_journal_title')),
      toPublisher(meta('dc.publisher')),
      toPublisher(meta('dcterms.publisher'))
    ]
  }

  rules.test = ({ htmlDom }) => test(htmlDom)
  rules.pkgName = 'metascraper-citation'

  return rules
}

module.exports.test = test
