'use strict'

const youtubedl = require('youtube-dl')
const { promisify } = require('util')

module.exports = promisify(youtubedl.getInfo)
