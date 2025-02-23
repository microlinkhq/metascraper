import { readdir, readFile } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const packages = []

const packagesPath = join(__dirname, '../../packages')

for (const packagePath of await readdir(packagesPath)) {
  const pkg = join(packagesPath, packagePath, 'package.json')
  const { name, scripts } = JSON.parse(await readFile(pkg))
  if (scripts && scripts.test && scripts.test !== 'exit 0') {
    packages.push(name)
  }
}

console.log(`{"package":${JSON.stringify(packages)}}`)
