'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');
const rename = require('gulp-rename');
console.info('Electron path', `${process.cwd()}/node_modules/electron-prebuilt/dist/electron`);
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
    // ESLint ignores files with 'node_modules' paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(['main/**/*.js','!node_modules/**'])
        // eslint() attaches the lint output to the 'eslint' property
        // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format());
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        // .pipe(eslint.failAfterError());
});

gulp.task('lint:browser', () => {
    // ESLint ignores files with 'node_modules' paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(['browser/**/*.js','!node_modules/**'])
        // eslint() attaches the lint output to the 'eslint' property
        // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format());
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        // .pipe(eslint.failAfterError());
});

gulp.task('lint', ['lint:main', 'lint:browser']);

gulp.task('transpile:app', ['lint'], () => {
  console.info('Transpiling');
  return gulp.src('main/src/*.es6.js')
    .pipe(babel())
    .pipe(rename(function (path) {
      path.basename = path.basename.replace('.es6', '');
    }))
    .pipe(gulp.dest('main/dist'));
});

gulp.task('serve', ['transpile:app'], () => {
  console.info('Starting Electron...');
  // Start browser process
  electronServer.start();
  
  // console.info('Electron connect', electronServer);
  // Restart browser process
  gulp.watch(['main/src/*.js'], electronServer.restart());

  // Reload renderer process
  gulp.watch(['browser/index.html', 'browser/app/**/*.js', 'browser/css/**/*'], electronServer.reload);
});


// gulp.task('clean', function(){
//     return del('package', {force: true});
// });
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
//     return runSequence('clean', 'transpile:app', 'copy:app','build');
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

gulp.task('default', ['transpile:app']);
