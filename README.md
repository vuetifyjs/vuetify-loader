# vuetify-loader

<p align="center">
  <a href="https://www.patreon.com/kaelwd">
    <img src="https://c5.patreon.com/external/logo/become_a_patron_button.png" alt="Become a Patron" />
  </a>
</p>

## Automatic Imports
`vuetify-loader` will automatically import all Vuetify components as you use them

```js
// webpack.config.js

const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')

exports.plugins.push(
  new VuetifyLoaderPlugin()
)
```

You can also provide a custom match function to import your own project's components too:
```js
// webpack.config.js

const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')

exports.plugins.push(
  new VuetifyLoaderPlugin({
    /**
     * This function will be called for every tag used in each vue component
     * It should return an array, the first element will be inserted into the
     * components array, the second should be a corresponding import
     *
     * originalTag - the tag as it was originally used in the template
     * kebabTag    - the tag normalised to kebab-case
     * camelTag    - the tag normalised to PascalCase
     * path        - a relative path to the current .vue file
     * component   - a parsed representation of the current component
     */
    match (originalTag, { kebabTag, camelTag, path, component }) {
      if (kebabTag.startsWith('core-')) {
        return [camelTag, `import ${camelTag} from '@/components/core/${camelTag.substring(4)}.vue'`]
      }
    }
  })
)
```

Incase of vue-cli
```js
// vue.config.js

module.exports = {
  ...
  chainWebpack: config => {
    config
      .plugin('VuetifyLoaderPlugin')
      .tap(args => [{
        match(originalTag, { kebabTag, camelTag, path, component}) {
          if (kebabTag.startsWith('core-')) {
            return [camelTag, `import ${camelTag} from '@/components/core/${camelTag.substring(4)}.vue'`];
          }
        }
      }]);
  }
```

Example component:
```html
<template>
  <core-form>
    <v-card>
      ...
    </v-card>
  </core-form>
</template>

<script>
  export default {
    ...
  }
</script>
```

Will be compiled into:

```html
<template>
  <core-form>
    <v-card>
      ...
    </v-card>
  </core-form>
</template>

<script>
  import { VCard } from 'vuetify/lib'
  import CoreForm from '@/components/core/Form.vue'

  export default {
    components: {
      VCard,
      CoreForm
    },
    ...
  }
</script>
```

## Progressive images

`vuetify-loader` can automatically generate low-res placeholders for the `v-img` component

**NOTE:** You ***must*** have [ImageMagick](https://www.imagemagick.org/script/index.php) installed for this to work

Just some small modifications to your webpack rules:
```js
const { VuetifyProgressiveModule } = require('vuetify-loader')


  {
    test: /\.vue$/,
    loader: 'vue-loader',
    options: {
      compilerOptions: {
        modules: [VuetifyProgressiveModule]
      }
    }
  },
  {
    test: /\.(png|jpe?g|gif)$/,
    resourceQuery: /vuetify-preload/,
    use: [
      'vuetify-loader/progressive-loader',
      {
        loader: 'url-loader',
        options: { limit: 8000 }
      }
    ]
  }
```

And away you go!
```html
<v-img src="@/assets/some-image.jpg"></v-img>
```

### Loops and dynamic paths

`VuetifyProgressiveModule` only works on static paths, for use in a loop you have to `require` the image yourself:

```html
<v-img v-for="i in 10" :src="require(`@/images/image-${i}.jpg?vuetify-preload`)" :key="i">
```

### Lazy-loading specific images

If you only want some images to have placeholders, add `?lazy` to the end of the request:
```html
<v-img src="@/assets/some-image.jpg?lazy"></v-img>
```

And modify the regex to match:
```js
resourceQuery: /lazy\?vuetify-preload/
```

### Configuration

```ts
{
  size: number // The minimum dimensions of the preview images, defaults to 9px
  sharp: boolean // Use sharp instead of GM for environments without ImageMagick. This will result in lower-quality images
  graphicsMagick: boolean // Use GraphicsMagic instead of ImageMagick
  // TODO
  // limit: number // Source images smaller than this value (in bytes) will not be transformed
}
```

### Combining with another url-loader rule

Use `Rule.oneOf` to prevent corrupt output when there are multiple overlapping rules:

```js
{
  test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)(\?.*)?$/,
  oneOf: [
    {
      test: /\.(png|jpe?g|gif)$/,
      resourceQuery: /vuetify-preload/,
      use: [
        'vuetify-loader/progressive-loader',
        {
          loader: 'url-loader',
          options: { limit: 8000 }
        }
      ]
    },
    {
      loader: 'url-loader',
      options: { limit: 8000 }
    }
  ]
}
```
