'use strict'

const should = require('should')

const { detectLang } = require('..')

describe('metascraper-lang', () => {
  it('.detectLang', () => {
    should(
      detectLang(
        {
          description:
            'A library to easily scrape metadata from an article on the web using Open Graph metadata, regular HTML metadata, and series of fallbacks.'
        },
        'description'
      )
    ).be.equal('en')
    should(
      detectLang(
        {
          description:
            'Una libreria para obtener fácilmente metadatos de cualquier artículo de internet usando Open Graph, HTML y una serie de fallbacks.'
        },
        'description'
      )
    ).be.equal('es')
    should(detectLang({ description: null }, 'description')).be.equal(false)
  })
})
