'use strict'

const { eq, find, get, isEmpty, isNil, negate } = require('lodash')

const {
  extension: extensionFn,
  author: authorFn,
  description: descriptionFn,
  title: titleFn,
  url: urlFn,
  lang,
  publisher,
  protocol: protocolFn
} = require('@metascraper/helpers')

const createGetMedia = require('./get-media')

const isProtocol =
  value =>
    ({ url }) =>
      eq(protocolFn(url), value)

const isHttps = isProtocol('https')

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

const isM3u8 = ({ url }) => new URL(url).pathname.endsWith('.m3u8')

const isMpd = ({ url }) => new URL(url).pathname.endsWith('.mpd')

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

const isDownloadable = ({ url }) =>
  new URL(url).searchParams.get('download') === '1'

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

const selectLastFormat = (state, format, { orderBy, urlProp }) => {
  const currentOrderByValue = format?.[orderBy]
  if (
    !state.hasValue ||
    compareOrderByAsc(currentOrderByValue, state.orderByValue) >= 0
  ) {
    return {
      hasValue: true,
      orderByValue: currentOrderByValue,
      url: format?.[urlProp]
    }
  }
  return state
}

const getSelectedUrl = selected =>
  !isEmpty(selected.url) ? selected.url : undefined

const getFormatUrls =
  (basicFilters, { orderBy }) =>
    (input, extraFilters, { isStream }) => {
      const filters = extraFilters.concat(basicFilters({ isStream }))
      const formats = getFormats(input)

      const urlProp = isStream ? 'manifest_url' : 'url'
      let selected = { hasValue: false }

      for (const format of formats) {
        let isMatch = true
        for (const filter of filters) {
          if (!filter(format)) {
            isMatch = false
            break
          }
        }
        if (!isMatch) continue

        selected = selectLastFormat(selected, format, { orderBy, urlProp })
      }

      return getSelectedUrl(selected)
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

  let selectedVideoWithAudio = { hasValue: false }
  let selectedVideo = { hasValue: false }
  let selectedStreamVideo = { hasValue: false }

  for (const format of formats) {
    const hasRegularVideo =
      hasVideo(format) &&
      isMp4(format) &&
      isHttps(format) &&
      !isDownloadable(format) &&
      !isM3u8(format) &&
      !isMpd(format) &&
      hasVideoCodec(format)

    if (hasRegularVideo) {
      selectedVideo = selectLastFormat(selectedVideo, format, {
        orderBy: 'tbr',
        urlProp: 'url'
      })

      if (hasAudioCodec(format)) {
        selectedVideoWithAudio = selectLastFormat(
          selectedVideoWithAudio,
          format,
          {
            orderBy: 'tbr',
            urlProp: 'url'
          }
        )
      }
    }

    const hasStreamVideo =
      isMp4(format) &&
      isHttps(format) &&
      !isDownloadable(format) &&
      !isMpd(format)

    if (hasStreamVideo) {
      selectedStreamVideo = selectLastFormat(selectedStreamVideo, format, {
        orderBy: 'tbr',
        urlProp: 'manifest_url'
      })
    }
  }

  return (
    getSelectedUrl(selectedVideoWithAudio) ||
    getSelectedUrl(selectedVideo) ||
    getSelectedUrl(selectedStreamVideo)
  )
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
