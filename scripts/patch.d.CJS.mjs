/**

 It converts

 ```ts
 export { vuePlugin as default };
 ```

 to

 ```ts
 export = vuePlugin;
 export { vuePlugin as default };
 ```
 */

import { readFileSync, writeFileSync } from 'node:fs'
import colors from 'picocolors'

const files = ['dist/index.d.ts', 'dist/index.d.cts']

for (const indexPath of files) {
  let code = readFileSync(indexPath, 'utf-8')

  const matchMixed = code.match(/\nexport \{ (\w+) as default };/)
  if (matchMixed) {
    const name = matchMixed[1]

    code = code.slice(0, matchMixed.index) + `\nexport = ${name};` + code.slice(matchMixed.index)

    writeFileSync(indexPath, code)

    console.log(colors.bold(`${indexPath} d.CJS patched`))
  }
}
