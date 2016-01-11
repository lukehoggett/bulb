var gulp = require('gulp'),
  babel = require('gulp-babel'),
  runSequence = require('run-sequence'),
  runElectron = require("gulp-run-electron"),
  rename = require('gulp-rename'),
  electron  = require('gulp-atom-electron'),
  del = require('del'),
  exec = require('child_process').exec;

gulp.task('transpile:app', function() {
  return gulp.src('main/index.es6.js')
    .pipe(babel())
    .pipe(rename('index.js'))
    .pipe(gulp.dest('main'));
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

// gulp.task('default', ['transpile:app']);
