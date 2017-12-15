'use strict'

const strip = require('gulp-strip-css-comments')
const prefix = require('gulp-autoprefixer')
const cssnano = require('gulp-cssnano')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
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

gulp.task('css', () => {
  gulp
    .src(src.css)
    .pipe(concat(`${dist.name.css}.min.css`))
    .pipe(prefix())
    .pipe(strip({ all: true }))
    .pipe(cssnano())
    .pipe(gulp.dest(dist.path))
})

gulp.task('js', () => {
  gulp
    .src(src.js)
    .pipe(concat(`${dist.name.js}.min.js`))
    .pipe(uglify())
    .pipe(gulp.dest(dist.path))
})

gulp.task('build', ['css', 'js'])

gulp.task('default', () => {
  gulp.start(['build'])
  gulp.watch(src.css, ['css'])
  gulp.watch(src.js, ['js'])
})
