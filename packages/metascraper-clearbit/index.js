'use strict'

const { createValidator } = require('@metascraper/helpers')
const memoizeOne = require('memoize-one')
const { getDomain } = require('tldts')
const got = require('got')

const ENDPOINT = 'https://autocomplete.clearbit.com/v1/companies/suggest'

const memoFn = (newArgs, oldArgs) => newArgs[0].url === oldArgs[0].url

const clearbit = memoizeOne(async ({ url }) => {
  const domain = getDomain(url)

  try {
    const { body } = await got(`${ENDPOINT}?query=${domain}`, {
      json: true,
      retry: 0,
      timeout: 1000
    })

    return body.find(item => domain === item.domain)
  } catch (err) {
    return null
  }
}, memoFn)

const getClearbit = createValidator(clearbit)

module.exports = () => {
  return {
    logo: getClearbit({ from: 'logo' }),
    publisher: getClearbit({ from: 'name', to: 'publisher' })
  }
}
