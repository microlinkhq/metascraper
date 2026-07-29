'use strict'

const { createGetLogo } = require('..')

const LOGO_URL = 'https://cdn.microlink.io/logo/logo.svg'

const RECORD = `v=BIMI1; l=${LOGO_URL};`

const acceptLogoUrl = async logoUrl => logoUrl

const createGetLogoFrom = (resolveTxt, options) =>
  createGetLogo({ resolveLogoUrl: acceptLogoUrl, resolveTxt, ...options })

const dnsError = code => {
  const error = new Error(`queryTxt ${code}`)
  error.code = code
  return error
}

const createResolveTxt = records => async hostname => {
  const answers = records[hostname]
  if (answers === undefined) throw dnsError('ENODATA')
  return answers
}

const countCalls = resolveTxt => {
  const counted = hostname => {
    counted.calls++
    return resolveTxt(hostname)
  }
  counted.calls = 0
  return counted
}

module.exports = {
  LOGO_URL,
  RECORD,
  acceptLogoUrl,
  countCalls,
  createGetLogoFrom,
  createResolveTxt,
  dnsError
}
