/**
 * Scrapers.
 */

module.exports = [
  /**
   * HTML Metadata.
   */

  {
    name: 'html-metadata',

    scrape (Module, url, html) {
      return Module(url)
    },

    normalize (results) {
      return {
        author: (results.general && results.general.author) || null,
        date: (results.openGraph && results.openGraph.published_time) || null,
        description:
          (results.openGraph && results.openGraph.description) ||
          (results.general && results.general.description) ||
          null,
        image:
          (results.openGraph &&
            results.openGraph.image &&
            results.openGraph.image.url) ||
          (results.schemaOrg &&
            results.schemaOrg.items[0].properties &&
            results.schemaOrg.items[0].properties.image[0] &&
            results.schemaOrg.items[0].properties.image[0].properties.url &&
            results.schemaOrg.items[0].properties.image[0].properties.url[0]) ||
          null,
        publisher: (results.openGraph && results.openGraph.site_name) || null,
        title:
          (results.openGraph && results.openGraph.title) ||
          (results.general && results.general.title) ||
          null,
        url:
          (results.openGraph && results.openGraph.url) ||
          (results.schemaOrg && results.schemaOrg.items[0].properties.url[0]) ||
          null
      }
    }
  },

  /**
   * Metascraper.
   */

  {
    name: 'metascraper',

    scrape (Module, url, html) {
      return Module({ html, url })
    },

    normalize (results) {
      return results
    }
  },

  /**
   * Metainspector.
   */

  {
    name: 'node-metainspector',

    scrape (Module, url, html) {
      return new Promise((resolve, reject) => {
        const client = new Module(url)
        client.on('fetch', () => {
          resolve(client)
        })
        client.on('error', err => {
          if (err) reject(err)
        })
        client.fetch()
      })
    },

    normalize (results) {
      return {
        author: results.author || null,
        date: results.ogPublishedTime || null,
        description: results.ogDescription || results.description || null,
        image: results.ogImage || results.image || results.images[0] || null,
        publisher: results.ogSiteName || results.publisher || null,
        title: results.ogTitle || results.title || null,
        url: results.ogUrl || results.url || null
      }
    }
  },

  /**
   * Open Graph Scraper.
   */

  {
    name: 'open-graph-scraper',

    scrape (Module, url, html) {
      return new Promise((resolve, reject) => {
        Module({ url }, (err, metadata) => {
          if (err) return reject(err)
          resolve(metadata)
        })
      })
    },

    normalize (results) {
      return {
        author: (results.success && results.data.twitterCreator) || null,
        date: (results.success && results.data.ogPublishedTime) || null,
        description:
          (results.success && results.data.ogDescription) ||
          (results.success && results.data.twitterDescription) ||
          null,
        image:
          (results.success &&
            results.data.ogImage &&
            results.data.ogImage.url) ||
          (results.success &&
            results.data.twitterImage &&
            results.data.twitterImage.url) ||
          null,
        publisher:
          (results.success && results.data.ogSiteName) ||
          (results.success && results.data.twitterSite) ||
          null,
        title:
          (results.success && results.data.ogTitle) ||
          (results.success && results.data.twitterTitle) ||
          null,
        url: (results.success && results.data.ogUrl) || null
      }
    }
  },

  /**
   * Unfluff.
   */

  {
    name: 'unfluff',

    scrape (Module, url, html) {
      const metadata = Module(html)
      return Promise.resolve(metadata)
    },

    normalize (results) {
      return {
        author: results.author[0] || null,
        date: results.date || null,
        description: results.description || null,
        image: results.image || null,
        publisher: results.publisher || null,
        title: results.softTitle || results.title || null,
        url: results.canonicalLink || null
      }
    }
  }
]
