const loaderUtils = require('loader-utils')

module.exports = function loader(contentBuffer) {
  this.cacheable && this.cacheable()
  const callback = this.async()

  let content = contentBuffer.toString('utf8')
  // image file path
  const path = this.resourcePath

  // user options
  const config = loaderUtils.getOptions(this) || {}

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

  if (config.sharp) {
    const sharpImg = require('sharp')(path)

    sharpImg
      .metadata()
      .then(({ height, width }) => {
        sharpImg
          .webp({ quality: 10 })
          .resize(config.size || 9)
          .toBuffer()
          .then(buffer => {
            const result = {
              lazySrc: 'data:image/webp;base64,' + buffer.toString('base64'),
              aspect: width / height,
            }
            callback(
              null,
              `module.exports = {src:${source},` +
                JSON.stringify(result).slice(1)
            )
          })
          .catch(console.error)
      })
      .catch(console.error)
  } else {
    const gm = require('gm').subClass({ imageMagick: true })

    gm(path).size(function(err, size) {
      if (err) {
        console.error(err)
        return
      }

      this.resize(config.size || 9).toBuffer('gif', (err, buffer) => {
        if (err) {
          console.error(err)
          return
        }
        const result = {
          lazySrc: 'data:image/gif;base64,' + buffer.toString('base64'),
          aspect: size.width / size.height,
        }
        callback(
          null,
          `module.exports = {src:${source},` + JSON.stringify(result).slice(1)
        )
      })
    })
  }
}

module.exports.raw = true
