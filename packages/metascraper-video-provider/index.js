'use strict'

const getSocialVideoUrl = require('get-social-video-url')
const { isUrl } = require('@metascraper/helpers')
const createBrowserless = require('browserless')

const PREFERRED_VIDEO_QUALITY = [
  'sd',
  'hd',
  'mobile'
]

module.exports = (opts = {}) => {
  const { launchOpts = {}, preferredVideoQuality = PREFERRED_VIDEO_QUALITY } = opts

  const getVideoUrl = async ({ url }) => {
    const browserless = await createBrowserless(launchOpts)

    const videoQualities = await getSocialVideoUrl({ url, browserless })
    const videoQuality = preferredVideoQuality.find(videoQuality => isUrl(videoQualities[videoQuality]))
    const result = videoQualities[videoQuality]

    const browserInstance = await browserless.browser
    await browserInstance.close()

    return result
  }

  return { video: getVideoUrl }
}
