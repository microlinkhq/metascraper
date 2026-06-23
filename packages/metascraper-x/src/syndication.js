'use strict'

// X (Twitter) serves an empty JS shell — and frequently a login wall — to any
// non-authenticated client, so a plain fetch or browser render of a status or
// article URL yields no extractable content. The public syndication endpoint
// (the same one powering embedded tweets) returns the post as structured JSON
// without authentication. We turn that JSON into a clean semantic HTML document
// so a regular metascraper + content pipeline produces metadata and markdown.
//
// Note: X Articles only expose their `preview_text` through syndication; the
// full body stays behind login, so articles yield the title plus the preview.

const SYNDICATION_ENDPOINT = 'https://cdn.syndication.twimg.com/tweet-result'

// The status id is the last numeric path segment of a tweet/article URL:
//   /<user>/status/<id>, /<user>/article/<id>, /i/status/<id>, /i/web/status/<id>
const X_STATUS_RE =
  /^\/(?:[^/]+\/(?:status|statuses|article)|i\/(?:status|web\/status|article))\/(\d+)/

const X_HOSTS = new Set([
  'x.com',
  'twitter.com',
  'mobile.x.com',
  'mobile.twitter.com'
])

const parseTweetId = url => {
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return undefined
  }
  const host = parsed.hostname.replace(/^www\./, '')
  if (!X_HOSTS.has(host)) return undefined
  const match = parsed.pathname.match(X_STATUS_RE)
  return match ? match[1] : undefined
}

// Deterministic syndication token derived from the id, matching react-tweet.
const getToken = id =>
  ((Number(id) / 1e15) * Math.PI).toString(6 ** 2).replace(/(0+|\.)/g, '')

const escapeHtml = value =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// Expand t.co links to their destination and drop the ones that are just the
// inline media (rendered separately as <img>).
const expandText = tweet => {
  let text = tweet.text || ''
  const entities = tweet.entities || {}
  for (const media of entities.media || []) {
    text = text.split(media.url).join('')
  }
  for (const url of entities.urls || []) {
    text = text.split(url.url).join(url.expanded_url || url.url)
  }
  return text.trim()
}

const textToHtml = text =>
  String(text || '')
    .split(/\n{2,}/)
    .map(block => escapeHtml(block.trim()).replace(/\n/g, '<br>\n'))
    .filter(Boolean)
    .map(block => `<p>${block}</p>`)
    .join('\n')

const collectImages = tweet => {
  const images = []
  for (const media of tweet.mediaDetails || []) {
    if (
      media.type === 'photo' ||
      media.type === 'video' ||
      media.type === 'animated_gif'
    ) {
      images.push({ url: media.media_url_https, alt: media.ext_alt_text || '' })
    }
  }
  if (images.length === 0) {
    for (const photo of tweet.photos || []) {
      images.push({ url: photo.url, alt: '' })
    }
  }
  return images.filter(image => image.url)
}

const renderImages = tweet =>
  collectImages(tweet)
    .map(
      image =>
        `<p><img src="${escapeHtml(image.url)}" alt="${escapeHtml(
          image.alt
        )}"></p>`
    )
    .join('\n')

const renderQuoted = quoted => {
  if (!quoted) return ''
  const user = quoted.user || {}
  const byline = user.name
    ? `<p><strong>${escapeHtml(user.name)}</strong> (@${escapeHtml(
      user.screen_name
    )})</p>\n`
    : ''
  const body = [textToHtml(expandText(quoted)), renderImages(quoted)]
    .filter(Boolean)
    .join('\n')
  return `<blockquote>\n${byline}${body}\n</blockquote>`
}

