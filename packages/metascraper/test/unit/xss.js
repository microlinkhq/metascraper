'use strict'

const metascraper = require('metascraper')([require('metascraper-title')()])
const snapshot = require('snap-shot')

const html = `
<!doctype html>
<html xmlns:og="http://ogp.me/ns#" lang="en">

<head>
    <meta charset="utf8">
    <title>metascraper</title>
    <meta property="og:description" content="The HR startups go to war.">
    <meta property="og:image" content="image">
    <meta property="og:title" content="<script src='http://127.0.0.1:8080/malware.js'></script>">
    <meta property="og:type" content="article">
    <meta property="og:url" content="http://127.0.0.1:8080">
</head>

<body>
</body>
</html>
`

describe('xss', () => {
  it('explicitily disable escape', async () => {
    const metadata = await metascraper({
      html: html,
      url: 'http://127.0.0.1:8080',
      escape: false
    })

    snapshot(metadata)
  })

  it('escape when the value is not empty', async () => {
    const metadata = await metascraper({
      html: html,
      url: 'http://127.0.0.1:8080',
      escape: true
    })

    snapshot(metadata)
  })
})
