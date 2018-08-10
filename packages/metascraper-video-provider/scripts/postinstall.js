'use strict'

const jsonFuture = require('json-future')
const cheerio = require('cheerio')
const got = require('got')

;(async () => {
  const { body } = await got('https://rg3.github.io/youtube-dl/supportedsites.html')
  const $ = cheerio.load(body)
  const set = new Set()

  $('li').each(function (i, el) {
    const domain = $(el).text().split(':')[0].toLowerCase()
    set.add(domain)
  })

  await jsonFuture.saveAsync('providers.json', Array.from(set))
})()
