'use strict'

const { readFile } = require('fs').promises
const { resolve } = require('path')
const test = require('ava')

const metascraperUol = require('..')

const metascraper = require('metascraper')([metascraperUol()])

test('torcedores.com', async t => {
  const url =
    'https://www.torcedores.com/noticias/2019/06/modelo-diz-motivo-para-continuar-conversa-neymar'
  const html = await readFile(resolve(__dirname, 'fixtures/torcedores.html'))
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})
test('entretenimento.uol.com.br', async t => {
  const url =
    'https://entretenimento.uol.com.br/noticias/redacao/2019/05/27/gabriel-diniz-do-hit-jenifer-se-envolve-em-acidente-de-aviao-em-sergipe.html'
  const html = await readFile(
    resolve(__dirname, 'fixtures/entretenimento.html')
  )
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('folha.uol.com.br', async t => {
  const url = 'https://www.folha.uol.com.br'
  const html = await readFile(resolve(__dirname, 'fixtures/folha.html'))
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})
