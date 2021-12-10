export interface Options {
  autoImport?: importPluginOptions,
  styles?: true | 'none' | 'expose',
  /** @internal Only for testing */
  stylesTimeout?: number
}

export type importPluginOptions =
  | boolean
  // | ((source: string, importer: string, isVuetify: boolean) => boolean | null | replace)
// type replace = { symbol: string, from: string, as?: string }

export { generateImports } from './imports/generateImports'
export { cacheDir, writeStyles } from './styles/writeStyles'
