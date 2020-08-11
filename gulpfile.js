// gulpfile.js
// scss + es6 + posthtml
// -------------------------------------------------------------------

// common packages
// load packages and assing them semantic names

const gulp = require('gulp')
const plumber = require('gulp-plumber')
const rename = require('gulp-rename')
const maps = require('gulp-sourcemaps')
const gulpif = require('gulp-if')
const argv = require('yargs').argv


// tasks: html
// transform tempates with posthtml

const posthtml = require('gulp-posthtml')

const html = () => {
  const root = 'src/html'

  return gulp.src([
    'src/html/**/*.html',
    '!src/html/inc/**'
  ])
    .pipe(plumber())
    .pipe(posthtml([
      require('posthtml-extend')({ root }),
      require('posthtml-include')({ root }),
      require('posthtml-expressions')(),
      require('posthtml-beautify')(),
    ]))
    .pipe(gulp.dest('public'))
}

exports.html = html


// tasks: scss
// compiles scss, apply postcss plugins and minify css

const sass = require('gulp-sass')
const postcss = require('gulp-postcss')
const csso = require('gulp-csso')

const scss = () => {
  return gulp.src(['src/scss/*.scss'])
    .pipe(plumber())
    .pipe(maps.init())
    .pipe(sass({ includePaths: ['./node_modules'] }))
    .pipe(postcss([
      require('postcss-assets')({ basePath: 'static/assets/images' }),
      require('autoprefixer')()
    ]))
    .pipe(gulpif(!argv.fast, csso()))
    .pipe(rename({ suffix: '.min' }))
    .pipe(maps.write('.'))
    .pipe(gulp.dest('public/assets'))
}

exports.scss = scss


// tasks: js
// transforms es6 to es5 and minify js

const rollup = require('rollup')

const js = () => {
  const plugins = [
    require('@rollup/plugin-babel').babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-env']
    })
  ]

  if (!argv.fast) plugins.push(
    require('rollup-plugin-uglify').uglify({})
  )

  return rollup.rollup({
    input: 'src/js/theme.js',
    plugins
  }).then(result => result.write({
    file: 'public/assets/theme.min.js',
    format: 'iife',
    sourcemap: true
  }))
}

exports.js = js


// watch: gulp -w
// watches for file changes and runs specific tasks

if (argv.w) argv._.forEach(task => gulp.watch(
  `src/${task}/**/*.${task}`, exports[task]
))


// serve: gulp -s
// runs browser-sync server

const fs = require('fs')
const server = require('browser-sync')

if (argv.s) fs.readFile('.proxy', 'utf8', (e, proxy) => {

  server.create().init({
    open: argv.open,
    server: !proxy ? 'public' : false,
    watch: argv.w,
    proxy: proxy,
    files: [
      'public/**/*.css',
      'public/**/*.html',
      'public/**/*.js'
    ]
  })
})
