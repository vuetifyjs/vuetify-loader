import { createRequire } from 'node:module'
import path from 'upath'
import type * as Components from 'vuetify/components'
import type * as Directives from 'vuetify/directives'

const require = createRequire(import.meta.url)

export interface Options {
  autoImport?: ImportPluginOptions,
  styles?: true | 'none' | 'sass' | {
    configFile: string,
  },
}

export interface ObjectImportPluginOptions {
  labs?: boolean
  ignore?: (keyof typeof Components | keyof typeof Directives)[]
}
export type ImportPluginOptions =
  | boolean
  | ObjectImportPluginOptions

export { generateImports } from './imports/generateImports'

export function resolveVuetifyBase () {
  return path.dirname(require.resolve('vuetify/package.json', { paths: [process.cwd()] }))
}

export function isObject (value: any): value is object {
  return value !== null && typeof value === 'object'
}

export function includes (arr: any[], val: any) {
  return arr.includes(val)
}

// Add leading slash to absolute paths on windows
export function normalizePath (p: string) {
  p = path.normalize(p)
  return /^[a-z]:\//i.test(p) ? '/' + p : p
}

export function toKebabCase (str = '') {
  return str
    .replace(/[^a-z]/gi, '-')
    .replace(/\B([A-Z])/g, '-$1')
    .toLowerCase()
}

const defaultTags = {
  video: ['src', 'poster'],
  source: ['src'],
  img: ['src'],
  image: ['xlink:href', 'href'],
  use: ['xlink:href', 'href'],
}
export const transformAssetUrls = {
  VAppBar: ['image'],
  VAvatar: ['image'],
  VBanner: ['avatar'],
  VCard: ['image', 'prependAvatar', 'appendAvatar'],
  VCardItem: ['prependAvatar', 'appendAvatar'],
  VCarouselItem: ['src', 'lazySrc', 'srcset'],
  VChip: ['prependAvatar', 'appendAvatar'],
  VImg: ['src', 'lazySrc', 'srcset'],
  VListItem: ['prependAvatar', 'appendAvatar'],
  VNavigationDrawer: ['image'],
  VParallax: ['src', 'lazySrc', 'srcset'],
  VToolbar: ['image'],
} as Record<string, string[]>

for (const [tag, attrs] of Object.entries(transformAssetUrls)) {
  attrs.forEach(attr => {
    if (/[A-Z]/.test(attr)) {
      attrs.push(toKebabCase(attr))
    }
  })
  transformAssetUrls[toKebabCase(tag)] = attrs
}
Object.assign(transformAssetUrls, defaultTags)