// Build a clean HTML document from a syndication payload. The emitted og:title
// carries the display name (not the post text or article headline) because the
// metascraper-x rules derive both the author and the "{name} (@handle) on X"
// title from it.
const buildHtml = (tweet, url) => {
  const user = tweet.user || {}
  const authorName = user.name || user.screen_name || 'X'
  const article = tweet.article

  const ogTitle = authorName

  // Rebuild the canonical URL with the real screen_name so /i/status, /i/article
  // and /i/web/status URLs (whose first path segment is `i`) don't yield a
  // "{name} (@i) on X" title downstream.
  const id = tweet.id_str || parseTweetId(url)
  const canonical =
    user.screen_name && id
      ? `https://x.com/${user.screen_name}/${
        article ? 'article' : 'status'
      }/${id}`
      : url

  let pageTitle
  let description
  let image
  let body

  if (article) {
    pageTitle = article.title || authorName
    description = article.preview_text || ''
    image = article.cover_media?.media_info?.original_img_url
    // Defuddle treats a leading heading as the document title and strips it from
    // the body, so the headline would vanish from the markdown. Emitting it as
    // emphasized text keeps it as a bold lead line in the content.
    body = [
      article.title
        ? `<p><strong>${escapeHtml(article.title)}</strong></p>`
        : '',
      textToHtml(article.preview_text)
    ]
      .filter(Boolean)
      .join('\n')
  } else {
    const text = expandText(tweet)
    pageTitle = `${authorName} on X`
    description = text
    image = collectImages(tweet)[0]?.url
    body = [
      textToHtml(text),
      renderImages(tweet),
      renderQuoted(tweet.quoted_tweet)
    ]
      .filter(Boolean)
      .join('\n')
  }

  const head = [
    '<meta charset="utf-8">',
    `<title>${escapeHtml(pageTitle)}</title>`,
    '<meta property="og:type" content="article">',
    '<meta property="og:site_name" content="X">',
    `<meta property="og:url" content="${escapeHtml(canonical)}">`,
    `<link rel="canonical" href="${escapeHtml(canonical)}">`,
    `<meta property="og:title" content="${escapeHtml(ogTitle)}">`,
    description &&
      `<meta property="og:description" content="${escapeHtml(description)}">`,
    image && `<meta property="og:image" content="${escapeHtml(image)}">`,
    `<meta name="author" content="${escapeHtml(authorName)}">`,
    tweet.created_at &&
      `<meta property="article:published_time" content="${escapeHtml(
        tweet.created_at
      )}">`,
    tweet.lang &&
      tweet.lang !== 'zxx' &&
      `<meta property="og:locale" content="${escapeHtml(tweet.lang)}">`
  ]
    .filter(Boolean)
    .join('\n')

  const lang =
    tweet.lang && tweet.lang !== 'zxx'
      ? ` lang="${escapeHtml(tweet.lang)}"`
      : ''

  return `<!doctype html>
<html${lang}>
<head>
${head}
</head>
<body>
<article>
${body}
</article>
</body>
</html>`
}

const fetchTweet = async (
  id,
  { fetch = globalThis.fetch, timeout = 8000 } = {}
) => {
  const endpoint = new URL(SYNDICATION_ENDPOINT)
  endpoint.searchParams.set('id', id)
  endpoint.searchParams.set('token', getToken(id))
  endpoint.searchParams.set('lang', 'en')

  // Network errors, aborted timeouts, and invalid JSON must degrade to
  // `undefined` so callers can fall back to their normal fetch pipeline.
  try {
    const response = await fetch(endpoint, {
      headers: { accept: 'application/json' },
      signal: timeout > 0 ? AbortSignal.timeout(Math.floor(timeout)) : undefined
    })
    if (!response.ok) return undefined

    const body = await response.json()
    // Tombstoned, protected, or removed posts come back as a non-Tweet typename.
    if (!body || body.__typename !== 'Tweet') return undefined
    return body
  } catch {
    return undefined
  }
}

/**
 * Resolve an X status/article URL into a clean HTML document built from the
 * public syndication payload. Returns `undefined` when the URL is not an X post
 * or the post is not publicly available, so the caller can fall back to the
 * normal fetch pipeline.
 *
 * @param {string} url
 * @param {{ fetch?: typeof globalThis.fetch, timeout?: number }} [opts]
 * @returns {Promise<{ html: string, tweet: object } | undefined>}
 */
const getEmbed = async (url, opts) => {
  const id = parseTweetId(url)
  if (!id) return undefined

  const tweet = await fetchTweet(id, opts)
  if (!tweet) return undefined

  return { html: buildHtml(tweet, url), tweet }
}

module.exports = { parseTweetId, getToken, buildHtml, getEmbed }
