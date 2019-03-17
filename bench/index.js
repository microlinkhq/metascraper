'use strict'

const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const got = require('got')
const fs = require('fs')
const path = require('path')

const SCRAPERS = require('./scrapers')
const URLS = require('./urls')

/**
 * Run.
 */

console.log('Fetching the results for each scraper...')

getResults()
  .then(results => {
    console.log('Removing the old results...')
    const dir = path.resolve(__dirname, 'results')
    rimraf.sync(dir)

    results.forEach(result => {
      const file = path.resolve(dir, `${result.name}.json`)
      const string = JSON.stringify(result.results, null, 2)
      mkdirp.sync(dir)
      fs.writeFileSync(file, string)
    })

    console.log('Success! The results have been compiled for each scraper.')
  })
  .catch(err => {
    console.log('An error occurred:')
    console.log()
    console.log(err)
    console.log()
    console.log(err.stack)
  })

/**
 * Get the metadata results.
 *
 * @return {Promise} results
 */

function getResults () {
  return getHtmls(URLS).then(htmls => {
    return getScrapersResults(SCRAPERS, URLS, htmls).then(results => results)
  })
}

/**
 * Get the metadata results from all `SCRAPERS` and `urls` and `htmls`.
 *
 * @param {Array} SCRAPERS
 * @param {Array} urls
 * @param {Array} htmls
 * @return {Promise} results
 */

function getScrapersResults (SCRAPERS, urls, htmls) {
  return Promise.all(
    SCRAPERS.map(SCRAPER => {
      return getScraperResults(SCRAPER, urls, htmls).then(results => {
        return {
          name: SCRAPER.name,
          results: results
        }
      })
    })
  )
}

/**
 * Get metadata results from a single `SCRAPER` and `urls` and `htmls`.
 *
 * @param {Object} SCRAPER
 * @param {Array} urls
 * @param {Array} htmls
 * @return {Promise} results
 */

function getScraperResults (SCRAPER, urls, htmls) {
  return Promise.all(
    urls.map((url, i) => {
      const html = htmls[i]
      const name = SCRAPER.name
      const Module = require(name)
      return SCRAPER.scrape(Module, url, html).then(metadata => {
        return SCRAPER.normalize(metadata)
      })
    })
  )
}

/**
 * Get html from a list of `urls`.
 *
 * @param {Array} urls
 * @return {Promise} htmls
 */

function getHtmls (urls) {
  return Promise.all(urls.map(url => got(url).then(res => res.body)))
}
