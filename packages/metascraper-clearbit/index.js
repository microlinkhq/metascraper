'use strict'

const { composeRule, parseUrl } = require('@metascraper/helpers')
const { get, isString, isObject } = require('lodash')
const asyncMemoizeOne = require('async-memoize-one')
const { stringify } = require('querystring')
const memoize = require('@keyvhq/memoize')
const got = require('got')

const ENDPOINT = 'https://autocomplete.clearbit.com/v1/companies/suggest'

const appendQuery = (data, query) => {
  if (!isObject(data) || !isObject(query)) return data
  const logoUrl = get(data, 'logo')
  if (!isString(logoUrl)) return data
  return { ...data, logo: `${logoUrl}?${stringify(query)}` }
}

const createClearbit = ({ gotOpts, keyvOpts, logoOpts } = {}) => {
  const clearbit = async domain => {
    try {
      const { body } = await got(ENDPOINT, {
        ...gotOpts,
        responseType: 'json',
        searchParams: { query: domain }
      })

      return appendQuery(
        body.find(item => domain === item.domain),
        logoOpts
      )
    } catch (_) {}
  }

  return asyncMemoizeOne(
    memoize(clearbit, keyvOpts, {
      value: value => (value === undefined ? null : value)
    })
  )
}

module.exports = opts => {
  const clearbit = createClearbit(opts)
  const getClearbit = composeRule(($, url) => clearbit(parseUrl(url).domain))

  return {
    logo: getClearbit({ from: 'logo' }),
    publisher: getClearbit({ from: 'name', to: 'publisher' })
  }
}
