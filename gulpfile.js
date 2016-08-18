'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');
const rename = require('gulp-rename');
const debug = require('gulp-debug');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const minify = require('gulp-minify-css');
const merge = require('merge-stream');

// const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
// const ngAnnotate = require('gulp-ng-annotate');
const del = require('del');
const electronServer = require('electron-connect').server.create({
  // electron: `${process.cwd()}/node_modules/electron-prebuilt/`,
  verbose: true,
  spawnOpt: {
    env: {
      execPath: '/home/luke/.nvm/versions/node/v6.2.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games',
    },
    uid: 0,
    gid: 0
  }
});
// const runSequence = require('run-sequence');
// const del = require('del');
// const exec = require('child_process').exec;

gulp.task('default', ['main', 'renderer']);

gulp.task('renderer', ['lint:renderer', 'styles']);
gulp.task('main', ['transpile:main']);

gulp.task('lint', ['lint:main', 'lint:renderer']);

gulp.task('lint:main', () => {
  return gulp.src([
      'main/**/*.js', 
      '!main/dist/*.js', 
      '!node_modules/**'
    ])
    // .pipe(debug({title: 'linting main file...'}))
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('lint:renderer', () => {
  return gulp.src([
      'renderer/app/**/*.js', 
      '!renderer/jspm_packages/**', 
      '!node_modules/**'
    ])
    // .pipe(debug({title: 'linting renderer file...'}))
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('transpile:main', ['lint:main'], () => {
  return gulp.src('main/src/*.es6.js')
    // .pipe(debug({title: 'transpile main file...'}))
    .pipe(babel())
    .pipe(rename(function (path) {
      path.basename = path.basename.replace('.es6', '');
    }))
    .pipe(gulp.dest('main/dist'));
});

gulp.task('styles', () => {
  let sassOptions = {
    errLogToConsole: true,
    outputStyle: 'expanded'
  };
  return gulp.src(['renderer/styles/*.scss', 'renderer/app/**/*.scss'])
    // .pipe(debug({title: 'transpile renderer file...'}))
    .pipe(sourcemaps.init())  // Process the original sources
    // .pipe(debug({title: 'css renderer sourcemap...'}))
      .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(sourcemaps.write('./renderer/styles/maps')) // Add the map to modified source.
    .pipe(concat('app.css'))
    .pipe(minify())
    .pipe(gulp.dest('renderer/styles/'));
});



// gulp.task('minify:renderer', () => {
//   return gulp.src(['renderer/app/**/*.js'])
//     .pipe(debug({title: 'minify renderer file...'}))
//     // .pipe(sourcemaps.init())
//       .pipe(uglify())
//       .pipe(debug({title: 'uglify renderer file...'}))
//       .pipe(rename({ extname: '.min.js' }))
//     // .pipe(sourcemaps.write())
//     .pipe(gulp.dest('renderer/app'));
//   
// });



// gulp.task('annotate', () => {
//   return gulp.src('broswer/app/**/*.js')
//     .pipe(ngAnnotate())
//     .pipe(gulp.dest('broswer/app'));
// });

gulp.task('serve', ['transpile:main'], () => {
  // Start renderer process
  electronServer.start(() => {
    // console.info(arguments);
  });
  
  // console.info('Electron connect', electronServer);
  // Restart renderer process
  gulp.watch(['main/src/*.js'], electronServer.restart());

  // Reload renderer process
  gulp.watch(['renderer/index.html', 'renderer/app/**/*.js', 'renderer/css/**/*'], electronServer.reload);
});


gulp.task('clean', function(){
    return del('main/dist', {force: true});
});


// 
// gulp.task('copy:app', ['clean'], function(){
//     return gulp.src(['main/**/*', 'renderer/**/*', 'package.json'], {base: '.'})
//         .pipe(gulp.dest('package'));
// });


// gulp.task('build', function() {
//   return gulp.src('package/**')
//         .pipe(electron({
//           version: '0.30.3',
//           // build for OSX
//           platform: 'darwin' }))
//         .pipe(electron.zfsdest('dist/es6-ng-electron.zip'));
// });

// gulp.task('build-app', function(){
//     return runSequence('clean', 'transpile:main', 'copy:app','build');
// });

// gulp.task('sudo_run', ['default'], function() {
//   exec('sudo npm start', function() {
//     console.log(stdout);
//     console.log(stderr);
//     cb(err);
//   });
// });

// gulp.task('run', ['default'], function() {  
//   return gulp.src('.')
//         .pipe(runElectron());
//   
//   // return run('electron .').exec();
// });

// gulp.task('run-noble', function(cb) {
//     exec('node noble.js', function (err, stdout, stderr) {
//         console.log(stdout);
//         console.log(stderr);
//         cb(err);
//     });
// });

// gulp.watch(['**/*.js', '**/*.html'], ['run', runElectron.rerun]);
