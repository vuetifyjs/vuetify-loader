const loaderUtils = require('loader-utils')

module.exports = function loader(contentBuffer) {
  this.cacheable && this.cacheable()
  const callback = this.async()

  let content = contentBuffer.toString('utf8')
  // image file path
  const path = this.resourcePath

  // user options
  const config = {
    sharp: false,
    graphicsMagick: false,
    size: 9,
    ...loaderUtils.getOptions(this)
  }

  /** @see https://github.com/zouhir/lqip-loader */
  const contentIsUrlExport = /^module.exports = "data:(.*)base64,(.*)/.test(
    content
  )
  const contentIsFileExport = /^module.exports = (.*)/.test(content)
  let source = ''

  if (contentIsUrlExport) {
    source = content.match(/^module.exports = (.*)/)[1]
  } else {
    if (!contentIsFileExport) {
      const fileLoader = require('file-loader')
      content = fileLoader.call(this, contentBuffer)
    }
    source = content.match(/^module.exports = (.*);/)[1]
  }

  function createModule ({ data, info, type }) {
    const result = {
      lazySrc: `data:image/${type};base64,` + data.toString('base64'),
      aspect: info.width / info.height,
    }
    callback(
      null,
      `module.exports = {src:${source},` + JSON.stringify(result).slice(1)
    )
  }

  if (config.sharp) {
    const sharpImg = require('sharp')(path)

    sharpImg
      .jpeg({ quality: 10 })
      .resize(config.size)
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => createModule({ data, info, type: 'jpeg' }))
      .catch(console.error)
  } else {
    const gm = require('gm').subClass({ imageMagick: !config.graphicsMagick })

    gm(path).size(function(err, info) {
      if (err) console.error(err)
      else this.resize(config.size).toBuffer('gif', (err, data) => {
        if (err) console.error(err)
        else createModule({ data, info, type: 'gif' })
      })
    })
  }
}

module.exports.raw = true
