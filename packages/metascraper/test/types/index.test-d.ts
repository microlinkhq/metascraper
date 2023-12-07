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
