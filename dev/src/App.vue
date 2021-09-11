<template>
  <v-app>
    <v-container>
      <v-alert>Alert</v-alert>
      <v-card v-ripple>
        <div style="text-align: center">
          <v-img src="/vuetify.png" style="display: inline-flex"></v-img>
        </div>
        <v-card-text>
          <v-text-field></v-text-field>
          <v-btn></v-btn>
<!--          <v-list>-->
<!--            <v-list-item title="List"></v-list-item>-->
<!--          </v-list>-->
        </v-card-text>
      </v-card>
    </v-container>
  </v-app>
</template>

<script>
  // const img = require('@/vuetify.png?vuetify-preload')
  // console.log(img, img.default)
  export default {
    data: () => ({})
  }
</script>

<style lang="scss">
.v-container {
  outline: 1px solid red;
}
</style>
