'use strict'

const parseDomain = require('parse-domain')
const jsonFuture = require('json-future')
const youtubedl = require('youtube-dl')
const { promisify } = require('util')

const getExtractors = promisify(youtubedl.getExtractors)

;(async () => {
  const extractors = await getExtractors()

  const providers = extractors.reduce((set, extractor) => {
    const provider = extractor.split(':')[0].toLowerCase()
    const { domain = '' } = parseDomain(provider) || {}
    set.add(domain || provider)
    return set
  }, new Set())

  await jsonFuture.saveAsync('providers.json', Array.from(providers))
})()
