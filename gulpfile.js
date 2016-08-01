'use strict';

const gulp = require("gulp");
const babel = require("gulp-babel");
const rename = require("gulp-rename");
console.info("Electron path", `${process.cwd()}/node_modules/electron-prebuilt/dist/electron`);
const electronServer = require('electron-connect').server.create({
  electron: `${process.cwd()}/node_modules/electron-prebuilt/`,
  verbose: true/*,
  spawnOpt: {
    uid: 0,
    gid: 0
  }*/
});
// const runSequence = require("run-sequence");
// const del = require("del");
// const exec = require("child_process").exec;

gulp.task("transpile:app", () => {
  console.info('Transpiling');
  return gulp.src("main/src/*.es6.js")
    .pipe(babel())
    .pipe(rename(function (path) {
      path.basename = path.basename.replace('.es6', '');
    }))
    .pipe(gulp.dest("main/dist"));
});

gulp.task('serve', ['transpile:app'], () => {
  console.info("Starting Electron...");
  // Start browser process
  electronServer.start();
  
  // console.info("Electron connect", electronServer);
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

// gulp.watch(["**/*.js", "**/*.html"], ["run", runElectron.rerun]);

gulp.task("default", ["transpile:app"]);
