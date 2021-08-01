'use strict'

const { composeRule } = require('@metascraper/helpers')
const { get, isString, isObject } = require('lodash')
const asyncMemoizeOne = require('async-memoize-one')
const { stringify } = require('querystring')
const { getDomain } = require('tldts')
const got = require('got')

const ENDPOINT = 'https://autocomplete.clearbit.com/v1/companies/suggest'

const DEFAULT_GOT_OPTS = {
  responseType: 'json',
  timeout: 3000
}

const appendQuery = (data, query) => {
  if (!isObject(data) || !isObject(query)) return data
  const logoUrl = get(data, 'logo')
  if (!isString(logoUrl)) return data
  return { ...data, logo: `${logoUrl}?${stringify(query)}` }
}

const createClearbit = ({ gotOpts, logoOpts } = {}) =>
  asyncMemoizeOne(async url => {
    const domain = getDomain(url)
    try {
      const { body } = await got(ENDPOINT, {
        ...DEFAULT_GOT_OPTS,
        ...gotOpts,
        searchParams: { query: domain }
      })

      return appendQuery(
        body.find(item => domain === item.domain),
        logoOpts
      )
    } catch (_) {}
  })

module.exports = opts => {
  const clearbit = createClearbit(opts)
  const getClearbit = composeRule(($, url) => clearbit(url))

  return {
    logo: getClearbit({ from: 'logo' }),
    publisher: getClearbit({ from: 'name', to: 'publisher' })
  }
}
