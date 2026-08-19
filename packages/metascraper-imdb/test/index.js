'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava').default

const metascraperImdb = require('metascraper-imdb')

const createMetascraper = (...args) =>
  require('metascraper')([
    metascraperImdb(...args),
    require('metascraper-author')(),
    require('metascraper-date')(),
    require('metascraper-image')(),
    require('metascraper-description')(),
    require('metascraper-lang')(),
    require('metascraper-publisher')(),
    require('metascraper-title')(),
    require('metascraper-url')()
  ])

test('from a title page', async t => {
  const url = 'https://www.imdb.com/title/tt0091042/'
  const html = await readFile(resolve(__dirname, 'fixtures/title.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.is(metadata.title, 'Ferris Bueller’s Day Off')
  t.is(metadata.author, 'John Hughes')
  t.true(
    metadata.description.startsWith(
      'Ferris Bueller’s Day Off: Directed by John Hughes'
    )
  )
  t.false(metadata.title.includes('⭐'))
  t.false(metadata.description.includes('1h 43m'))
  t.not(metadata.author, 'mdm-11')
  t.is(metadata.publisher, 'IMDb')
  t.snapshot(metadata)
})
