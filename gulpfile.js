// gulpfile.js
// scss + es6 + twig

// common packages
// load packages and assign them semantic names

const { existsSync, readFileSync } = require('fs')
const gulp = require('gulp')
const plumber = require('gulp-plumber')
const rename = require('gulp-rename')
const maps = require('gulp-sourcemaps')
const argv = require('yargs').argv

// dotenv
// load env config file

require('dotenv').config({
  path:
    argv.env && existsSync(`./.env.${argv.env}`)
      ? `./.env.${argv.env}`
      : './.env',
})

const { BROWSER_SYNC_PROXY, DIST_DIR } = process.env

// tasks: templates
// compile twig templates

const twig = require('gulp-twig')
const data = require('gulp-data')
const beautify = require('gulp-beautify')

const templates = () => {
  return gulp
    .src([
      'src/templates/**/*.twig',
      '!src/templates/components/**',
      '!src/templates/layout/**',
    ])
    .pipe(plumber())
    .pipe(
      data(({ path }) => {
        const mock = path
          .replace('templates', 'templates/mock')
          .replace('.twig', '.json')
        if (existsSync(mock)) {
          return {
            base: process.env.BASE_URL,
            ...JSON.parse(readFileSync(mock).toString()),
          }
        }
      })
    )
    .pipe(twig())
    .pipe(beautify.html())
    .pipe(gulp.dest(DIST_DIR))
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
    .pipe(postcss([require('autoprefixer')()]))
    .pipe(csso())
    .pipe(rename({ suffix: '.min' }))
    .pipe(maps.write('.'))
    .pipe(gulp.dest(`${DIST_DIR}/assets`))
}

exports.scss = scss

// tasks: js
// compiles js using webpack

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

const icons = () => {
  return gulp
    .src('src/icons/*.svg')
    .pipe(plumber())
    .pipe(svgo({ removeAttrs: { attrs: '(stroke|fill)' } }))
    .pipe(sprite({ mode: { symbol: { dest: '.', sprite: 'icons.svg' } } }))
    .pipe(gulp.dest(`${DIST_DIR}/assets`))
}

exports.icons = icons

// tasks: images
// compress images with squoosh

const { extname } = require('path')
const squoosh = require('gulp-squoosh')

const images = () => {
  const options = { quality: 75 }
  return gulp
    .src('src/images/**/*.{png,jpg}')
    .pipe(plumber())
    .pipe(
      squoosh(({ filePath }) => ({
        encodeOptions: {
          webp: options,
          ...(extname(filePath) === '.png'
            ? { oxipng: options }
            : { mozjpeg: options }),
        },
      }))
    )
    .pipe(gulp.dest(`${DIST_DIR}/assets`))
}

exports.images = images

// tasks: copy
// copies static assets into dist directory

const copy = () => {
  return gulp.src('public/**/*').pipe(gulp.dest(DIST_DIR))
}

exports.copy = copy

// watch: gulp -w
// watches for file changes and runs specific tasks

if (argv.w) {
  argv._.forEach((task) => {
    if (task === 'copy') return gulp.watch('public/**/*', exports[task])
    gulp.watch([`src/${task}/**/*`], exports[task])
  })
}

// serve: gulp -s
// runs browser-sync server

const server = require('browser-sync')

if (argv.s) {
  const proxy = BROWSER_SYNC_PROXY

  server.create().init({
    open: argv.open,
    files: [`${DIST_DIR}/**/*.*`],
    server: proxy ? false : DIST_DIR,
    watch: argv.w,
    proxy,
  })
}
