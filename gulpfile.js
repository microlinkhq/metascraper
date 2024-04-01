'use strict'

const postcss = require('gulp-postcss')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const gulp = require('gulp')

const src = {
  css: ['src/css/style.css'],
  js: ['src/js/main.js']
}

const dist = {
  path: 'static',
  name: {
    css: 'style',
    js: 'main'
  }
}

const styles = () =>
  gulp
    .src(src.css)
    .pipe(concat(`${dist.name.css}.min.css`))
    .pipe(
      postcss([
        require('postcss-focus'),
        require('cssnano')({
          preset: require('cssnano-preset-advanced')
        })
      ])
    )
    .pipe(gulp.dest(dist.path))

const scripts = () =>
  gulp
    .src(src.js)
    .pipe(concat(`${dist.name.js}.min.js`))
    .pipe(uglify())
    .pipe(gulp.dest(dist.path))

const build = gulp.parallel(styles, scripts)

function watch () {
  gulp.watch(src.css, styles)
  gulp.watch(src.js, scripts)
}

module.exports.default = gulp.series(build, watch)
module.exports.build = build
module.exports.watch = watch
