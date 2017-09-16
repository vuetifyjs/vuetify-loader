const loaderUtils = require("loader-utils")

module.exports = function(source) {
  const options = loaderUtils.getOptions(this)

  if (options.theme && this.resourcePath.endsWith('.styl')) {
    if (this.resourcePath.includes('node_modules/vuetify') || options.globalImport) {
      source = `@import '${options.theme}'\n${source}`
    }
  }

  return source
}
