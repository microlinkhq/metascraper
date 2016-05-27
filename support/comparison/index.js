
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const popsicle = require('popsicle')

/**
 * Scrapers.
 */

const SCRAPERS = [
  // {
  //   name: 'html-metadata',
  //   scrape: (Module, url, html) => {
  //     return Module(url)
  //   }
  // },
  {
    name: 'metascraper',
    scrape: (Module, url, html) => {
      return Module.scrapeUrl(url)
    },
    normalize: results => results
  },
  {
    name: 'node-metainspector',
    scrape: (Module, url, html) => {
      return new Promise((resolve, reject) => {
        const client = new Module(url)
        client.on("fetch", () => {
          resolve(client)
        })
        client.on("error", (err) => {
          reject(err)
        })
        client.fetch()
      })
    },
    normalize: (results) => {
      return {
        author: results.author || null,
        date: null,
        description: results.description || null,
        image: results.image || null,
        publisher: results.publisher || null,
        title: results.title || null,
        url: results.url || null,
      }
    }
  },
  // {
  //   name: 'summarizer',
  //   scrape: (Module, url, html) => {
  //     console.log('summarizer', Module.getPage)
  //     return Module.getPage(url)
  //   }
  // },
  {
    name: 'unfluff',
    scrape: (Module, url, html) => {
      const metadata = Module(html)
      return Promise.resolve(metadata)
    },
    normalize: (results) => {
      return {
        author: results.author[0] || null,
        date: results.date || null,
        description: results.description || null,
        image: results.image || null,
        publisher: results.publisher || null,
        title: results.title || null,
        url: results.canonicalLink || null,
      }
    }
  }
]

/**
 * Run.
 */

console.log('Fetching the results for each scraper...')

getResults()
  .catch((err) => {
    console.log('An error occurred:\n\n', err)
  })
  .then((results) => {
    console.log('Success! The results for each scraper have been compiled.')
    results.forEach((result) => {
      const dir = path.resolve(__dirname, 'results')
      const file = path.resolve(dir, `${result.name}.json`)
      const string = JSON.stringify(result.results, null, 2)
      mkdirp.sync(dir)
      fs.writeFileSync(file, string)
    })
  })

/**
 * Get the metadata results.
 *
 * @return {Promise} results
 */

function getResults() {
  const urls = getUrls()
  return getHtmls(urls).then((htmls) => {
    return getScrapersResults(SCRAPERS, urls, htmls).then((results) => {
      return results
    })
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

function getScrapersResults(SCRAPERS, urls, htmls) {
  return Promise.all(SCRAPERS.map((SCRAPER) => {
    return getScraperResults(SCRAPER, urls, htmls).then((results) => {
      return {
        name: SCRAPER.name,
        results: results,
      }
    })
  }))
}

/**
 * Get metadata results from a single `SCRAPER` and `urls` and `htmls`.
 *
 * @param {Object} SCRAPER
 * @param {Array} urls
 * @param {Array} htmls
 * @return {Promise} results
 */

function getScraperResults(SCRAPER, urls, htmls) {
  return Promise.all(urls.map((url, i) => {
    const html = htmls[i]
    const name = SCRAPER.name
    const Module = name == 'metascraper' ? require('../..') : require(name)
    return SCRAPER.scrape(Module, url, html).then((metadata) => {
      return SCRAPER.normalize(metadata)
    })
  }))
}

/**
 * Get html from a list of `urls`.
 *
 * @param {Array} urls
 * @return {Promise} htmls
 */

function getHtmls(urls) {
  return Promise.all(urls.map((url) => {
    return popsicle.get(url).then((res) => {
      return res.body
    })
  }))
}

/**
 * Get the URLs from the test data.
 *
 * @return {Array} urls
 */

function getUrls() {
  const dir = path.resolve(__dirname, '../../test/fixtures/cases')

  const names = fs.readdirSync(dir).filter((name) => {
    return name != 'market-wired'
  })

  const urls = names.map((name) => {
    const file = path.resolve(dir, name, 'output.json')
    const json = require(file)
    return json.url
  })

  return urls.filter(url => !!url)
}
