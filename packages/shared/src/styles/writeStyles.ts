import { writeFile } from 'fs/promises'
import * as findCacheDir from 'find-cache-dir'
import { normalizePath } from '../index'

export const cacheDir = findCacheDir({
  name: 'vuetify',
  create: true,
  thunk: true
})!

export function writeStyles (files: Set<string>) {
  return writeFile(
    cacheDir('styles.scss'),
    [
      'vuetify/lib/styles/main.sass',
      'vuetify/dist/_component-variables.sass',
      ...[...files.values()].sort()
    ].map(v => `@forward '${normalizePath(v)}';`).join('\n'),
    'utf8'
  )
}
