'use strict'

const config = require('cosmiconfig')('metascraper').load(process.cwd())
const { isObject, isArray, isString } = require('lodash')

const DEFAULT_RULES = [
  'metascraper-author',
  'metascraper-date',
  'metascraper-description',
  'metascraper-image',
  'metascraper-logo',
  'metascraper-publisher',
  'metascraper-title',
  'metascraper-url'
]

let singletonConfig

module.exports = () =>
  singletonConfig ||
  Promise.resolve(config).then(({ config = { rules: DEFAULT_RULES } }) => {
    singletonConfig = config.rules.map(rule => {
      let moduleName
      let moduleConfig

      if (isString(rule)) {
        moduleName = rule
      } else if (isArray(rule)) {
        moduleName = rule[0]
        moduleConfig = rule[1]
      } else if (isObject(rule)) {
        moduleName = Object.keys(rule)[0]
        moduleConfig = rule[moduleName]
      }

      return require(moduleName)(moduleConfig)
    })
    return singletonConfig
  })
