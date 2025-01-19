'use strict'

const { memoizeOne, composeRule } = require('@metascraper/helpers')
const asyncMemoizeOne = require('async-memoize-one')
const { Worker } = require('worker_threads')
const path = require('path')

const SCRIPT_PATH = path.resolve(__dirname, 'worker.js')

const readability = asyncMemoizeOne((url, html, readabilityOpts) => {
  const worker = new Worker(SCRIPT_PATH, {
    workerData: { url, html, readabilityOpts }
  })
  const { promise, resolve, reject } = Promise.withResolvers()
  worker.on('message', message => resolve(JSON.parse(message)))
  worker.on('error', reject)
  return promise
}, memoizeOne.EqualityFirstArgument)

module.exports = ({ readabilityOpts } = {}) => {
  const getReadbility = composeRule(($, url) =>
    readability(url, $.html(), readabilityOpts)
  )

  const rules = {
    author: getReadbility({ from: 'byline', to: 'author' }),
    description: getReadbility({ from: 'excerpt', to: 'description' }),
    lang: getReadbility({ from: 'lang' }),
    publisher: getReadbility({ from: 'siteName', to: 'publisher' }),
    title: getReadbility({ from: 'title' })
  }

  rules.pkgName = 'metascraper-readability'

  return rules
}
