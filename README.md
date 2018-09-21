# vuetify-loader

## a-la-carte
The main part of this webpack loader should only be used when utilizing the a-la-carte functionality of [vuetify](https://www.github.com/vuetifyjs/vuetify) together with custom themes.

Read more at the vuetify [documentation](https://vuetifyjs.com/releases/0.16/#/vuetify/a-la-carte).


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
