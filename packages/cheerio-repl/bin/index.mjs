import { toRule, date, $jsonld, $filter } from '@metascraper/helpers'
import { readFile } from 'fs/promises'
import { load } from 'cheerio'
import { homedir } from 'os'
import { join } from 'path'
import repl from 'repl'

const toDate = toRule(date)

const [, , filepath] = process.argv

if (!filepath) {
  console.log('Usage: cheerio-repl <filepath>')
  process.exit(1)
}

const html = await readFile(filepath)
const $ = load(html)

repl
  .start({ prompt: '❯ ' })
  .setupHistory(
    join(homedir(), '.cheerio_repl_history'),
    (error, replServer) => {
      if (error) throw error
      replServer.context.$ = $
      replServer.context.$jsonld = selector => $jsonld(selector)($)
      replServer.context.$filter = $filter
      replServer.context.toDate = toDate
      replServer.context.date = date
    }
  )
