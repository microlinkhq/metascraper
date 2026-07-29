'use strict'

const { default: listen } = require('async-listen')
const { createServer } = require('http')

const closeServer = server =>
  require('util').promisify(server.close.bind(server))()

const runServer = async (t, handler, opts) => {
  const server = createServer(async (req, res) => {
    try {
      await handler({ req, res })
    } catch (error) {
      console.error(error)
      res.statusCode = 500
      res.end()
    }
  })
  const url = await listen(server, { port: 0, host: '127.0.0.1', ...opts })
  t.teardown(() => closeServer(server))
  return url.toString()
}

const LOGO_URL = 'https://cdn.microlink.io/logo/logo.svg'

const RECORD = `v=BIMI1; l=${LOGO_URL};`

const acceptLogoUrl = async logoUrl => logoUrl

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
  createResolveTxt,
  dnsError,
  runServer
}
