'use strict'

const test = require('ava').default

const metascraperPinterest = require('metascraper-pinterest')

const createMetascraper = (...args) =>
  require('metascraper')([
    metascraperPinterest(...args),
    require('metascraper-image')()
  ])

const AVATAR =
  'https://i.pinimg.com/280x280_RS/06/7b/9d/067b9d31e80538e9c03577ac9d7a86a9.jpg'
const DEFAULT_OG = 'https://s.pinimg.com/images/default_open_graph_1200.png'
const PROFILE = 'https://www.pinterest.com/ballerbig681/'

test('profile JSON-LD avatar is preferred', async t => {
  const html = `<!DOCTYPE html><html><head>
    <meta property="og:image" content="${DEFAULT_OG}">
    <script type="application/ld+json">{"@context":"https://schema.org/","@type":"ProfilePage","mainEntity":{"@type":"Person","name":"zamanyplug","image":{"@type":"ImageObject","contentUrl":"${AVATAR}"}}}</script>
  </head></html>`
  const metadata = await createMetascraper()({ url: PROFILE, html })
  t.is(metadata.image, AVATAR)
})

test('profile default og:image yields the user avatar', async t => {
  const html = `<!DOCTYPE html><html><head>
    <meta property="og:image" content="${DEFAULT_OG}">
    <title>zamanyplug (ballerbig681) - Profile | Pinterest</title>
  </head><body>
    <script>{"username":"ballerbig681","image_xlarge_url":"${AVATAR}"}</script>
  </body></html>`
  const metadata = await createMetascraper()({ url: PROFILE, html })
  t.is(metadata.image, AVATAR)
})

test('escaped JSON avatar URL is unescaped', async t => {
  const html = `<!DOCTYPE html><html><head>
    <meta property="og:image" content="${DEFAULT_OG}">
  </head><body>
    <script>"image_xlarge_url":"https:\\u002F\\u002Fi.pinimg.com\\u002F280x280_RS\\u002F06\\u002F7b\\u002F9d\\u002F067b9d31e80538e9c03577ac9d7a86a9.jpg"</script>
  </body></html>`
  const metadata = await createMetascraper()({ url: PROFILE, html })
  t.is(metadata.image, AVATAR)
})

test('real pin og:image is left alone', async t => {
  const url = 'https://www.pinterest.com/pin/123/'
  const pin =
    'https://i.pinimg.com/736x/ee/b5/65/eeb565d6a45e7e25683e960d2a2c5afa.jpg'
  const html = `<!DOCTYPE html><html><head>
    <meta property="og:image" content="${pin}">
  </head><body>
    <script type="application/ld+json">{"@type":"ProfilePage","mainEntity":{"image":{"contentUrl":"${AVATAR}"}}}</script>
    <script>"image_xlarge_url":"${AVATAR}"</script>
  </body></html>`
  const metadata = await createMetascraper()({ url, html })
  t.is(metadata.image, pin)
})
