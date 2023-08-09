'use strict'

const test = require('ava')

const { metascraper } = require('../helpers')

test('from file url content type', async t => {
  const url =
    'https://app.croct.dev/assets/workspace/customer-assets/9d97037d-64a2-4c25-b443-bfc2972f3c9e/a0442e2b-a384-4f2b-b443-9f34c2215e16'

  const metadata = await metascraper({ url })

  t.is(
    metadata.video,
    'https://app.croct.dev/assets/workspace/customer-assets/9d97037d-64a2-4c25-b443-bfc2972f3c9e/a0442e2b-a384-4f2b-b443-9f34c2215e16'
  )
})

test('from file url extension', async t => {
  const metadata = await metascraper({
    url: 'https://cdn-microlink.vercel.app/file-examples/sample.mp4'
  })

  t.is(
    metadata.video,
    'https://cdn-microlink.vercel.app/file-examples/sample.mp4'
  )
})
