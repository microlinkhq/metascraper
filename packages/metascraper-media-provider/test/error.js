'use strict'

const should = require('should')

const youtubedlError = require('../src/get-media/provider/youtube-dl-error')

const execYoutubedl = url =>
  [
    './node_modules/youtube-dl/bin/youtube-dl',
    '--dump-json',
    '-f best',
    '--no-warnings',
    '--no-check-certificate',
    '--prefer-free-formats',
    '--youtube-skip-dash-manifest'
  ].join(' ') + ` ${url}`

describe('youtubedlError', function () {
  it('unsupported url', async () => {
    const url = 'https://dwpfilmsubmit.com/'
    const err = youtubedlError({
      flags: ['--foo', '--bar'],
      url,
      rawError: {
        message: `Command failed: ${execYoutubedl(
          url
        )}\nERROR: Unsupported URL: ${url}`
      }
    })

    should(err.name).be.equal('youtubedlError')
    should(err.message).be.equal(`Unsupported URL: ${url}`)
    should(err.url).be.equal(url)
    should(err.unsupportedUrl).be.true()
  })

  it('Unable to extract video url', async () => {
    const url = 'https://www.instagram.com/p/B3kCIDGAbaD/'
    const err = youtubedlError({
      flags: ['--foo', '--bar'],
      url,
      rawError: {
        message: `Command failed: ${execYoutubedl(
          url
        )}\nERROR: Unable to extract video url; please report this issue on https://yt-dl.org/bug . Make sure you are using the latest version; type  youtube-dl -U  to update. Be sure to call youtube-dl with the --verbose flag and include its complete output.`
      }
    })

    should(err.name).be.equal('youtubedlError')
    should(err.url).be.equal(url)
    should(err.message).be.equal('Unable to extract video url')
  })
})
