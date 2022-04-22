// gulpfile.js
// scss + es6 + templates

// common packages
// load packages and assign them semantic names

const gulp = require('gulp')
const plumber = require('gulp-plumber')
const rename = require('gulp-rename')
const maps = require('gulp-sourcemaps')
const argv = require('yargs').argv

// dotenv
// load env config file

require('dotenv').config({
  path: argv.env && argv.env.length ? `./.env.${argv.env}` : './.env',
})

// tasks: templates
// compile twig templates

const twig = require('gulp-twig')
const beautify = require('gulp-beautify')

const templates = () => {
  return gulp
    .src([
      'src/templates/**/*.twig',
      '!src/templates/components/**',
      '!src/templates/layout/**',
    ])
    .pipe(plumber())
    .pipe(twig())
    .pipe(beautify.html())
    .pipe(gulp.dest('public'))
}

exports.templates = templates

// tasks: scss
// compiles scss, apply postcss plugins and minify css

const sass = require('gulp-sass')(require('sass'))
const postcss = require('gulp-postcss')
const csso = require('gulp-csso')

const scss = () => {
  return gulp
    .src(['src/scss/*.scss'])
    .pipe(plumber())
    .pipe(maps.init())
    .pipe(sass({ includePaths: ['./node_modules'] }))
    .pipe(
      postcss([
        require('postcss-assets')({ basePath: 'public/assets/images' }),
        require('autoprefixer')(),
      ])
    )
    .pipe(csso())
    .pipe(rename({ suffix: '.min' }))
    .pipe(maps.write('.'))
    .pipe(gulp.dest('public/assets'))
}

exports.scss = scss

// tasks: js
// transforms es6 to es5 and minify js

const webpack = require('webpack')

const js = () => {
  return new Promise((resolve, reject) => {
    webpack(require('./webpack.config'), (e, stats) => {
      if (e) return reject(e)
      if (stats.hasErrors()) {
        return reject(new Error(stats.compilation.errors.join('\n')))
      }
      resolve()
    })
  })
}

exports.js = js

// tasks: svg
// create svg sprite

const sprite = require('gulp-svg-sprite')
const svgo = require('gulp-svgo')

const svg = () => {
  return gulp
    .src('src/svg/*.svg')
    .pipe(plumber())
    .pipe(svgo({ removeAttrs: { attrs: '(stroke|fill)' } }))
    .pipe(sprite({ mode: { symbol: { dest: '.', sprite: 'icons.svg' } } }))
    .pipe(gulp.dest('public/assets'))
}

exports.svg = svg

// watch: gulp -w
// watches for file changes and runs specific tasks

if (argv.w) {
  argv._.forEach((task) => {
    gulp.watch(`src/${task}/**/*.*`, exports[task])
  })
}

// serve: gulp -s
// runs browser-sync server

const server = require('browser-sync')

if (argv.s) {
  const proxy = process.env.BROWSERSYNC_PROXY

  server.create().init({
    open: argv.open,
    files: ['public/**/*.*'],
    server: proxy ? false : 'public',
    watch: argv.w,
    proxy,
  })
}
