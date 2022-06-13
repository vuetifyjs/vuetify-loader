import { writeFile } from 'fs/promises'
import * as findCacheDir from 'find-cache-dir'
import * as path from 'upath'

export const cacheDir = findCacheDir({
  name: 'vuetify',
  create: true,
  thunk: true
})!

function normalize (p: string) {
  p = path.normalize(p)
  return /^[a-z]:\//i.test(p) ? '/' + p : p
}

export function writeStyles (files: Set<string>) {
  return writeFile(
    cacheDir('styles.scss'),
    [
      'vuetify/lib/styles/main.sass',
      'vuetify/dist/_component-variables.sass',
      ...[...files.values()].sort()
    ].map(v => `@forward '${normalize(v)}';`).join('\n'),
    'utf8'
  )
}
