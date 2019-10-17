module.exports = {
  apiKey: process.env.MICROLINK_API_KEY,
  proxies: process.env.PROXIES.split(','),
  urls: [
    'https://twitter.com/Tour_du_Rwanda/status/1111166645475700737',
    'https://twitter.com/Visit_Murcia/status/1036982439829225472',
    'https://twitter.com/NBCNews/status/1034136310854963200',
    'https://twitter.com/Sportsnet/status/1034144032530653190',
    'https://twitter.com/NFL/status/1034557736816541696',
    'https://twitter.com/ufc/status/1027660288743464960',
    'https://twitter.com/NBA/status/1034525644288401408',
    'https://twitter.com/WorldRugby7s/status/1023907067298541568'
  ]
}
