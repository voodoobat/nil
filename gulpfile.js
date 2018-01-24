
// gulpfile.js
// scss + es6 + ejs
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


// tasks: ejs
// compiles .html from .ejs

const ejs = require('gulp-ejs')

gulp.task('ejs', () => {
  gulp.src([
    'src/ejs/**/*.ejs',
    '!src/ejs/inc{,/**}'
  ])
    .pipe(plumber())
    .pipe(ejs())
    .pipe(rename({ extname:'.html' }))
    .pipe(gulp.dest('static'))
})


// tasks: css
// compiles scss, apply postcss plugins and minify css

const sass = require('gulp-sass')
const postcss = require('gulp-postcss')
const csso = require('gulp-csso')

gulp.task('scss', () => {
  gulp.src('src/scss/*.scss')
    .pipe(plumber())
    .pipe(maps.init())
    .pipe(sass({ includePaths: ['./node_modules'] }))
    .pipe(postcss([
      require('postcss-short')(),
      require('postcss-assets')({ basePath: 'static/assets/images' }),
      require('autoprefixer')(['last 3 version', 'ie >= 11'])
    ]))
    .pipe(gulpif(!argv.dev, csso()))
    .pipe(rename({ suffix: '.min' }))
    .pipe(maps.write('.'))
    .pipe(gulp.dest('static/assets'))
})


// tasks: js
// transforms es6 to es5 and minify js

const uglify = require('gulp-uglify')
const browserify = require('gulp-browserify')
const include = require('gulp-include')
const concat = require('gulp-concat')

gulp.task('js', () => {
  merge(
    gulp.src('src/js/vendor.js')
      .pipe(plumber())
      .pipe(maps.init())
      .pipe(include({ includePaths: ['./node_modules'] })),
    gulp.src('src/js/theme.js')
      .pipe(plumber())
      .pipe(maps.init())
      .pipe(browserify({ transform: ['babelify'] }))
  )
    .pipe(gulpif(!argv.dev, uglify()))
    .pipe(concat('theme.min.js'))
    .pipe(maps.write('.'))
    .pipe(gulp.dest('static/assets'))
})


// watch: gulp -w
// watches for file changes and runs specific tasks

if (argv.w) (() => {
  const tasks = argv._

  tasks.forEach(task => gulp.watch(
    `src/${task}/**/*.*`, [task]
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

  gulp.watch([
    './**/*.html',
    './**/*.min.css',
    './**/*.min.js'
  ], server.reload)
})()

