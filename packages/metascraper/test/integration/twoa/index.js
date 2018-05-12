'use strict'

const snapshot = require('snap-shot')
const { promisify } = require('util')
const { resolve } = require('path')

const fs = require('fs')

const metascraper = require('../../..')
const readFile = promisify(fs.readFile)

const url =
  'https://www.twoa.ac.nz/Hononga-Stay-Connected/News-Events/2018/04/19/School-of-Hard-Knocks-returns'

it('twoa', async () => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const metadata = await metascraper({ html, url })
  snapshot(metadata)
})
