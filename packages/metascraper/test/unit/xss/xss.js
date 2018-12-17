'use strict'
const fs = require('fs')
const path = require('path')
const metascraper = require(path.join(__dirname, '..', '..', '..'))([
  require(path.join(__dirname, '..', '..', '..', '..', 'metascraper-title'))()
])
const assert = require('assert')

describe('xss', () => {
  // https://github.com/microlinkhq/metascraper/issues/96
  // https://www.npmjs.com/advisories/603
  it('escape attribute value', done => {
    fs.readFile(
      path.join(__dirname, 'files', 'issue-96.html'),
      'utf8',
      (error, html) => {
        if (error) {
          throw error
        }
        metascraper({
          url: 'http://127.0.0.1:8080',
          html: html
        }).then(metadata => {
          assert.equal(
            metadata.title,
            '&lt;script src=‘http://127.0.0.1:8080/malware.js’&gt;&lt;/script&gt;'
          )
          done()
        })
      }
    )
  })
})
