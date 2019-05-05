'use strict'
const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const metascraper = require('metascraper')([require('metascraper-title')()])
const should = require('should')

const readFile = promisify(fs.readFile)

describe('xss', () => {
  it('no escape attribute value', async () => {
    const html = await readFile(path.join(__dirname, 'files', 'issue-96.html'), 'utf8')

    const metadata = await metascraper({
      url: 'http://127.0.0.1:8080',
      html: html,
      escape: false
    })

    should(metadata.title).be.equal('<script src=‘http://127.0.0.1:8080/malware.js’></script>')
  })

  it('escape attribute value', async () => {
    const html = await readFile(path.join(__dirname, 'files', 'issue-96.html'), 'utf8')

    const metadata = await metascraper({
      url: 'http://127.0.0.1:8080',
      html: html,
      escape: true
    })

    should(metadata.title).be.equal(
      '&lt;script src=‘http://127.0.0.1:8080/malware.js’&gt;&lt;/script&gt;'
    )
  })
})
