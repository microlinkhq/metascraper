'use strict'

const should = require('should')

const {
  isImageUrl,
  isAudioUrl,
  isVideoUrl,
  isVideoExtension,
  isAudioExtension,
  isImageExtension,
  isMime,
  extension,
  absoluteUrl
} = require('..')

describe('metascraper-helpers', () => {
  it('.absoluteUrl', () => {
    should(absoluteUrl('https://kikobeats.com/', 'blog')).be.equal(
      'https://kikobeats.com/blog'
    )
    should(absoluteUrl('https://kikobeats.com', '/blog')).be.equal(
      'https://kikobeats.com/blog'
    )
    should(absoluteUrl('https://kikobeats.com/', '/blog')).be.equal(
      'https://kikobeats.com/blog'
    )
    should(absoluteUrl('http://kikobeats.com/', '/blog')).be.equal(
      'http://kikobeats.com/blog'
    )
  })

  it('.extension', () => {
    should(extension('.mp4')).be.equal('mp4')
    should(extension('.mp4#t=0')).be.equal('mp4')
    should(extension('.mp4?foo=bar')).be.equal('mp4')
    should(extension('.mp4?foo=bar#t=0')).be.equal('mp4')
  })

  it('.isMime', () => {
    should(isMime('image/jpeg', 'image')).be.true()
    should(isMime('image/png', 'image')).be.true()
    should(isMime('image/gif', 'video')).be.true()
    should(isMime('video/mp4', 'video')).be.true()
    should(isMime('audio/x-aac', 'audio')).be.true()
    should(isMime('audio/x-wav', 'audio')).be.true()
    should(isMime('audio/mp3', 'audio')).be.true()
  })

  it('.isVideoUrl', () => {
    should(isVideoUrl('demo.mp4')).be.false()
    should(isVideoUrl('/demo.mp4')).be.false()
    should(isVideoUrl('https://microlink.io/demo.mp4')).be.true()
    should(isVideoUrl('https://microlink.io/demo.gif')).be.true()
  })

  it('.isImageUrl', () => {
    should(isVideoUrl('demo.png')).be.false()
    should(isVideoUrl('/demo.png')).be.false()
    should(isImageUrl('https://microlink.io/demo.png')).be.true()
    should(isImageUrl('https://microlink.io/demo.jpg')).be.true()
    should(isImageUrl('https://microlink.io/demo.jpeg')).be.true()
  })

  it('.isAudioUrl', () => {
    should(isAudioUrl('demo.mp3')).be.false()
    should(isAudioUrl('/demo.mp3')).be.false()
    should(isAudioUrl('https://microlink.io/demo.mp3')).be.true()
    should(isAudioUrl('https://microlink.io/demo.wav')).be.true()
    should(isAudioUrl('https://microlink.io/demo.aac')).be.true()
    should(isAudioUrl('https://microlink.io/demo.wav')).be.true()
    should(isAudioUrl('https://microlink.io/demo.m4a')).be.true()
  })

  it('.isVideoExtension', () => {
    should(isVideoExtension('https://microlink.io/demo.mp4')).be.true()
    should(isVideoExtension('demo.mp4')).be.true()
    should(isVideoExtension('demo.gif')).be.true()
  })

  it('.isAudioExtension', () => {
    should(isAudioExtension('https://microlink.io/demo.mp3')).be.true()
    should(isAudioExtension('demo.mp3')).be.true()
    should(isAudioExtension('demo.wav')).be.true()
    should(isAudioExtension('demo.aac')).be.true()
    should(isAudioExtension('demo.wav')).be.true()
    should(isAudioExtension('demo.m4a')).be.true()
  })

  it('.isImageExtension', () => {
    should(isImageExtension('https://microlink.io/demo.png')).be.true()
    should(isImageExtension('demo.png')).be.true()
    should(isImageExtension('demo.jpg')).be.true()
    should(isImageExtension('demo.jpeg')).be.true()
  })
})
