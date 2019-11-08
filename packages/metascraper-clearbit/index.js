'use strict'

const { composeRule } = require('@metascraper/helpers')
const { get, isString, isObject } = require('lodash')
const { stringify } = require('querystring')
const memoizeOne = require('memoize-one')
const { getDomain } = require('tldts')
const got = require('got')

const ENDPOINT = 'https://autocomplete.clearbit.com/v1/companies/suggest'

const memoFn = (newArgs, oldArgs) => newArgs[1] === oldArgs[1]

const DEFAULT_GOT_OPTS = {
  json: true,
  timeout: 3000,
  retry: 0
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
      const { body } = await got(`${ENDPOINT}?query=${domain}`, {
        ...DEFAULT_GOT_OPTS,
        ...gotOpts
      })

      return appendQuery(body.find(item => domain === item.domain), logoOpts)
    } catch (err) {
      return null
    }
  }, memoFn)

module.exports = opts => {
  const getClearbit = composeRule(createClearbit(opts))

  return {
    logo: getClearbit({ from: 'logo' }),
    publisher: getClearbit({ from: 'name', to: 'publisher' })
  }
}
