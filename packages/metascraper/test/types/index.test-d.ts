import createMetascraper from '../../src'

/* basic */

createMetascraper([])

createMetascraper([
  require('metascraper-author')(),
  require('metascraper-url')()
])

/* methods */

const metascraper = createMetascraper([
  require('metascraper-author')(),
  require('metascraper-url')()
])

const payload = await metascraper({
  url: 'https://example.com',
  html: '',
  validateUrl: false
})

console.log(payload.author)

/* validate */

await metascraper({
  url: 'https://example.com',
  html: '',
  validate: value => value.startsWith('https://')
})

await metascraper({
  url: 'https://example.com',
  html: '',
  validate: async (value, { propName, rule, args }) =>
    propName !== 'url' || value !== args.url
})

await metascraper({
  url: 'https://example.com',
  html: '',
  validate: {
    author: value => value.length > 1,
    url: async value => value.startsWith('https://')
  }
})
