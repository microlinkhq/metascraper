'use strict'

const { lang } = require('@metascraper/helpers')
const { reduce, get } = require('lodash')
const langs = require('iso-639-3')
const franc = require('franc')

const toIso6391 = reduce(
  langs,
  (acc, { iso6393, iso6391 }) => {
    if (iso6391) acc[iso6393] = iso6391
    return acc
  },
  {}
)

const detectLang = (collection, field) => {
  const value = get(collection, field)
  const iso6393 = franc(value)
  return lang(toIso6391[iso6393])
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
