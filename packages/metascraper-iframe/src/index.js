'use strict'

const { getDomainWithoutSuffix } = require('tldts')
const memoizeOne = require('memoize-one')
const { find, some } = require('lodash')

const providers = require('./providers')

const getService = url => {
  let service
  find(providers, ({ test }, provider) => (service = test(url) && provider))
  return service || getDomainWithoutSuffix(url)
}

const iframe = async ({ url, meta, htmlDom, ...query }) => {
  const service = getService(url)
  return providers[service]({ url, ...query })
}

const isValidUrl = memoizeOne(({ url }) =>
  some(providers, provider => provider.test(url))
)

module.exports = () => {
  const rules = { iframe }
  rules.test = isValidUrl
  return rules
}
