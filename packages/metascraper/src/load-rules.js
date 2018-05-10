'use strict'

const cwd = process.env.METASCRAPER_CWD || process.cwd()
const config = require('cosmiconfig')('metascraper').search(cwd)
const resolveFrom = require('resolve-from')

const {concat, map, findIndex, forEach, chain, isObject, isArray, isString, get} = require('lodash')

const DEFAULT_RULES = [
  'metascraper-author',
  'metascraper-date',
  'metascraper-description',
  'metascraper-video',
  'metascraper-image',
  'metascraper-lang',
  'metascraper-logo',
  'metascraper-publisher',
  'metascraper-title',
  'metascraper-url'
]

const load = rules =>
  chain(rules)
    // merge rules with same props
    .reduce((acc, rules) => {
      forEach(rules, function (rule, propName) {
        const index = findIndex(acc, item => item[propName])
        if (index !== -1) acc[index][propName] = concat(acc[index][propName], rule)
        else acc.push({[propName]: concat(rule)})
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

const autoload = async () => {
  const configFile = await config
  const rulesConfig = get(configFile, 'config.rules', DEFAULT_RULES)

  const rules = map(rulesConfig, rule => {
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

    const modulePath = resolveFrom(cwd, moduleName)
    return require(modulePath)(moduleConfig)
  })

  return load(rules)
}

module.exports = {
  autoload,
  load
}
