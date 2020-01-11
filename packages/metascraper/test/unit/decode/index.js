'use strict'

const should = require('should')
const { readFile } = require('fs').promises
const { resolve } = require('path')

const createMetascraper = require('../../..')
const imageRules = require('metascraper-image')()

it('decode entities properly', async () => {
  const metascraper = createMetascraper([imageRules])
  const url = 'https://www.instagram.com/p/BvDTdWdnzkj'
  const html = await readFile(resolve(__dirname, 'input.html'))
  const metadata = await metascraper({ html, url })

  should(metadata.image).be.equal(
    'https://scontent-lga3-1.cdninstagram.com/v/t51.2885-15/e15/52643291_128871201513344_8032404419029138690_n.jpg?_nc_ht=scontent-lga3-1.cdninstagram.com&_nc_cat=108&_nc_ohc=j4ieeuHWYK4AX-l1u13&oh=9a463da62609acfc82c85115521183e0&oe=5E1C6D32'
  )
})
