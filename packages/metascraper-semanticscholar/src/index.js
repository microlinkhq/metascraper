const {
  $filter,
  date,
  title,
  memoizeOne,
  parseUrl,
  toRule,
  publisher
} = require('@metascraper/helpers')

const toDate = toRule(date)
const toPublisher = toRule(publisher)
const toTitle = toRule(title)

const test = memoizeOne(
  url => parseUrl(url).domainWithoutSuffix === 'semanticscholar'
)

const collateAuthors = ($, selector) =>
  $(selector)
    .map((_, el) => el.attribs.content)
    .get()
    .join(' and ')

module.exports = () => {
  const rules = {
    title: [
      toTitle($ => $filter($, $('h1[data-test-id="paper-detail-title"]')))
    ],
    author: [
      toTitle(($, url) => {
        return collateAuthors($, 'meta[name="citation_author"]', url)
      })
    ],
    publisher: [
      toPublisher($ =>
        $('meta[name="citation_journal_title"]').attr('content')
      ),
      toPublisher($ => $filter($, $('[data-heap-id="paper-meta-journal"]'))),
      toPublisher(() => 'Semantic Scholar')
    ],
    date: [
      toDate($ => $filter($, $('span[data-test-id="paper-year"]'))),
      toDate($ => $filter($, $('meta[name="citation_publication_date"]')))
    ]
  }

  rules.test = ({ url }) => test(url)

  return rules
}
