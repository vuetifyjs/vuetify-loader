# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [3.1.1](https://github.com/vuetifyjs/vuetify-loader/compare/webpack-plugin-vuetify@3.1.0...webpack-plugin-vuetify@3.1.1) (2025-04-03)


### Bug Fixes

* **styles:** resolve new scss component styles ([#345](https://github.com/vuetifyjs/vuetify-loader/issues/345)) ([98ef110](https://github.com/vuetifyjs/vuetify-loader/commit/98ef1106fb3875a5079d309986de61e12cd5683d))



## [3.1.0](https://github.com/vuetifyjs/vuetify-loader/compare/webpack-plugin-vuetify@3.0.3...webpack-plugin-vuetify@3.1.0) (2025-02-04)

**Note:** Version bump only for package webpack-plugin-vuetify





### [3.0.3](https://github.com/vuetifyjs/vuetify-loader/compare/webpack-plugin-vuetify@3.0.2...webpack-plugin-vuetify@3.0.3) (2024-03-10)

**Note:** Version bump only for package webpack-plugin-vuetify





### [3.0.2](https://github.com/vuetifyjs/vuetify-loader/compare/webpack-plugin-vuetify@3.0.1...webpack-plugin-vuetify@3.0.2) (2024-02-28)


### Bug Fixes

* export webpack plugin ([9b71994](https://github.com/vuetifyjs/vuetify-loader/commit/9b71994669579996ea38352e3bd44549effe426a)), closes [#329](https://github.com/vuetifyjs/vuetify-loader/issues/329)



### [3.0.1](https://github.com/vuetifyjs/vuetify-loader/compare/webpack-plugin-vuetify@3.0.0...webpack-plugin-vuetify@3.0.1) (2023-12-12)


### Bug Fixes

* support node 18 ([9683bf5](https://github.com/vuetifyjs/vuetify-loader/commit/9683bf54ad3b26a6553574a1be6a6c3c95fc3afd)), closes [#325](https://github.com/vuetifyjs/vuetify-loader/issues/325)



## [3.0.0](https://github.com/vuetifyjs/vuetify-loader/compare/webpack-plugin-vuetify@2.0.1...webpack-plugin-vuetify@3.0.0) (2023-12-12)


### ⚠ BREAKING CHANGES

* Requires node >18
* Removed `styles: 'expose'` option

### Features

* add autoImport ignore option ([#323](https://github.com/vuetifyjs/vuetify-loader/issues/323)) ([1328d49](https://github.com/vuetifyjs/vuetify-loader/commit/1328d492abcf4612f336b6ad1d014f1ed250793c))
* add esm build ([34a03c1](https://github.com/vuetifyjs/vuetify-loader/commit/34a03c152e04e16694ca43c255a08edf3a2bd382)), closes [#319](https://github.com/vuetifyjs/vuetify-loader/issues/319)
* allow labs auto-import ([55ead16](https://github.com/vuetifyjs/vuetify-loader/commit/55ead1692cd857a15e7595d14e97766c57651f0b)), closes [#315](https://github.com/vuetifyjs/vuetify-loader/issues/315)
* remove `styles: 'expose'` ([c43dc80](https://github.com/vuetifyjs/vuetify-loader/commit/c43dc804811bf22be920ac72a38e7b4c193bca3b))


### Bug Fixes

* add explicit vue peer dependency ([6634db3](https://github.com/vuetifyjs/vuetify-loader/commit/6634db3218dcc706db1c5c9e90f338ce76e9fff3)), closes [#292](https://github.com/vuetifyjs/vuetify-loader/issues/292)



### [2.0.1](https://github.com/vuetifyjs/vuetify-loader/compare/webpack-plugin-vuetify@2.0.0...webpack-plugin-vuetify@2.0.1) (2023-01-28)


### Bug Fixes

* add leading slash to absolute paths on windows ([3ecd8e2](https://github.com/vuetifyjs/vuetify-loader/commit/3ecd8e2d8034137ca47ad8325df960dfb0efc08e)), closes [#274](https://github.com/vuetifyjs/vuetify-loader/issues/274)



## [2.0.0](https://github.com/vuetifyjs/vuetify-loader/compare/webpack-plugin-vuetify@2.0.0-alpha.13...webpack-plugin-vuetify@2.0.0) (2022-10-13)


### Features

* add transformAssetUrls ([c2e525b](https://github.com/vuetifyjs/vuetify-loader/commit/c2e525b3a3ad5582ffc50216a94c47b94f1c8fc9)), closes [#237](https://github.com/vuetifyjs/vuetify-loader/issues/237)



## [2.0.0-alpha.13](https://github.com/vuetifyjs/vuetify-loader/compare/webpack-plugin-vuetify@2.0.0-alpha.12...webpack-plugin-vuetify@2.0.0-alpha.13) (2022-08-31)


### Features

* add styles.configFile option ([9142e9d](https://github.com/vuetifyjs/vuetify-loader/commit/9142e9d644ba1e4f86486440c29a318704090636)), closes [#263](https://github.com/vuetifyjs/vuetify-loader/issues/263) [#245](https://github.com/vuetifyjs/vuetify-loader/issues/245) [#221](https://github.com/vuetifyjs/vuetify-loader/issues/221)
* support "[@use](https://github.com/use) 'vuetify'" ([e578193](https://github.com/vuetifyjs/vuetify-loader/commit/e578193a685dd581f6f15ff6e5e99f1a6eebbf1c))



## [2.0.0-alpha.12](https://github.com/vuetifyjs/vuetify-loader/compare/webpack-plugin-vuetify@2.0.0-alpha.11...webpack-plugin-vuetify@2.0.0-alpha.12) (2022-07-23)


### Bug Fixes

* add vue and upath to dependencies ([ac5af82](https://github.com/vuetifyjs/vuetify-loader/commit/ac5af823f1bfd8bc79dc3eb353eed64adef34421)), closes [#242](https://github.com/vuetifyjs/vuetify-loader/issues/242)
* resolve vuetify relative to cwd ([9bf71d4](https://github.com/vuetifyjs/vuetify-loader/commit/9bf71d4fd8596cf8333e3041f4307a851c7aba6a)), closes [#248](https://github.com/vuetifyjs/vuetify-loader/issues/248)



## [2.0.0-alpha.11](https://github.com/vuetifyjs/vuetify-loader/compare/webpack-plugin-vuetify@2.0.0-alpha.10...webpack-plugin-vuetify@2.0.0-alpha.11) (2022-06-16)


### Features

* support vuetify beta.4 ([f1a0976](https://github.com/vuetifyjs/vuetify-loader/commit/f1a09765e568c7ee5481dd576765939ffc1fe534))



## 2.0.0-alpha.10 (2022-05-21)


### Features

* rename packages ([c64493d](https://github.com/vuetifyjs/vuetify-loader/commit/c64493d2d9d68338b23d302a3467c1058cd055f1)), closes [#236](https://github.com/vuetifyjs/vuetify-loader/issues/236)
* **styles:** add sass option ([ddd68d9](https://github.com/vuetifyjs/vuetify-loader/commit/ddd68d99aedaa0088c5d89740d1a9b9c1bb74808))



## [2.0.0-alpha.9](https://github.com/vuetifyjs/vuetify-loader/compare/vuetify-loader@2.0.0-alpha.8...vuetify-loader@2.0.0-alpha.9) (2021-12-10)


### Features

* add stylesTimeout option ([93e830d](https://github.com/vuetifyjs/vuetify-loader/commit/93e830dd728610bfa83c5a93f85fcca6acb4f59d))


### Bug Fixes

* wait for all other modules to resolve before writing styles ([274ce9c](https://github.com/vuetifyjs/vuetify-loader/commit/274ce9ced8da65107b7544f9cdb2d82d463be313)), closes [#225](https://github.com/vuetifyjs/vuetify-loader/issues/225)



## [2.0.0-alpha.8](https://github.com/vuetifyjs/vuetify-loader/compare/vuetify-loader@2.0.0-alpha.7...vuetify-loader@2.0.0-alpha.8) (2021-11-17)

**Note:** Version bump only for package vuetify-loader





## [2.0.0-alpha.7](https://github.com/vuetifyjs/vuetify-loader/compare/vuetify-loader@2.0.0-alpha.6...vuetify-loader@2.0.0-alpha.7) (2021-11-15)


### Bug Fixes

* collect imports from script setup in prod build ([7d9b26e](https://github.com/vuetifyjs/vuetify-loader/commit/7d9b26e3ade6b71af71bc085cfbb881e8ae114bd))



## [2.0.0-alpha.6](https://github.com/vuetifyjs/vuetify-loader/compare/vuetify-loader@2.0.0-alpha.5...vuetify-loader@2.0.0-alpha.6) (2021-11-11)


### Features

* support external templates ([8b7fc70](https://github.com/vuetifyjs/vuetify-loader/commit/8b7fc7082cf177e122d83b97ec0521092c044a77)), closes [#215](https://github.com/vuetifyjs/vuetify-loader/issues/215)


### Bug Fixes

* support node 12 ([9ddf99b](https://github.com/vuetifyjs/vuetify-loader/commit/9ddf99b3a3222d86cf9dc5b8a7561bc0131d6832)), closes [#212](https://github.com/vuetifyjs/vuetify-loader/issues/212)



## [2.0.0-alpha.5](https://github.com/vuetifyjs/vuetify-loader/compare/vuetify-loader@2.0.0-alpha.4...vuetify-loader@2.0.0-alpha.5) (2021-10-03)


### Bug Fixes

* normalise windows paths ([706913d](https://github.com/vuetifyjs/vuetify-loader/commit/706913da0a865643019db9b2ee627c0400d9cbaa)), closes [#205](https://github.com/vuetifyjs/vuetify-loader/issues/205)
* resolve script setup in production ([a9fe02a](https://github.com/vuetifyjs/vuetify-loader/commit/a9fe02acfacf5f7474096370315e53c9501a9721)), closes [#199](https://github.com/vuetifyjs/vuetify-loader/issues/199)



## [2.0.0-alpha.4](https://github.com/vuetifyjs/vuetify-loader/compare/vuetify-loader@2.0.0-alpha.3...vuetify-loader@2.0.0-alpha.4) (2021-09-17)


### Bug Fixes

* use find-cache-dir, normalise dos paths ([990ee15](https://github.com/vuetifyjs/vuetify-loader/commit/990ee15ae49f331ff2d59b5cf00829ac32eb4ecd)), closes [#202](https://github.com/vuetifyjs/vuetify-loader/issues/202)



## [2.0.0-alpha.3](https://github.com/vuetifyjs/vuetify-loader/compare/vuetify-loader@2.0.0-alpha.2...vuetify-loader@2.0.0-alpha.3) (2021-09-11)


### Features

* implement styles options ([f0cb894](https://github.com/vuetifyjs/vuetify-loader/commit/f0cb89494776369ab510e7597d0dfb126015fa6b))


### Bug Fixes

* support components with no template ([033040b](https://github.com/vuetifyjs/vuetify-loader/commit/033040b27c7417ce4bba968d59688d7559e48812)), closes [#199](https://github.com/vuetifyjs/vuetify-loader/issues/199)



## [2.0.0-alpha.2](https://github.com/vuetifyjs/vuetify-loader/compare/vuetify-loader@2.0.0-alpha.1...vuetify-loader@2.0.0-alpha.2) (2021-08-31)


### Bug Fixes

* add loader-shared to dependencies ([f420076](https://github.com/vuetifyjs/vuetify-loader/commit/f42007636496aa3fc63adb7fc446c37af2f82a43))



## 2.0.0-alpha.1 (2021-08-30)


### Features

* implement autoImport plugin ([163ff7f](https://github.com/vuetifyjs/vuetify-loader/commit/163ff7f25c2e8cb65bc6461f4399b52e53b77612))
