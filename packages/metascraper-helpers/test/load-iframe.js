'use strict'

const cheerio = require('cheerio')
const { spawn } = require('child_process')
const path = require('path')
const test = require('ava')

const { loadIframe } = require('..')

test('timeout support', async t => {
  const url =
    'https://accounts.google.com/gsi/iframe/select?client_id=1005640118348-amh5tgkq641oru4fbhr3psm3gt2tcc94.apps.googleusercontent.com&ux_mode=popup&ui_mode=card&as=GAUOzT7W7w8RiyH1fhs9TQ&channel_id=c8d85ad52a58747f6547a90cd4bb19047262e93029f574d126cf2095a7a80f9b&origin=https%3A%2F%2Fwww.nytimes.com'
  const $ = cheerio.load(`<iframe src="${url}"></iframe>`)

  const $iframe = await loadIframe(url, $)
  t.is($iframe.html(), '<html><head></head><body></body></html>')
})

test('wait `load` event', async t => {
  const url =
    'https://wbez-rss.streamguys1.com/player/player21011316001810372.html'
  const $ = cheerio.load(`<iframe src="${url}"></iframe>`)

  const $iframe = await loadIframe(url, $)
  t.true($iframe.html().includes('twitter:player'))
})

const normalizeTransistorAssetUrls = html =>
  html.replace(
    /(https:\/\/assets\.transistor\.fm\/assets\/[a-z-]+)-[a-f0-9]{64}(\.[a-z]+)/g,
    '$1-[cache-busting-hash]$2'
  )

test('markup is correct', async t => {
  const url =
    'https://saas.transistor.fm/episodes/paul-jarvis-gaining-freedom-by-building-an-indie-business'
  const src = 'https://share.transistor.fm/e/e83b42d0'
  const $ = await loadIframe(
    url,
    cheerio.load(`<iframe src="${src}"></iframe>`)
  )
  t.snapshot(normalizeTransistorAssetUrls($.html()))
})

test('worker does not keep process alive after resolving', async t => {
  const script = `
    const cheerio = require('cheerio')
    const { loadIframe } = require('./src')
    ;(async () => {
      const src = 'data:text/html,<html><body><script>setInterval(() => {}, 1000)<\\\\/script></body></html>'
      const $ = cheerio.load(\`<iframe src="\${src}"></iframe>\`)
      await loadIframe('https://example.com', $, { timeout: 200 })
    })().catch(error => {
      console.error(error)
      process.exit(1)
    })
  `

  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['-e', script], {
      cwd: path.resolve(__dirname, '..'),
      stdio: ['ignore', 'ignore', 'pipe']
    })

    let stderr = ''
    child.stderr.on('data', chunk => {
      stderr += String(chunk)
    })

    const timeoutId = setTimeout(() => {
      child.kill('SIGKILL')
      reject(
        new Error('Child process did not exit in time after loadIframe resolve')
      )
    }, 3000)

    child.once('exit', code => {
      clearTimeout(timeoutId)
      if (code === 0) return resolve()
      reject(new Error(`Child process failed with code ${code}: ${stderr}`))
    })
  })

  t.pass()
})

test('serializes html once for the same htmlDom across calls', async t => {
  const src = 'data:text/html,<html><body>ok</body></html>'
  const $ = cheerio.load(`<iframe src="${src}"></iframe>`)
  const originalHtml = $.html.bind($)
  let htmlCalls = 0

  $.html = (...args) => {
    if (args.length === 0) htmlCalls += 1
    return originalHtml(...args)
  }

  await loadIframe('https://example.com', $, { timeout: 200 })
  await loadIframe('https://example.com', $, { timeout: 200 })

  t.is(htmlCalls, 1)
})
