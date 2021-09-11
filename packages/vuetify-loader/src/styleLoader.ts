import { LoaderDefinitionFunction } from 'webpack'

const styleImportRegexp = /@use ['"]vuetify(\/lib)?\/styles(\/main(\.sass)?)?['"]/

export default (function VuetifyLoader (content, sourceMap) {
  if (!styleImportRegexp.test(content)) {
    this.callback(null, content, sourceMap)
  }

  this.async()
  const options = this.getOptions() as { awaitResolve(): Promise<void> }

  options.awaitResolve().then(() => {
    this.callback(null, content.replace(styleImportRegexp, '@use ".cache/vuetify/styles.scss"'), sourceMap)
  })
} as LoaderDefinitionFunction)
