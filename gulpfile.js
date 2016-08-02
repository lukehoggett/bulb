'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');
const rename = require('gulp-rename');
const debug = require('gulp-debug');
const del = require('del');
const electronServer = require('electron-connect').server.create({
  electron: `${process.cwd()}/node_modules/electron-prebuilt/`,
  verbose: true/*,
  spawnOpt: {
    uid: 0,
    gid: 0
  }*/
});
// const runSequence = require('run-sequence');
// const del = require('del');
// const exec = require('child_process').exec;

gulp.task('lint:main', () => {
    return gulp.src([
        'main/**/*.js', 
        '!main/dist/*.js', 
        '!node_modules/**'
      ])
      .pipe(debug({title: 'linting main file...'}))
      .pipe(eslint())
      .pipe(eslint.format());
});

gulp.task('lint:browser', () => {
    return gulp.src([
        'browser/app/**/*.js', 
        '!browser/jspm_packages/**', 
        '!node_modules/**'
      ])
      .pipe(debug({title: 'linting main file...'}))
      .pipe(eslint())
      .pipe(eslint.format());
});

gulp.task('lint', ['lint:main', 'lint:browser']);

gulp.task('transpile:main', ['lint'], () => {
  console.info('Transpiling');
  return gulp.src('main/src/*.es6.js')
    .pipe(debug({title: 'transpile file...'}))
    .pipe(babel())
    .pipe(rename(function (path) {
      path.basename = path.basename.replace('.es6', '');
    }))
    .pipe(gulp.dest('main/dist'));
});

gulp.task('serve', ['transpile:main'], () => {
  console.info('Starting Electron...');
  // Start browser process
  electronServer.start();
  
  // console.info('Electron connect', electronServer);
  // Restart browser process
  gulp.watch(['main/src/*.js'], electronServer.restart());

  // Reload renderer process
  gulp.watch(['browser/index.html', 'browser/app/**/*.js', 'browser/css/**/*'], electronServer.reload);
});


gulp.task('clean', function(){
    return del('main/dist', {force: true});
});
// 
// gulp.task('copy:app', ['clean'], function(){
//     return gulp.src(['main/**/*', 'browser/**/*', 'package.json'], {base: '.'})
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

gulp.task('default', ['transpile:main']);
