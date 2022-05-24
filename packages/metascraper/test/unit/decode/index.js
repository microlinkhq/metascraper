'use strict'

const { readFile } = require('fs').promises
const { resolve } = require('path')
const test = require('ava')

const createMetascraper = require('../../..')
const imageRules = require('metascraper-image')()

test('decode entities properly', async t => {
  const metascraper = createMetascraper([imageRules])
  const url = 'https://www.instagram.com/p/BvDTdWdnzkj'
  const html = await readFile(resolve(__dirname, 'input.html'))
  const metadata = await metascraper({ html, url })

  t.is(
    metadata.image,
    'https://scontent-lga3-1.cdninstagram.com/v/t51.2885-15/e15/52643291_128871201513344_8032404419029138690_n.jpg?_nc_ht=scontent-lga3-1.cdninstagram.com&_nc_cat=108&_nc_ohc=j4ieeuHWYK4AX-l1u13&oh=9a463da62609acfc82c85115521183e0&oe=5E1C6D32'
  )
})
