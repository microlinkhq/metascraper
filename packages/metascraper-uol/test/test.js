'use strict'

const wordSlug = require('word-slug')
const test = require('ava')

const { test: validator } = require('..')

test('true', t => {
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
      t.true(validator(`${url}/${wordSlug()}`))
    })
  })
})

test('false', t => {
  t.false(validator({ url: 'https://youtube.com' }))
  t.false(validator({ url: 'https://microlink.io' }))
  t.false(validator({ url: 'https://kikobeats.com' }))
})
