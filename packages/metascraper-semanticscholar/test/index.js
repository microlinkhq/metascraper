'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava')

const metascraper = require('metascraper')([
  require('metascraper-semanticscholar')(),
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

test('meow', async t => {
  const html = await readFile(resolve(__dirname, 'fixtures/meow.html'))
  const url =
    'https://www.semanticscholar.org/paper/What%E2%80%99s-in-a-Meow-A-Study-on-Human-Classification-of-Prato-Previde-Cannas/d1de4343d4076843583ca5826f345be6cb5cd75c'

  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('crosswalk', async t => {
  const html = await readFile(resolve(__dirname, 'fixtures/crosswalk.html'))
  const url =
    'https://www.semanticscholar.org/paper/Where-the-Crosswalk-Ends%3A-Mapping-Crosswalk-via-in-Moran/704dde842312c5eabb8c76ecf86b48e9fe68e4fe'

  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})
