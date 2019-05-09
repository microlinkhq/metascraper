module.exports = {
  // twitter guest web token
  // https://github.com/soimort/you-get/blob/da8c982608c9308765e0960e08fc28cccb74b215/src/you_get/extractors/twitter.py#L72
  // https://github.com/rg3/youtube-dl/blob/master/youtube_dl/extractor/twitter.py#L235
  TWITTER_BEARER_TOKEN:
    'Bearer AAAAAAAAAAAAAAAAAAAAAPYXBAAAAAAACLXUNDekMxqa8h%2F40K4moUkGsoc%3DTYfbDKbT3jJPCEVnMYqilB28NHfOPqkca3qaAxGfsyKCs0wRbw',
  TWITTER_HOSTNAMES: ['twitter.com', 'mobile.twitter.com'],
  TWITTER_TOKEN_TIMEOUT: 6000,
  TWITTER_ACTIVATE_LIMIT: 187,
  CACHE_KEY_MEMOIZE: 'twitter'
}
