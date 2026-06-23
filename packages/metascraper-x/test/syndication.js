'use strict'

const { readFileSync } = require('fs')
const { resolve } = require('path')
const test = require('ava').default

const { parseTweetId, getToken, buildHtml, getEmbed } = require('metascraper-x')

const createMetascraper = () =>
  require('metascraper')([
    require('metascraper-x')(),
    require('metascraper-author')(),
    require('metascraper-date')(),
    require('metascraper-image')(),
    require('metascraper-description')(),
    require('metascraper-publisher')(),
    require('metascraper-title')()
  ])

const fixture = name =>
  JSON.parse(
    readFileSync(
      resolve(__dirname, 'fixtures/syndication', `${name}.json`),
      'utf8'
    )
  )

test('parseTweetId extracts the status id from X post URLs', t => {
  const cases = {
    'https://x.com/jack/status/20': '20',
    'https://twitter.com/jack/status/20': '20',
    'https://mobile.x.com/jack/status/20': '20',
    'https://x.com/jack/statuses/20': '20',
    'https://x.com/i/status/20': '20',
    'https://x.com/i/web/status/20': '20',
    'https://x.com/eliana_jordan/article/2064997219648913457':
      '2064997219648913457',
    'https://x.com/i/article/2064997219648913457': '2064997219648913457',
    'https://x.com/jack/status/20?s=21&t=abc': '20'
  }
  for (const [url, id] of Object.entries(cases)) {
    t.is(parseTweetId(url), id, url)
  }
})

test('parseTweetId returns undefined for non-post URLs', t => {
  const cases = [
    'https://x.com/jack',
    'https://x.com/jack/with_replies',
    'https://x.com/home',
    'https://example.com/jack/status/20',
    'https://x.com/i/lists/123',
    'not a url'
  ]
  for (const url of cases) t.is(parseTweetId(url), undefined, url)
})

test('getToken derives the deterministic syndication token', t => {
  // Matches react-tweet's algorithm: ((id / 1e15) * Math.PI).toString(36)
  t.is(getToken('20'), '6dq1a2xwd93')
  t.is(typeof getToken('2064997219648913457'), 'string')
})

test('buildHtml: text-only tweet → metadata via the X rules', async t => {
  const url = 'https://x.com/jack/status/20'
  const metadata = await createMetascraper()({
    html: buildHtml(fixture('tweet-text'), url),
    url
  })
  t.is(metadata.title, 'jack (@jack) on X')
  t.is(metadata.author, 'jack')
  t.is(metadata.publisher, 'X')
  t.is(metadata.description, 'just setting up my twttr')
  t.is(metadata.date, '2006-03-21T20:50:14.000Z')
})

test('buildHtml: photo tweet exposes the image and strips the media t.co link', async t => {
  const url = 'https://x.com/BarackObama/status/266031293945503744'
  const html = buildHtml(fixture('tweet-photo'), url)
  const metadata = await createMetascraper()({ html, url })
  t.is(metadata.title, 'Barack Obama (@BarackObama) on X')
  t.is(metadata.author, 'Barack Obama')
  t.is(metadata.image, 'https://pbs.twimg.com/media/A7EiDWcCYAAZT1D.jpg')
  // the inline photo t.co link must not leak into the body text
  t.false(html.includes('>Four more years. http'))
})

test('buildHtml: article → display-name title, headline preserved in body', async t => {
  const url = 'https://x.com/eliana_jordan/article/2064997219648913457'
  const html = buildHtml(fixture('article'), url)
  const headline =
    'My Instagram was dead for a year. One weekend changed that. 100K views, 500+ followers, 300+ users'

  const metadata = await createMetascraper()({ html, url })
  // the X rules title posts as "{author} (@handle) on X"; the article headline
  // lives in the body so a downstream markdown render keeps it.
  t.is(metadata.title, 'Eliana (@eliana_jordan) on X')
  t.is(metadata.author, 'Eliana')
  t.is(metadata.image, 'https://pbs.twimg.com/media/HKe-43fX0AAfDI_.jpg')
  t.true(html.includes(`<strong>${headline}</strong>`))
})

test('buildHtml: expands url entities and renders quoted tweets', t => {
  const url = 'https://x.com/someone/status/123'
  const html = buildHtml(
    {
      text: 'check this out https://t.co/abc',
      entities: {
        urls: [
          { url: 'https://t.co/abc', expanded_url: 'https://example.com/post' }
        ]
      },
      user: { name: 'Someone', screen_name: 'someone' },
      quoted_tweet: {
        text: 'original thought',
        user: { name: 'Author', screen_name: 'author' }
      }
    },
    url
  )
  t.true(html.includes('https://example.com/post'))
  t.false(html.includes('t.co/abc'))
  t.true(html.includes('original thought'))
  t.true(html.includes('<blockquote>'))
})

test('buildHtml escapes HTML special characters in tweet text', t => {
  const html = buildHtml(
    {
      text: '<script>alert(1)</script> & "quotes"',
      user: { name: 'Someone', screen_name: 'someone' }
    },
    'https://x.com/someone/status/123'
  )
  t.false(html.includes('<script>alert(1)</script>'))
  t.true(html.includes('&lt;script&gt;'))
})

test('getEmbed: returns HTML built from an injected syndication response', async t => {
  const url = 'https://x.com/jack/status/20'
  const tweet = fixture('tweet-text')
  const fetch = async () => ({ ok: true, json: async () => tweet })

  const embed = await getEmbed(url, { fetch })
  t.is(embed.tweet.__typename, 'Tweet')
  t.true(embed.html.includes('just setting up my twttr'))
})

test('getEmbed: returns undefined for non-post URLs without fetching', async t => {
  let called = false
  const fetch = async () => {
    called = true
    return { ok: true, json: async () => ({}) }
  }
  t.is(await getEmbed('https://x.com/jack', { fetch }), undefined)
  t.false(called)
})

test('getEmbed: returns undefined when the post is not a public Tweet', async t => {
  const url = 'https://x.com/jack/status/20'
  const fetch = async () => ({
    ok: true,
    json: async () => ({ __typename: 'TweetTombstone' })
  })
  t.is(await getEmbed(url, { fetch }), undefined)
})

test('getEmbed: returns undefined on a non-ok response', async t => {
  const url = 'https://x.com/jack/status/20'
  const fetch = async () => ({ ok: false, json: async () => ({}) })
  t.is(await getEmbed(url, { fetch }), undefined)
})

test('getEmbed: returns undefined (not throws) when fetch rejects', async t => {
  const url = 'https://x.com/jack/status/20'
  const fetch = async () => {
    throw new Error('network down')
  }
  t.is(await getEmbed(url, { fetch }), undefined)
})

test('getEmbed: returns undefined (not throws) on invalid JSON', async t => {
  const url = 'https://x.com/jack/status/20'
  const fetch = async () => ({
    ok: true,
    json: async () => {
      throw new SyntaxError('Unexpected token')
    }
  })
  t.is(await getEmbed(url, { fetch }), undefined)
})

test('i-path URL keeps the real @handle in the title', async t => {
  // first path segment is `i`, not the screen_name
  const url = 'https://x.com/i/article/2064997219648913457'
  const html = buildHtml(fixture('article'), url)
  const metadata = await createMetascraper()({ html, url })
  t.is(metadata.title, 'Eliana (@eliana_jordan) on X')
  t.is(metadata.url, 'https://x.com/eliana_jordan/article/2064997219648913457')
})
