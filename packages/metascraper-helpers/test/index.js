'use strict'

const cheerio = require('cheerio')

const test = require('ava')

const {
  $jsonld,
  absoluteUrl,
  audio,
  author,
  date,
  description,
  extension,
  getUrls,
  image,
  isAudioExtension,
  isAudioUrl,
  isAuthor,
  isImageExtension,
  isImageUrl,
  isMime,
  isPdfExtension,
  isPdfUrl,
  isVideoExtension,
  isVideoUrl,
  lang,
  normalizeUrl,
  parseUrl,
  url,
  video
} = require('../src')

const measure = fn => {
  const time = process.hrtime()
  fn()
  const diff = process.hrtime(time)
  return (diff[0] * 1e9 + diff[1]) / 1e6
}

test('.getUrls', t => {
  t.deepEqual(getUrls(undefined), [])
  t.deepEqual(getUrls(null), [])
  t.deepEqual(getUrls(''), [])
  t.deepEqual(
    getUrls(
      'engineering ▲ @vercel; founder of https://t.co/4PQvCsVNsA https://t.co/fpiHwbEPBv https://t.co/IG8Qq0IDKi https://t.co/gblDRx1P9D https://t.co/SmoZi3hAhb https://t.co/Y0Uk1XU3Eu https://t.co/PAq3eTEhmI'
    ),
    [
      'https://t.co/4PQvCsVNsA',
      'https://t.co/fpiHwbEPBv',
      'https://t.co/IG8Qq0IDKi',
      'https://t.co/gblDRx1P9D',
      'https://t.co/SmoZi3hAhb',
      'https://t.co/Y0Uk1XU3Eu',
      'https://t.co/PAq3eTEhmI'
    ]
  )
})

test('.parseUrl', t => {
  const fn = () => parseUrl('https://example.com')
  /* this assertion ensure parseUrl memoize the value */
  t.true(measure(fn) > measure(fn)) // eslint-disable-line
})

test('.normalizeUrl', t => {
  t.is(normalizeUrl('https://example.com', 'javascript:false'), undefined)
  t.is(
    normalizeUrl(
      'https://wbez-rss.streamguys1.com/player/player21011316001810372.html'
    ),
    'https://wbez-rss.streamguys1.com/player/player21011316001810372.html'
  )
  t.is(
    normalizeUrl(
      'https://bfi.uchicago.edu/podcast/the-big-tech-threat/',
      '//wbez-rss.streamguys1.com/player/player21011316001810372.html'
    ),
    'https://wbez-rss.streamguys1.com/player/player21011316001810372.html'
  )
  t.is(normalizeUrl('https://example.com/'), 'https://example.com/')
  t.is(normalizeUrl('https://example.com'), 'https://example.com/')
  t.is(
    normalizeUrl('https://www.example.com', 'https://www.example.com/foo'),
    'https://www.example.com/foo'
  )
  t.is(
    normalizeUrl('https://www.example.com', '/foo'),
    'https://www.example.com/foo'
  )
  t.is(
    normalizeUrl('https://www.example.com', 'file.html'),
    'https://www.example.com/file.html'
  )
  t.is(
    normalizeUrl(
      'https://www.example.com',
      'data:text/html;base64,PGh0bWw+SGVsbG8sIHdvcmxkITwvaHRtbD4='
    ),
    'data:text/html;base64,PGh0bWw+SGVsbG8sIHdvcmxkITwvaHRtbD4='
  )
  t.is(
    normalizeUrl(
      'https://www.example.com',
      "javascript:alert('Hello, world!');"
    ),
    undefined
  )
  t.is(normalizeUrl('https://www.example.com', 'javascript:void(0)'), undefined)
})

test('.author', t => {
  t.is(author('By Kiko Beats'), 'Kiko Beats')
  t.is(author('Byrne Hobart'), 'Byrne Hobart')
})

