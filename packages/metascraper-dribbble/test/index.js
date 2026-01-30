'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava')

const metascraperDribbble = require('metascraper-dribbble')

const createMetascraper = (...args) =>
  require('metascraper')([
    metascraperDribbble(...args),
    require('metascraper-author')(),
    require('metascraper-date')(),
    require('metascraper-image')(),
    require('metascraper-description')(),
    require('metascraper-lang')(),
    require('metascraper-publisher')(),
    require('metascraper-title')(),
    require('metascraper-url')()
  ])

test('from a profile', async t => {
  const url = 'https://dribbble.com/phenomenonstudio'
  const html = await readFile(resolve(__dirname, 'fixtures/profile.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.is(metadata.author, 'Phenomenon Studio')
  t.true(
    metadata.description.startsWith(
      'Phenomenon is a design and development company'
    )
  )
  t.false(metadata.description.includes('| Connect with them on Dribbble'))
  t.snapshot(metadata)
})

test('from a post', async t => {
  const url =
    'https://dribbble.com/shots/18895539-Modern-Admin-Dashboard-UI-Design-for-Flup-Furniture-App-Website'
  const html = await readFile(resolve(__dirname, 'fixtures/post.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })

  t.snapshot(metadata)
})
