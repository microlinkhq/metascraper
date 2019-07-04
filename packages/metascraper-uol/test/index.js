'use strict'

const wordSlug = require('word-slug')
const { promisify } = require('util')
const snapshot = require('snap-shot')
const { resolve } = require('path')
const should = require('should')
const fs = require('fs')

const readFile = promisify(fs.readFile)

const metascraperUol = require('..')

const metascraper = require('metascraper')([metascraperUol()])

const { isValidUrl } = metascraperUol

describe('metascraper-uol', () => {
  describe('.isvalidUrl', function () {
    describe('true', () => {
      ;['http', 'https'].forEach(protocol => {
        ;[
          'esporte.uol.com.br',
          'batepapo.uol.com.br',
          'carros.uol.com.br',
          'economia.uol.com.br',
          'folha.uol.com.br',
          'entretenimento.uol.com.br',
          'tvefamosos.uol.com.br',
          'universa.uol.com.br',
          'vivabem.uol.com.br',
          'educacao.uol.com.br',
          'tv.uol.com.br',
          'torcedores.com'
        ].forEach(domain => {
          const url = `${protocol}://${domain}`
          it(url, async () => {
            should(isValidUrl(`${url}/${wordSlug()}`)).be.true()
          })
        })
      })
    })
    it('false', () => {
      should(isValidUrl('https://youtube.com')).be.false()
      should(isValidUrl('https://microlink.io')).be.false()
      should(isValidUrl('https://kikobeats.com')).be.false()
    })
  })

  describe('rules', function () {
    it('torcedores.com', async () => {
      const url =
        'https://www.torcedores.com/noticias/2019/06/modelo-diz-motivo-para-continuar-conversa-neymar'
      const html = await readFile(
        resolve(__dirname, 'fixtures/torcedores.html')
      )
      const metadata = await metascraper({ html, url })
      snapshot(metadata)
    })
    it('entretenimento.uol.com.br', async () => {
      const url =
        'https://entretenimento.uol.com.br/noticias/redacao/2019/05/27/gabriel-diniz-do-hit-jenifer-se-envolve-em-acidente-de-aviao-em-sergipe.html'
      const html = await readFile(
        resolve(__dirname, 'fixtures/entretenimento.html')
      )
      const metadata = await metascraper({ html, url })
      snapshot(metadata)
    })

    it('folha.uol.com.br', async () => {
      const url = 'https://www.folha.uol.com.br'
      const html = await readFile(resolve(__dirname, 'fixtures/folha.html'))
      const metadata = await metascraper({ html, url })
      snapshot(metadata)
    })
  })
})
