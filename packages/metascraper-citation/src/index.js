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

const test = memoizeOne(
  $ => $('meta[name^="citation_" i]').length > 0,
  memoizeOne.EqualityFirstArgument
)

module.exports = () => {
  const rules = {
    title: [toTitle($ => $('meta[name="citation_title" i]').attr('content'))],
    author: [
      toAuthor($ => $('meta[name="citation_author" i]').attr('content'))
    ],
    date: [
      toDate($ =>
        $('meta[name="citation_publication_date" i]').attr('content')
      ),
      toDate($ => $('meta[name="citation_online_date" i]').attr('content')),
      toDate($ => $('meta[name="citation_date" i]').attr('content'))
    ],
    publisher: [
      toPublisher($ => $('meta[name="citation_publisher" i]').attr('content')),
      toPublisher($ =>
        $('meta[name="citation_journal_title" i]').attr('content')
      )
    ]
  }

  rules.test = ({ htmlDom }) => test(htmlDom)
  rules.pkgName = 'metascraper-citation'

  return rules
}

module.exports.test = test
