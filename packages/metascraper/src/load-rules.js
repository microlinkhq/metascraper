'use strict'

const cwd = process.env.METASCRAPER_CONFIG_CWD || process.cwd()
const config = require('cosmiconfig')('metascraper').load(cwd)
const {
  findIndex,
  forEach,
  chain,
  isObject,
  isArray,
  isString,
  get
} = require('lodash')

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

    singletonConfig = chain(rules)
      .map(rule => {
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
      // merge rules with same props
      .reduce((acc, rules) => {
        forEach(rules, function (rule, propName) {
          const index = findIndex(acc, item => item[propName])
          if (index !== -1) {
            acc[index][propName] = rule.concat(acc[index][propName])
          } else {
            acc.push({ [propName]: rule })
          }
        })
        return acc
      }, [])
      // export an array interface, it's easier to iterate
      .map(obj => {
        const key = Object.keys(obj)[0]
        const value = obj[key]
        return [key, value]
      })
      .value()

    return singletonConfig
  })
