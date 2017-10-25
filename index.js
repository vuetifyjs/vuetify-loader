const loaderUtils = require("loader-utils")
const vuetifySrc = require('path').join('vuetify', 'src')

module.exports = function(source) {
  const options = loaderUtils.getOptions(this)
  if (options.theme && this.resourcePath.endsWith('.styl')) {
    if (this.resourcePath.includes(vuetifySrc) || options.globalImport) {
      source = `@import '${options.theme}'\n${source}`
    }
  }

  return source
}
