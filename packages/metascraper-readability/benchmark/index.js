'use strict'

const { readFileSync } = require('fs')

const url = 'https://arxiv.org/pdf/2412.06592'
const html = readFileSync('./fixture.html', 'utf8')

const jsdom = () => {
  const { JSDOM, VirtualConsole } = require('jsdom')
  const dom = new JSDOM(html, { url, virtualConsole: new VirtualConsole() })
  return dom.window.document
}

const happydom = () => {
  const { Window } = require('happy-dom')
  const window = new Window({ url })
  const document = window.document
  document.documentElement.innerHTML = html
  return document
}

const { Readability } = require('@mozilla/readability')

const measure = fn => {
  const now = Date.now()
  const parsed = new Readability(fn()).parse()
  return { parsed, duration: Date.now() - now }
}

const jsdomResult = measure(jsdom)
const happydomResult = measure(happydom)

const isEqual = (value1, value2) =>
  JSON.stringify(value1) === JSON.stringify(value2)

if (!isEqual(jsdomResult.parsed, happydomResult.parsed)) {
  console.error('Results are different')
  process.exit(1)
}

console.log(`   jsdom: ${jsdomResult.duration}ms`)
console.log(`happydom: ${happydomResult.duration}ms`)
