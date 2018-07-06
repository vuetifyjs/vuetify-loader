# vuetify-loader

## Progressive images

`vuetify-loader` can automatically generate low-res placeholders for the `v-img` component

```js
const { VuetifyProgressiveModule, VuetifyProgressiveLoader } = require('vuetify-loader')


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
      VuetifyProgressiveLoader,
      {
        loader: 'url-loader',
        options: { limit: 8000 }
      }
    ]
  }
```

## a-la-carte

This webpack loader should only be used when utilizing the a-la-carte functionality of [vuetify](https://www.github.com/vuetifyjs/vuetify).

Read more at the vuetify [documentation](https://vuetifyjs.com/vuetify/a-la-carte).
