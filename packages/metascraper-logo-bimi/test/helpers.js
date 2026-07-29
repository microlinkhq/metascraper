'use strict'

const LOGO_URL = 'https://cdn.microlink.io/logo/logo.svg'

const RECORD = `v=BIMI1; l=${LOGO_URL};`

const acceptLogoUrl = async logoUrl => logoUrl

const createResolveTxt = records => async hostname => {
  const answers = records[hostname]
  if (answers === undefined) {
    const error = new Error('queryTxt ENODATA')
    error.code = 'ENODATA'
    throw error
  }
  return answers
}

module.exports = {
  LOGO_URL,
  RECORD,
  acceptLogoUrl,
  createResolveTxt
}
