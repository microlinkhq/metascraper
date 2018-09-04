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

module.exports = ({ fields = ['description'] } = {}) => {
  const rules = reduce(
    fields,
    (acc, key) => {
      const fn = ({ meta }) => detectLang(meta, key)
      return [...acc, fn]
    },
    []
  )

  return { lang: rules }
}

module.exports.detectLang = detectLang
