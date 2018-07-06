# vuetify-loader

## Progressive images

`vuetify-loader` can automatically generate low-res placeholders for the `v-img` component

Just some small modifications to your webpack rules:
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

And away you go!
```html
<v-img src="@/assets/some-image.jpg"></v-img>
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

## a-la-carte

This webpack loader should only be used when utilizing the a-la-carte functionality of [vuetify](https://www.github.com/vuetifyjs/vuetify).

Read more at the vuetify [documentation](https://vuetifyjs.com/vuetify/a-la-carte).
