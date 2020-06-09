'use strict'

const { get } = require('lodash')

const REGEX_ERR_MESSAGE = /ERROR: (.*);?/
const REGEX_RATE_LIMIT = /429: Too Many Requests/i
const REGEX_TIME_OUT = /Timed out/i

const isRateLimit = message => REGEX_RATE_LIMIT.test(message)
const isTimeout = message => REGEX_TIME_OUT.test(message)

const getMessage = error => {
  let message

  if (error.originalMessage) {
    message = error.originalMessage
  } else if (error.message) {
    const extractedMessage = get(REGEX_ERR_MESSAGE.exec(error.message), '1')
    if (extractedMessage) message = extractedMessage.split('; ')[0]
  } else {
    message = error
  }

  return message
}

module.exports = ({ rawError, url, flags }) => {
  const message = getMessage(rawError)
  const error = new Error(message)

  error.name = 'youtubedlError'
  error.code = rawError.code
  error.signal = rawError.signal
  error.url = url
  error.flags = flags
  error.unsupportedUrl = !isRateLimit(message) && !isTimeout(message)

  return error
}
