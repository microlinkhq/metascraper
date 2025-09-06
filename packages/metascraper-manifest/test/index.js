'use strict'

const test = require('ava')

const createMetascraper = (...args) =>
  require('metascraper')([require('..')(...args)])

const createHtml = meta =>
  `<!DOCTYPE html>
<html lang="en">
<head>${meta.join('/n')}</head>
<body></body>
</html>`.trim()

test('provide `keyvOpts`', async t => {
  const cache = new Map()
  const url = 'https://test-webmanifest.vercel.app'
  const metascraper = createMetascraper({
    gotOpts: { retry: 0 },
    keyvOpts: { store: cache }
  })

  const metadataOne = await metascraper({
    url,
    html: createHtml(['<link rel="manifest" href="/" importance="low">'])
  })

  t.truthy(cache.get(`${url}/`))
  t.truthy(metadataOne.logo)
  t.is(cache.size, 1)

  const metadataTwo = await metascraper({
    url: 'https://lolwerhere.com',
    html: createHtml(['<link rel="manifest" href="/" importance="low">'])
  })

  t.falsy(metadataTwo.logo)
  t.is(cache.size, 2)
})

test('does nothing if manifest URL is not reachable', async t => {
  const metascraper = createMetascraper()
  const url = 'https://www.linkedin.com/company/audiense/'
  const html = createHtml([
    '<link rel="manifest" href="https://static-exp1.licdn.com/sc/h/8ekldmhv4d8prk5sml735t6np">'
  ])
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('does nothing if icons field at manifest is not present', async t => {
  const metascraper = createMetascraper()
  const url = 'https://www.linkedin.com/company/audiense/'
  const html = createHtml([
    '<link rel="manifest" href="https://test-webmanifest.vercel.app?icons=false&name=Lumeris&short_name=Lumeris">'
  ])
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from data uri', async t => {
  const metascraper = createMetascraper()
  const url = 'https://krafla-landing-g19o4bcij-trence.vercel.app/'
  const html = createHtml([
    '<link rel="manifest" href="data:application/json;base64,ewogIm5hbWUiOiAiQXBwIiwKICJpY29ucyI6IFsKICB7CiAgICJzcmMiOiAiXC9pY29uXC9hbmRyb2lkLWljb24tMzZ4MzYucG5nIiwKICAgInNpemVzIjogIjM2eDM2IiwKICAgInR5cGUiOiAiaW1hZ2VcL3BuZyIsCiAgICJkZW5zaXR5IjogIjAuNzUiCiAgfSwKICB7CiAgICJzcmMiOiAiXC9pY29uXC9hbmRyb2lkLWljb24tNDh4NDgucG5nIiwKICAgInNpemVzIjogIjQ4eDQ4IiwKICAgInR5cGUiOiAiaW1hZ2VcL3BuZyIsCiAgICJkZW5zaXR5IjogIjEuMCIKICB9LAogIHsKICAgInNyYyI6ICJcL2ljb25cL2FuZHJvaWQtaWNvbi03Mng3Mi5wbmciLAogICAic2l6ZXMiOiAiNzJ4NzIiLAogICAidHlwZSI6ICJpbWFnZVwvcG5nIiwKICAgImRlbnNpdHkiOiAiMS41IgogIH0sCiAgewogICAic3JjIjogIlwvaWNvblwvYW5kcm9pZC1pY29uLTk2eDk2LnBuZyIsCiAgICJzaXplcyI6ICI5Nng5NiIsCiAgICJ0eXBlIjogImltYWdlXC9wbmciLAogICAiZGVuc2l0eSI6ICIyLjAiCiAgfSwKICB7CiAgICJzcmMiOiAiXC9pY29uXC9hbmRyb2lkLWljb24tMTQ0eDE0NC5wbmciLAogICAic2l6ZXMiOiAiMTQ0eDE0NCIsCiAgICJ0eXBlIjogImltYWdlXC9wbmciLAogICAiZGVuc2l0eSI6ICIzLjAiCiAgfSwKICB7CiAgICJzcmMiOiAiXC9pY29uXC9hbmRyb2lkLWljb24tMTkyeDE5Mi5wbmciLAogICAic2l6ZXMiOiAiMTkyeDE5MiIsCiAgICJ0eXBlIjogImltYWdlXC9wbmciLAogICAiZGVuc2l0eSI6ICI0LjAiCiAgfQogXQp9">'
  ])
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('does nothing if data uri is malformed', async t => {
  const metascraper = createMetascraper()
  const url = 'https://krafla-landing-g19o4bcij-trence.vercel.app/'
  const html = createHtml([
    '<link rel="manifest" href="data:application/json;base64,ewogIm5hbWUiOi">'
  ])
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('vercel.com', async t => {
  const metascraper = createMetascraper()
  const url = 'https://vercel.com'
  const html = createHtml([
    '<link rel="manifest" href="/site.webmanifest" importance="low">'
  ])
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('linkedin.com', async t => {
  const metascraper = createMetascraper()
  const url = 'https://linkedin.com/Kikobeats/'
  const html = createHtml(['<link rel="manifest" href="/manifest.json">'])
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('medium.com', async t => {
  const metascraper = createMetascraper()
  const url =
    'https://medium.com/in-fitness-and-in-health/20-hard-won-fitness-lessons-from-my-20-year-fitness-journey-9971a8a8f0e1'
  const html = createHtml(['<link rel="manifest" href="/manifest.json">'])
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('github.com', async t => {
  const metascraper = createMetascraper()
  const url = 'https://github.com/Kikobeats/'
  const html = createHtml(['<link rel="manifest" href="/manifest.json">'])
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('youtube.com', async t => {
  const metascraper = createMetascraper()
  const url = 'https://www.youtube.com/feed/explore'
  const html = createHtml([
    '<link rel="manifest" href="/manifest.webmanifest" crossorigin="use-credentials">'
  ])
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})
