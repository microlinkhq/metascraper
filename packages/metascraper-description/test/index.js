'use strict'

const should = require('should')

const createMetascraperDescription = require('..')
const createMetascraper = require('metascraper')

describe('metascraper-description', () => {
  describe('options', () => {
    it('truncateLength', async () => {
      const url = 'https://example.com'
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="description" content="welcome to metascraper">
</head>
<body></body>
</html>`

      const metascraper = createMetascraper([
        createMetascraperDescription({ truncateLength: 2 })
      ])
      const metadata = await metascraper({ url, html })
      should(metadata.description).be.equal('w…')
    })
  })
})
