'use strict'

const { memoizeOne, composeRule } = require('@metascraper/helpers')
const asyncMemoizeOne = require('async-memoize-one')
const { Window } = require('happy-dom')

const debug = require('debug-logfmt')('metascraper-defuddle')

const DOCUMENT_SETTINGS = {
  disableComputedStyleRendering: true,
  disableCSSFileLoading: true,
  disableIframePageLoading: true,
  disableJavaScriptEvaluation: true,
  disableJavaScriptFileLoading: true
}

const defuddleExtract = asyncMemoizeOne(async (url, html) => {
  const { Defuddle } = await import('defuddle/node')
  const window = new Window({ url, settings: DOCUMENT_SETTINGS })
  window.document.documentElement.innerHTML = html
  try {
    const result = await Defuddle(window.document, url, { useAsync: false })
    return result
  } catch (err) {
    debug('Defuddle failed, fallback to next rule', { message: err.message })
    return undefined
  } finally {
    await window.happyDOM.close()
  }
}, memoizeOne.EqualityFirstArgument)

const htmlCache = new WeakMap()

const getHtml = htmlDom => {
  if (!htmlCache.has(htmlDom)) {
    htmlCache.set(htmlDom, htmlDom.html())
  }
  return htmlCache.get(htmlDom)
}

module.exports = () => {
  const getDefuddle = composeRule(($, url) => defuddleExtract(url, getHtml($)))

  const rules = {
    author: getDefuddle({ from: 'author' }),
    description: getDefuddle({ from: 'description' }),
    date: getDefuddle({ from: 'published', to: 'date' }),
    lang: getDefuddle({ from: 'language', to: 'lang' }),
    publisher: getDefuddle({ from: 'site', to: 'publisher' }),
    title: getDefuddle({ from: 'title' })
  }

  rules.pkgName = 'metascraper-defuddle'

  return rules
}

module.exports.defuddleExtract = defuddleExtract
