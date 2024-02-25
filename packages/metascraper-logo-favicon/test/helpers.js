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
  const url = await listen(server, opts)
  t.teardown(() => closeServer(server))
  return url
}

module.exports = { runServer }
