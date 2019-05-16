'use strict'

const should = require('should')

const { makeError } = require('../src/get-media/provider/generic')

describe('makeError', function () {
  it('unsupported url', async () => {
    const err = makeError({
      flags: ['--foo', '--bar'],
      url: 'https://dwpfilmsubmit.com/',
      rawError: {
        message:
          'Command failed: /Users/josefranciscoverdugambin/Projects/microlink/microlink-api/node_modules/@microlink/youtube-dl/bin/youtube-dl --dump-json -f best --no-warnings --no-check-certificate --prefer-free-formats --youtube-skip-dash-manifest --cache-dir=/Users/josefranciscoverdugambin/Projects/microlink/microlink-api/node_modules/.cache/microlink-api --user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36 --referer=https://dwpfilmsubmit.com/ -- https://dwpfilmsubmit.com/\nERROR: Unsupported URL: https://dwpfilmsubmit.com/'
      }
    })

    should(err.name).be.equal('youtubedlError')
    should(err.message).be.equal('Unsupported URL: https://dwpfilmsubmit.com/')
    should(err.url).be.equal('https://dwpfilmsubmit.com/')
  })

  it('unable to download JSON', async () => {
    const err = makeError({
      flags: ['--foo', '--bar'],
      url: 'https://www.instagram.com/antarescerrodelasrosas/',
      rawError: {
        message:
          "Command failed: /var/task/node_modules/@microlink/youtube-dl/bin/youtube-dl --dump-json -f best --no-warnings --no-check-certificate --prefer-free-formats --youtube-skip-dash-manifest --cache-dir=/tmp --user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36 --referer=https://www.instagram.com/antarescerrodelasrosas/ -- https://www.instagram.com/antarescerrodelasrosas/\nERROR: Unable to download JSON metadata: <urlopen error [Errno 97] Address family not supported by protocol> (caused by URLError(error(97, 'Address family not supported by protocol'),))"
      }
    })

    should(err.name).be.equal('youtubedlError')
    should(err.url).be.equal('https://www.instagram.com/antarescerrodelasrosas/')
    should(err.message).be.equal(
      "Unable to download JSON metadata: <urlopen error [Errno 97] Address family not supported by protocol> (caused by URLError(error(97, 'Address family not supported by protocol'),))"
    )
  })

  it('unable to download webpage', async () => {
    const err = makeError({
      flags: ['--foo', '--bar'],
      url: 'https://www.instagram.com/antarescerrodelasrosas/',
      rawError: {
        message:
          "Command failed: /var/task/node_modules/@microlink/youtube-dl/bin/youtube-dl --dump-json -f best --no-warnings --no-check-certificate --prefer-free-formats --youtube-skip-dash-manifest --cache-dir=/tmp --user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36 --referer=https://twitter.com/NBA/status/1027989205924884480 --proxy=https://lum-customer-hl_603f60a5-zone-twittervideo2-ip-67.207.172.253:o55lvwtn4cia@zproxy.lum-superproxy.io:22225 -- https://twitter.com/NBA/status/1027989205924884480\nERROR: Unable to download webpage: <urlopen error [Errno 1] Operation not permitted> (caused by URLError(error(1, 'Operation not permitted'),))"
      }
    })

    should(err.name).be.equal('youtubedlError')
    should(err.url).be.equal('https://www.instagram.com/antarescerrodelasrosas/')
    should(err.message).be.equal(
      "Unable to download webpage: <urlopen error [Errno 1] Operation not permitted> (caused by URLError(error(1, 'Operation not permitted'),))"
    )
  })

  it('429 rate limit', async () => {
    const err = makeError({
      flags: ['--foo', '--bar'],
      url: 'https://www.instagram.com/antarescerrodelasrosas/',
      rawError: {
        message:
          'Command failed: /var/task/node_modules/@microlink/youtube-dl/bin/youtube-dl --dump-json -f best --no-warnings --no-check-certificate --prefer-free-formats --youtube-skip-dash-manifest --cache-dir=/tmp --user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36 --referer=https://twitter.com/NBA/status/1027989205924884480 -- https://twitter.com/NBA/status/1027989205924884480\nERROR: Unable to download JSON metadata: HTTP Error 429: Too Many Requests (caused by HTTPError()); please report this issue on https://yt-dl.org/bug . Make sure you are using the latest version; type  youtube-dl -U  to update. Be sure to call youtube-dl with the --verbose flag and include its complete output.'
      }
    })

    should(err.name).be.equal('youtubedlError')
    should(err.url).be.equal('https://www.instagram.com/antarescerrodelasrosas/')
    should(err.message).be.equal(
      'Unable to download JSON metadata: HTTP Error 429: Too Many Requests (caused by HTTPError())'
    )
  })
})
