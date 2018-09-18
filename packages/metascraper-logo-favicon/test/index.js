'use strict'

const snapshot = require('snap-shot')
const { promisify } = require('util')
const { resolve } = require('path')
const { omit } = require('lodash')
const fs = require('fs')

const metascraper = require('metascraper')([require('..')()])

const readFile = promisify(fs.readFile)

describe('metascraper-logo-favicon', () => {
  it('create an absolute favicon url if the logo is not present', async () => {
    const html = await readFile(resolve(__dirname, 'fixtures/input.html'))
    const url =
      'https://www.amazon.co.uk/Vegetable-Perfection-tasty-recipes-shoots/dp/1849757097/ref=asap_bc?ie=UTF8'
    const meta = omit(await metascraper({ html, url }), ['date'])
    snapshot(meta)
  })
})
