import { writeFile } from 'fs/promises'
import findCacheDir from 'find-cache-dir'
import * as path from 'upath'

export const cacheDir = findCacheDir({
  name: 'vuetify',
  create: true,
  thunk: true
})!

export function writeStyles (files: Set<string>) {
  return writeFile(
    cacheDir('styles.scss'),
    ['vuetify/lib/styles/main.sass', ...files.values()].map(v => `@forward '${path.normalize(v)}';`).join('\n'),
    'utf8'
  )
}
