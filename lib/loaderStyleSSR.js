module.exports = function (content) {
  this.addDependency(this.resourcePath)
  this.cacheable()
  const newContent = 'if (render._vuetifyStyles) { render._vuetifyStyles(component) }'

  // Insert our modification before the HMR code
  const hotReload = content.indexOf('/* hot reload */')
  if (hotReload > -1) {
    content = content.slice(0, hotReload) + newContent + '\n\n' + content.slice(hotReload)
  } else {
    content += '\n\n' + newContent
  }
  return content
}
