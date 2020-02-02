'use strict'

const { memoizeOne, composeRule } = require('@metascraper/helpers')
const { get, isString, isObject } = require('lodash')
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
  memoizeOne(async ($, url) => {
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
    } catch (err) {
      return null
    }
  })

module.exports = opts => {
  const getClearbit = composeRule(createClearbit(opts))

  return {
    logo: getClearbit({ from: 'logo' }),
    publisher: getClearbit({ from: 'name', to: 'publisher' })
  }
}
