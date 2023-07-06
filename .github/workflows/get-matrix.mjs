import { readdir, readFile } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const packages = []

const packagesPath = join(__dirname, '../../packages')

for (const packagePath of await readdir(packagesPath)) {
  const pkg = join(packagesPath, packagePath, 'package.json')
  const { name } = JSON.parse(await readFile(pkg))
  packages.push(name)
}

console.log(`{"package":${JSON.stringify(packages)}}`)

