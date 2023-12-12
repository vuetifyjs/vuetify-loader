import { readFileSync, writeFileSync } from 'node:fs'
import colors from 'picocolors'

const indexPath = 'dist/index.mjs'
let code = readFileSync(indexPath, 'utf-8')

const matchJson = [...code.matchAll(/^(import [^;]*? from '[\S]+\.json');$/gm)]
if (matchJson.length) {
  for (let i = matchJson.length - 1; i >= 0; i--) {
    const match = matchJson[i]
    code = code.slice(0, match.index + match[1].length) +
      ' assert { type: \'json\' }' +
      code.slice(match.index + match[1].length)
  }

  writeFileSync(indexPath, code)

  console.log(colors.bold(`${indexPath} MJS patched`))
  process.exit(0)
}

console.error(colors.red(`${indexPath} MJS patch failed`))
process.exit(1)
