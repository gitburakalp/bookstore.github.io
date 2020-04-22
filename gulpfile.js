var gulp = require('gulp'),
  concat = require('gulp-concat'),
  sass = require('gulp-sass'),
  rename = require('gulp-rename'),
  autoprefixer = require('gulp-autoprefixer'),
  browserSync = require('browser-sync').create(),
  size = require('gulp-size'),
  plumber = require('gulp-plumber'),
  sourcemaps = require('gulp-sourcemaps'),
  browserslist = require('browserslist');

let sassOptions = {
    outputStyle: 'compressed',
  },
  prefixerOptions = {
    grid: true,
    browsers: ['last 2 versions'],
  };

var functionsBrowserSync = function (done) {
    browserSync.init({
      server: {
        baseDir: './src',
      },
      online: true,
    });

    done();
  },
  functionsSass = function () {
    return gulp
      .src('./src/scss/main.scss')
      .pipe(plumber())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sass(sassOptions))
      .pipe(
        size({
          gzip: true,
          showFiles: true,
        }),
      )
      .pipe(
        autoprefixer({
          grid: true,
        }),
      )
      .pipe(
        rename({
          suffix: '.min',
        }),
      )
      .pipe(sourcemaps.write('../sources'))
      .pipe(gulp.dest('./src/css'))
      .pipe(browserSync.stream());
  },
  functionsHtml = function () {
    return gulp.src('./src/**/*.html').pipe(browserSync.stream());
  },
  functionsWatch = function () {
    gulp.watch('./src/scss/**/*.scss', gulp.series('sass'));
    gulp.watch('./src/**/*.js', gulp.series('html'));
    gulp.watch('./src/**/*.html', gulp.series('html'));
  };
  

gulp.task('browser-sync', functionsBrowserSync);
gulp.task('sass', functionsSass);
gulp.task('html', functionsHtml);
gulp.task('watch', functionsWatch);

gulp.task('default', gulp.series('browser-sync', 'html', 'sass', 'watch'));