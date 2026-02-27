'use strict'

const { eq, find, get, isEmpty, isNil, negate } = require('lodash')

const {
  extension: extensionFn,
  author: authorFn,
  description: descriptionFn,
  title: titleFn,
  url: urlFn,
  lang,
  publisher
} = require('@metascraper/helpers')

const createGetMedia = require('./get-media')

const RE_HTTPS = /^https:\/\//i
const RE_DOWNLOAD = /[?&]download=1(?:[&#]|$)/i

const isHttps = ({ url = '' }) => RE_HTTPS.test(url)

const hasPathSuffix = (url = '', suffixCodes = []) => {
  const queryIndex = url.indexOf('?')
  const hashIndex = url.indexOf('#')
  let end = url.length
  if (queryIndex !== -1 && queryIndex < end) end = queryIndex
  if (hashIndex !== -1 && hashIndex < end) end = hashIndex

  const suffixLength = suffixCodes.length
  if (end < suffixLength) return false

  const suffixStart = end - suffixLength
  for (let i = 0; i < suffixLength; i++) {
    let code = url.charCodeAt(suffixStart + i)
    if (code >= 65 && code <= 90) code += 32
    if (code !== suffixCodes[i]) return false
  }

  return true
}

const isMIME =
  extension =>
    ({ ext, url, format }) =>
      ext !== 'unknown_video'
        ? eq(ext, extension)
        : eq(extensionFn(url), extension) || format.includes(extension)

const isMp4 = isMIME('mp4')
const isMp3 = isMIME('mp3')
const isM4a = isMIME('m4a')
const isAac = isMIME('aac')
const isWav = isMIME('wav')
const isMpga = isMIME('mpga')

const M3U8_SUFFIX = [46, 109, 51, 117, 56] // .m3u8

const MPD_SUFFIX = [46, 109, 112, 100] // .mpd

const isM3u8 = ({ url = '' }) => hasPathSuffix(url, M3U8_SUFFIX)

const isMpd = ({ url = '' }) => hasPathSuffix(url, MPD_SUFFIX)

const hasCodec = prop => format => format[prop] !== 'none'

const hasAudioCodec = hasCodec('acodec')
const hasVideoCodec = hasCodec('vcodec')

const hasAudio = format =>
  isMp3(format) ||
  isM4a(format) ||
  isAac(format) ||
  isWav(format) ||
  isMpga(format)

const hasVideo = format =>
  isNil(format.format_note) || !isNil(format.height) || !isNil(format.width)

const isDownloadable = ({ url = '' }) => RE_DOWNLOAD.test(url)

const getOrderByRank = value => {
  if (Number.isNaN(value)) return 4
  if (value === undefined) return 3
  if (value === null) return 2
  return 1
}

const compareOrderByAsc = (left, right) => {
  const leftRank = getOrderByRank(left)
  const rightRank = getOrderByRank(right)

  if (leftRank !== rightRank) return leftRank - rightRank

  if (leftRank !== 1) return 0

  if (left > right) return 1
  if (left < right) return -1
  return 0
}

const getFormats = input =>
  get(input, 'formats') || get(input, 'entries[0].formats') || [input]

const getFormatUrls =
  (basicFilters, { orderBy }) =>
    (input, extraFilters, { isStream }) => {
      const filters = extraFilters.concat(basicFilters({ isStream }))

      const formats = getFormats(input)

      const urlProp = isStream ? 'manifest_url' : 'url'
      let lastUrl
      let lastOrderByValue
      let hasLast = false

      for (const format of formats) {
        let isMatch = true
        for (const filter of filters) {
          if (!filter(format)) {
            isMatch = false
            break
          }
        }
        if (!isMatch) continue

        const currentOrderByValue = format?.[orderBy]
        if (
          !hasLast ||
        compareOrderByAsc(currentOrderByValue, lastOrderByValue) >= 0
        ) {
          lastUrl = format?.[urlProp]
          lastOrderByValue = currentOrderByValue
          hasLast = true
        }
      }

      return !isEmpty(lastUrl) ? lastUrl : undefined
    }

const AUDIO_FILTERS = () => [
  hasAudio,
  isHttps,
  negate(isDownloadable),
  hasAudioCodec
]

const getAudioUrls = getFormatUrls(AUDIO_FILTERS, { orderBy: 'abr' })

const getVideo = data => {
  const formats = getFormats(data)

  let selectedVideoWithAudioUrl
  let selectedVideoWithAudioOrderBy
  let hasSelectedVideoWithAudio = false

  let selectedVideoUrl
  let selectedVideoOrderBy
  let hasSelectedVideo = false

  let selectedStreamUrl
  let selectedStreamOrderBy
  let hasSelectedStream = false

  for (const format of formats) {
    if (
      !isMp4(format) ||
      !isHttps(format) ||
      isDownloadable(format) ||
      isMpd(format)
    ) {
      continue
    }

    const currentOrderByValue = format?.tbr

    if (
      !hasSelectedStream ||
      compareOrderByAsc(currentOrderByValue, selectedStreamOrderBy) >= 0
    ) {
      selectedStreamUrl = format?.manifest_url
      selectedStreamOrderBy = currentOrderByValue
      hasSelectedStream = true
    }

    if (!hasVideo(format) || isM3u8(format) || !hasVideoCodec(format)) continue

    if (
      !hasSelectedVideo ||
      compareOrderByAsc(currentOrderByValue, selectedVideoOrderBy) >= 0
    ) {
      selectedVideoUrl = format?.url
      selectedVideoOrderBy = currentOrderByValue
      hasSelectedVideo = true
    }

    if (
      hasAudioCodec(format) &&
      (!hasSelectedVideoWithAudio ||
        compareOrderByAsc(currentOrderByValue, selectedVideoWithAudioOrderBy) >=
          0)
    ) {
      selectedVideoWithAudioUrl = format?.url
      selectedVideoWithAudioOrderBy = currentOrderByValue
      hasSelectedVideoWithAudio = true
    }
  }

  if (!isEmpty(selectedVideoWithAudioUrl)) return selectedVideoWithAudioUrl
  if (!isEmpty(selectedVideoUrl)) return selectedVideoUrl
  return !isEmpty(selectedStreamUrl) ? selectedStreamUrl : undefined
}

const getAudio = data => getAudioUrls(data, [], { isStream: false })

const getAuthor = ({ uploader, creator, uploader_id: uploaderId }) =>
  find([creator, uploader, uploaderId], str => authorFn(str))

const getPublisher = ({ extractor, extractor_key: extractorKey }) =>
  extractor !== 'generic' ? publisher(extractorKey) : undefined

const getLang = ({ language, http_headers: headers = {} }) =>
  lang(language || headers['Accept-Language'])

const getTitle = ({ title: mainTitle, alt_title: secondaryTitle }) =>
  find([mainTitle, secondaryTitle], titleFn)

const getDate = ({ timestamp }) =>
  !isNil(timestamp) ? new Date(timestamp * 1000).toISOString() : undefined

const getImage = (url, { thumbnail }) => urlFn(thumbnail, { url })

const getDescription = ({ description }) => descriptionFn(description)

module.exports = (opts = {}) => {
  const getMedia = createGetMedia(opts)

  const rules = {
    audio: async ({ url }) => getAudio(await getMedia(url)),
    author: async ({ url }) => getAuthor(await getMedia(url)),
    date: async ({ url }) => getDate(await getMedia(url)),
    description: async ({ url }) => getDescription(await getMedia(url)),
    image: async ({ url }) => getImage(url, await getMedia(url)),
    lang: async ({ url }) => getLang(await getMedia(url)),
    publisher: async ({ url }) => getPublisher(await getMedia(url)),
    title: async ({ url }) => getTitle(await getMedia(url)),
    video: async ({ url }) => getVideo(await getMedia(url))
  }

  rules.pkgName = 'metascraper-media-provider'

  return rules
}

module.exports.getAudio = getAudio
module.exports.getImage = getImage
module.exports.getAuthor = getAuthor
module.exports.getDate = getDate
module.exports.getFormatUrls = getFormatUrls
module.exports.getPublisher = getPublisher
module.exports.getTitle = getTitle
module.exports.getVideo = getVideo
module.exports.getLang = getLang
