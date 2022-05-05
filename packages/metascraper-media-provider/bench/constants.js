const uniqueRandomArray = require('unique-random-array')

const timeout = 4000

module.exports = {
  killSignal: 'SIGKILL',
  reject: false,

  gotOpts: {
    timeout,
    headers: {
      'user-agent': 'googlebot'
    }
  },

  timeout,
  retry: 3,
  getUrl: uniqueRandomArray([
    'https://twitter.com/Tour_du_Rwanda/status/1111166645475700737',
    'https://twitter.com/Visit_Murcia/status/1036982439829225472',
    'https://twitter.com/NBCNews/status/1034136310854963200',
    'https://twitter.com/Sportsnet/status/1034144032530653190',
    'https://twitter.com/nflnetwork/status/1506348961338064896',
    'https://twitter.com/ufc/status/1027660288743464960',
    'https://twitter.com/NBA/status/1034525644288401408',
    'https://twitter.com/WorldRugby7s/status/1023907067298541568'
  ])
}
