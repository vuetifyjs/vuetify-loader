import { LoaderDefinitionFunction } from 'webpack'
import { generateImports } from '@vuetify/loader-shared'

export default (function VuetifyLoader (content, sourceMap) {
  this.async()
  this.cacheable()

  const module = /^import { render } from "(.+)"$/m.exec(content)?.[1]

  if (module && !this.resourceQuery) {
    new Promise<string>((resolve, reject) => {
      this.loadModule(module, (err, source) => {
        if (err) reject(err)
        else this.loadModule(/^export \* from "(.+)"$/.exec(source)![1], (err, source) => {
          if (err) reject(err)
          else resolve(source)
        })
      })
    }).then(source => {
      content += generateImports(source, this.resourcePath, 'script').code

      this.callback(null, content, sourceMap)
    })
  } else {
    this.callback(null, content, sourceMap)
  }
} as LoaderDefinitionFunction)
