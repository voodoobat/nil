
// gulpfile.js
// scss + es6 + posthtml
// -------------------------------------------------------------------

// common packages
// load packages and assing them semantic names

const gulp = require('gulp')
const merge = require('merge-stream')
const plumber = require('gulp-plumber')
const rename = require('gulp-rename')
const maps = require('gulp-sourcemaps')
const gulpif = require('gulp-if')
const argv = require('yargs').argv


// tasks: html
// transform tempates with posthtml

const posthtml = require('gulp-posthtml')

gulp.task('html', () => {
  const root = './src/html'

  gulp.src([
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
    .pipe(gulp.dest('static'))
})


// tasks: css
// compiles scss, apply postcss plugins and minify css

const sass = require('gulp-sass')
const postcss = require('gulp-postcss')
const csso = require('gulp-csso')

gulp.task('scss', () => {
  gulp.src(['src/scss/*.scss'])
    .pipe(plumber())
    .pipe(maps.init())
    .pipe(sass({ includePaths: ['./node_modules'] }))
    .pipe(postcss([
      require('postcss-assets')({ basePath: 'static/assets/images' }),
      require('autoprefixer')(['last 3 versions', 'ie >= 11'])
    ]))
    .pipe(gulpif(!argv.env || argv.env != 'dev', csso()))
    .pipe(rename({ suffix: '.min' }))
    .pipe(maps.write('.'))
    .pipe(gulp.dest('static/assets'))
})


// tasks: js
// transforms es6 to es5 and minify js

const uglify = require('gulp-uglify')
const browserify = require('gulp-browserify')
const include = require('gulp-include')

gulp.task('js', () => {
  merge(
    gulp.src(['src/js/vendor.js'])
      .pipe(maps.init())
      .pipe(include({ includePaths: ['./node_modules'] }))
      .pipe(maps.write()),
    gulp.src(['src/js/theme.js'])
      .pipe(plumber())
      .pipe(browserify({
        transform: ['babelify'],
        debug: true
      }))
  )
    .pipe(maps.init({ loadMaps: true }))
    .pipe(gulpif(!argv.env || argv.env != 'dev', uglify()))
    .pipe(rename({ suffix: '.min' }))
    .pipe(maps.write('.'))
    .pipe(gulp.dest('static/assets'))
})


// watch: gulp -w
// watches for file changes and runs specific tasks

if (argv.w) (() => {
  argv._.forEach(task => gulp.watch(
    `src/${task}/**/*`, [task]
  ))
})()


// serve: gulp -s
// runs browser-sync server

const server = require('browser-sync').create()

if (argv.s) (() => {
  server.init({
    open: argv.open,
    server: !argv.proxy ? 'static' : false,
    proxy: argv.proxy
  })

  argv.w && gulp.watch([
    './**/*.html',
    './**/*.min.css',
    './**/*.min.js'
  ], server.reload)
})()