test('.url', t => {
  t.is(url(), undefined)
  t.is(url(null), undefined)
  t.is(url(''), undefined)
  t.is(url('', { url: 'https://kikobeats.com/' }), undefined)
  t.is(url('paco'), undefined)
  t.is(url(NaN, { url: 'https://kikobeats.com' }), undefined)
  t.is(url('http://<foo>', { url: 'https://kikobeats.com' }), undefined)
  t.is(
    url('blog', { url: 'https://kikobeats.com/' }),
    'https://kikobeats.com/blog'
  )
  t.is(
    url(
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    ),
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
  )
  t.is(
    url(
      'data:image/gif;base64, R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    ),
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
  )
  t.is(
    url(
      'data:image/gif;base64,\nR0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    ),
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
  )
  t.is(
    url(
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      {
        url: 'https://kikobeats.com/'
      }
    ),
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
  )
  t.is(
    url('magnet:?xt=urn:btih:c12fe1c06bba254a9dc9f519b335aa7c1367a88a', {
      url: 'https://kikobeats.com/'
    }),
    'magnet:?xt=urn:btih:c12fe1c06bba254a9dc9f519b335aa7c1367a88a'
  )
  t.is(
    url(
      'http://cdn2.cloudpro.co.uk/sites/cloudprod7/files/4/29//handshake_0.jpg',
      {
        url: 'http://www.cloudpro.co.uk/go/6024'
      }
    ),
    'http://cdn2.cloudpro.co.uk/sites/cloudprod7/files/4/29/handshake_0.jpg'
  )
})

test('.absoluteUrl', t => {
  t.is(
    absoluteUrl(
      'https://kikobeats.com/',
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    ),
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
  )
  t.is(absoluteUrl('https://kikobeats.com/', ''), 'https://kikobeats.com/')
  t.is(absoluteUrl('https://kikobeats.com/', null), 'https://kikobeats.com/')
  t.is(
    absoluteUrl('https://kikobeats.com/', undefined),
    'https://kikobeats.com/'
  )
  t.is(
    absoluteUrl('https://kikobeats.com/', 'blog'),
    'https://kikobeats.com/blog'
  )
  t.is(
    absoluteUrl('https://kikobeats.com', '/blog'),
    'https://kikobeats.com/blog'
  )
  t.is(
    absoluteUrl('https://kikobeats.com/', '/blog'),
    'https://kikobeats.com/blog'
  )
  t.is(
    absoluteUrl('http://kikobeats.com/', '/blog'),
    'http://kikobeats.com/blog'
  )
})

test('.extension', t => {
  t.is(extension('.mp4'), 'mp4')
  t.is(extension('.mp4#t=0'), 'mp4')
  t.is(extension('.mp4?foo=bar'), 'mp4')
  t.is(extension('.mp4?foo=bar#t=0'), 'mp4')
})

test('.isMime', t => {
  t.true(isMime('image/jpeg', 'image'))
  t.true(isMime('image/png', 'image'))
  t.true(isMime('image/gif', 'image'))
  t.true(isMime('video/mp4', 'video'))
  t.true(isMime('audio/x-aac', 'audio'))
  t.true(isMime('audio/x-wav', 'audio'))
  t.true(isMime('audio/mp3', 'audio'))
})

test('.audio', t => {
  t.is(
    audio(
      'https://app.croct.dev/assets/workspace/customer-assets/9d97037d-64a2-4c25-b443-bfc2972f3c9e/a0442e2b-a384-4f2b-b443-9f34c2215e16',
      { type: 'audio/wav' }
    ),
    'https://app.croct.dev/assets/workspace/customer-assets/9d97037d-64a2-4c25-b443-bfc2972f3c9e/a0442e2b-a384-4f2b-b443-9f34c2215e16'
  )
  t.is(
    audio(
      'https://app.croct.dev/assets/workspace/customer-assets/9d97037d-64a2-4c25-b443-bfc2972f3c9e/a0442e2b-a384-4f2b-b443-9f34c2215e16',
      { type: 'audio/wav' }
    ),
    'https://app.croct.dev/assets/workspace/customer-assets/9d97037d-64a2-4c25-b443-bfc2972f3c9e/a0442e2b-a384-4f2b-b443-9f34c2215e16'
  )
  t.is(
    audio(
      'https://app.croct.dev/assets/workspace/customer-assets/9d97037d-64a2-4c25-b443-bfc2972f3c9e/a0442e2b-a384-4f2b-b443-9f34c2215e16'
    ),
    undefined
  )
})

test('.video', t => {
  t.is(
    video(
      'https://app.croct.dev/assets/workspace/customer-assets/9d97037d-64a2-4c25-b443-bfc2972f3c9e/a0442e2b-a384-4f2b-b443-9f34c2215e16',
      { type: 'video/mp4' }
    ),
    'https://app.croct.dev/assets/workspace/customer-assets/9d97037d-64a2-4c25-b443-bfc2972f3c9e/a0442e2b-a384-4f2b-b443-9f34c2215e16'
  )
  t.is(
    video(
      'https://app.croct.dev/assets/workspace/customer-assets/9d97037d-64a2-4c25-b443-bfc2972f3c9e/a0442e2b-a384-4f2b-b443-9f34c2215e16',
      { type: 'video/mpeg' }
    ),
    'https://app.croct.dev/assets/workspace/customer-assets/9d97037d-64a2-4c25-b443-bfc2972f3c9e/a0442e2b-a384-4f2b-b443-9f34c2215e16'
  )
  t.is(
    video(
      'https://app.croct.dev/assets/workspace/customer-assets/9d97037d-64a2-4c25-b443-bfc2972f3c9e/a0442e2b-a384-4f2b-b443-9f34c2215e16'
    ),
    undefined
  )
})

test('.isVideoUrl', t => {
  t.false(isVideoUrl('demo.mp4'))
  t.false(isVideoUrl('/demo.mp4'))
  t.true(isVideoUrl('https://microlink.io/demo.mp4'))
})

test('.image', t => {
  t.is(image('https://microlink.io/demo.png'), 'https://microlink.io/demo.png')
  t.is(image('/demo.png'), undefined)
  t.is(
    image('/demo.png', { url: 'https://microlink.io' }),
    'https://microlink.io/demo.png'
  )
  t.is(image('https://microlink.io/demo.mp4'), undefined)
  t.is(image('https://microlink.io/demo.mp3'), undefined)
  t.is(
    image({ '@id': 'https://www.milanocittastato.it/#/schema/logo/image/' }),
    undefined
  )
  t.is(image('data:,'), undefined)
})

test('.isImageUrl', t => {
  t.false(isVideoUrl('demo.png'))
  t.false(isVideoUrl('/demo.png'))
  t.true(isImageUrl('https://microlink.io/demo.png'))
  t.true(isImageUrl('https://microlink.io/demo.jpg'))
  t.true(isImageUrl('https://microlink.io/demo.jpeg'))
  t.true(isImageUrl('https://microlink.io/demo.gif'))
})

test('.isAudioUrl', t => {
  t.false(isAudioUrl('demo.mp3'))
  t.false(isAudioUrl('/demo.mp3'))
  t.true(isAudioUrl('https://microlink.io/demo.mp3'))
  t.true(isAudioUrl('https://microlink.io/demo.wav'))
  t.true(isAudioUrl('https://microlink.io/demo.aac'))
  t.true(isAudioUrl('https://microlink.io/demo.wav'))
  t.true(isAudioUrl('https://microlink.io/demo.m4a'))
})

test('.isPdfUrl', t => {
  t.false(isAudioUrl('demo.pdf'))
  t.false(isPdfUrl('/demo.pdf'))
  t.true(isPdfUrl('https://microlink.io/demo.pdf'))
})

test('.isAuthor', t => {
  t.false(isAuthor(''))
  t.true(isAuthor('Kiko'))
  t.false(isAuthor('https://metascraper.org'))
})

test('.isVideoExtension', t => {
  t.true(isVideoExtension('https://microlink.io/demo.mp4'))
  t.true(isVideoExtension('demo.mp4'))
})

test('.isAudioExtension', t => {
  t.true(isAudioExtension('https://microlink.io/demo.mp3'))
  t.true(isAudioExtension('demo.mp3'))
  t.true(isAudioExtension('demo.wav'))
  t.true(isAudioExtension('demo.aac'))
  t.true(isAudioExtension('demo.wav'))
  t.true(isAudioExtension('demo.m4a'))
})

test('.isImageExtension', t => {
  t.true(isImageExtension('https://microlink.io/demo.png'))
  t.true(isImageExtension('demo.png'))
  t.true(isImageExtension('demo.jpg'))
  t.true(isImageExtension('demo.jpeg'))
  t.true(isImageExtension('demo.gif'))
})

test('.isPdfExtension', t => {
  t.true(isPdfExtension('https://microlink.io/demo.pdf'))
  t.true(isPdfExtension('demo.pdf'))
})

test('.description', t => {
  t.is(
    description(
      'Let me tell you the story of two investors, neither of whom knew each other, but whose paths crossed in an interesting way. Grace Groner was orphaned at age 12. She never married. She never had kids. She never drove a car. She lived most of her life alone in a one-bedroom house and worked her whole career as a secretary. She was, by all accounts, a lovely lady. But she lived a humble and quiet life. That made the $7 million she left to charity after her death in 2010 at age 100 all the more confusing. People who knew her asked: Where did Grace get all that money? But there was no secret. There was no inheritance. Grace took humble savings from a meager salary and enjoyed eighty years of hands-off compounding in the stock market. That was it. Weeks after Grace died, an unrelated investing story hit the news. Richard Fuscone, former vice chairman of Merrill Lynch’s Latin America division, declared personal bankruptcy, fighting off foreclosure on two homes, one of which was nearly 20,000 square feet and had a $66,000 a month mortgage. Fuscone was the opposite of Grace Groner; educated at Harvard and University of Chicago, he became so successful in the investment industry that he retired in his 40s to “pursue personal and charitable interests.” But heavy borrowing and illiquid investments did him in. The same year Grace Goner left a veritable fortune to charity, Richard stood before a bankruptcy judge and declared: “I have been devastated by the financial crisis … The only source of liquidity is whatever my wife is able to sell in terms of personal furnishings.” The purpose of these stories is not to say you should be like Grace and avoid being like Richard. It’s to point out that there is no other field where these stories are even possible. In what other field does someone with no education, no relevant experience, no resources, and no connections vastly outperform someone with the best education, the most relevant experiences, the best resources and the best connections? There will never be a story of a Grace Groner performing heart surgery better than a Harvard-trained cardiologist. Or building a faster chip than Apple’s engineers. Unthinkable. But these stories happen in investing. That’s because investing is not the study of finance. It’s the study of how people behave with money. And behavior is hard to teach, even to really smart people. You can’t sum up behavior with formulas to memorize or spreadsheet models to follow. Behavior is inborn, varies by person, is hard to measure, changes over time, and people are prone to deny its existence, especially when describing themselves. Grace and Richard show that managing money isn’t necessarily about what you know; it’s how you behave. But that’s not how finance is typically taught or discussed. The finance industry talks too much about what to do, and not enough about what happens in your head when you try to do it. This report describes 20 flaws, biases, and causes of bad behavior I’ve seen pop up often when people deal with money. 1. Earned success and deserved failure fallacy: A tendency to underestimate the role of luck and risk, and a failure to recognize that luck and risk are different sides of the same coin. I like to ask people, “What do you want to know about investing that we can’t know?” It’s not a practical question. So few people ask it. But it forces anyone you ask to think about what they intuitively think is true but don’t spend much time trying to answer because it’s futile. Years ago I asked economist Robert Shiller the question. He answered, “The exact role of luck in successful outcomes.” I love that, because no one thinks luck doesn’t play a role in financial success. But since it’s hard to quantify luck, and rude to suggest people’s success is owed to luck, the default stance is often to implicitly ignore luck as a factor. If I say, “There are a billion investors in the world. By sheer chance, would you expect 100 of them to become billionaires predominately off luck?” You would reply, “Of course.” But then if I ask you to name those investors – to their face – you will back down. That’s the problem. The same goes for failure. Did failed businesses not try hard enough? Were bad investments not thought through well enough?',
      { truncateLength: 300 }
    ),
    'Let me tell you the story of two investors, neither of whom knew each other, but whose paths crossed in an interesting way. Grace Groner was orphaned at age 12. She never married. She never had kids. She never drove a car. She lived most of her life alone in a one-bedroom house and worked her whole…'
  )

  t.is(
    description(
      'He talks about the ocean and his favorite animal the cowrie...'
    ),
    'He talks about the ocean and his favorite animal the cowrie…'
  )
  t.is(
    description(
      'He talks about the ocean and his favorite animal the cowrie..'
    ),
    'He talks about the ocean and his favorite animal the cowrie…'
  )
  t.is(
    description(
      'He talks about the ocean and his favorite animal the cowrie ...'
    ),
    'He talks about the ocean and his favorite animal the cowrie…'
  )
})

test('.$jsonld', t => {
  const $ = cheerio.load(`
      <script type="application/ld+json">{ "offers": { "price": 119.99 }}</script>
      <script type="application/ld+json">{ "offers": { "price": "" }}</script>
      `)
  const value = $jsonld('offers.price')($)
  t.is(value, 119.99)
})

test('.lang', t => {
  t.is(lang(undefined), undefined)
  t.is(lang(NaN), undefined)
  t.is(lang(null), undefined)
  t.is(lang({}), undefined)
  t.is(lang(123), undefined)
  t.is(lang('es'), 'es')
  t.is(lang('es'), 'es')
  t.is(lang('ES'), 'es')
  t.is(lang('en-US'), 'en')
  t.is(lang('en_GB'), 'en')
  t.is(lang('en_US'), 'en')
  t.is(lang('spa'), 'es')
})

test('.date', t => {
  t.is(date(''), undefined)
  t.is(date(), undefined)
  t.is(date(undefined), undefined)
  t.is(date(null), undefined)
  t.is(date('null'), undefined)
  t.is(date('Jun 20'), '2025-06-20T12:00:00.000Z')
  t.is(date('Jun 20 2018'), '2018-06-20T12:00:00.000Z')
  t.is(date('Jun 2018'), '2018-06-01T12:00:00.000Z')
  t.is(date(2010), '2010-01-01T00:00:00.000Z')
  t.is(date(1594767608), '2020-07-14T23:00:08.000Z')
  t.is(date(1594767608 * 1000), '2020-07-14T23:00:08.000Z')
  t.is(date(1594767608 * 1000000), '2020-07-14T23:00:08.000Z')
  t.is(date(1594767608 * 1000000000), '2020-07-14T23:00:08.000Z')
  t.is(date('11 juil. 2019'), undefined)
  const now = new Date()
  t.is(date(now), now.toISOString())
})
