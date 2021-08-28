# @vuetify/vite-plugin

## Automatic imports
TODO

## Style loading
```js
// vite.config.js
plugins: [
  vue(),
  vuetify({ styles: 'expose' }),
]
```
```js
// plugins/vuetify.js
import './main.scss'
import { createVuetify } from 'vuetify/lib/framework'

export default createVuetify()
```
```scss
// main.scss
@use 'vuetify/lib/styles' with (
  $color-pack: false,
  $utilities: false,
);
```
