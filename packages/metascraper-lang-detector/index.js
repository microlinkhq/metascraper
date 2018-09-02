'use strict'

const { lang } = require('@metascraper/helpers')
const { reduce, find, eq, get } = require('lodash')
const langs = require('iso-639-3')
const franc = require('franc')

const detectLang = (collection, field) => {
  const langDetected = franc(get(collection, field))
  const { iso6391 = '' } = find(langs, ({ iso6393 }) =>
    eq(iso6393, langDetected)
  )
  return lang(iso6391)
}

module.exports = ({ fields = ['description'] }) =>
  reduce(
    fields,
    (acc, prop) => {
      const fn = ({ meta }) => detectLang(meta, prop)
      return acc.concat(fn)
    },
    { lang: [] }
  )

module.exports.detectLang = detectLang
