import * as path from 'upath'

export interface Options {
  autoImport?: importPluginOptions,
  styles?: true | 'none' | 'expose' | 'sass' | {
    configFile: string,
  },
  /** @internal Only for testing */
  stylesTimeout?: number
}

export type importPluginOptions =
  | boolean
  // | ((source: string, importer: string, isVuetify: boolean) => boolean | null | replace)
// type replace = { symbol: string, from: string, as?: string }

export { generateImports } from './imports/generateImports'
export { cacheDir, writeStyles } from './styles/writeStyles'

export function resolveVuetifyBase () {
  return path.dirname(require.resolve('vuetify/package.json', { paths: [process.cwd()] }))
}

export function isObject (value: any): value is object {
  return value !== null && typeof value === 'object'
}

export function includes (arr: any[], val: any) {
  return arr.includes(val)
}
