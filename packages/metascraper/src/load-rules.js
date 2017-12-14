'use strict'

const cwd = process.env.METASCRAPER_CONFIG_CWD || process.cwd()
const config = require('cosmiconfig')('metascraper').load(cwd)
const { isObject, isArray, isString, get } = require('lodash')

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
  Promise.resolve(config).then(configFile => {
    const rules = get(configFile, 'config.rules', DEFAULT_RULES)

    singletonConfig = rules.map(rule => {
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
