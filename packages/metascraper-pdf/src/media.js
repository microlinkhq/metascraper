'use strict'

const { deflateSync } = require('node:zlib')

const MIN_SIDE = 16
const MAX_PIXELS = 400 * 400
const MAX_LOGO_SIDE = 256

const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  crcTable[n] = c >>> 0
}

const crc32 = buf => {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

const chunk = (type, data) => {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

/** Encode raw RGB/RGBA from unpdf into a PNG data URI. node:zlib only. */
const toPngDataUri = ({ width, height, channels, data }) => {
  const source = Buffer.from(data.buffer, data.byteOffset, data.byteLength)
  const stride = width * channels
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    source.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = channels === 4 ? 6 : 2
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0))
  ])
  return `data:image/png;base64,${png.toString('base64')}`
}

const usable = images =>
  images.filter(
    img =>
      img &&
      img.data &&
      img.width >= MIN_SIDE &&
      img.height >= MIN_SIDE &&
      img.width * img.height <= MAX_PIXELS &&
      (img.channels === 3 || img.channels === 4)
  )

const isLogo = img =>
  img.width <= MAX_LOGO_SIDE &&
  img.height <= MAX_LOGO_SIDE &&
  img.width / img.height >= 0.4 &&
  img.width / img.height <= 2.5

const favicon = url =>
  `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(
    url
  )}&sz=128`

const getMedia = (images, { url } = {}) => {
  const candidates = usable(images)
    .slice()
    .sort(
      (left, right) => right.width * right.height - left.width * left.height
    )

  const logoImage = [...candidates].reverse().find(isLogo)
  const picture = candidates.find(img => img !== logoImage) || logoImage
  const logo = logoImage ? toPngDataUri(logoImage) : url ? favicon(url) : null

  return {
    image: picture ? toPngDataUri(picture) : null,
    logo
  }
}

module.exports = { favicon, getMedia, toPngDataUri, usable }
