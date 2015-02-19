var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

gulp.task('compress', function() {
    gulp.src([
        'public/vendor/angular.js',
        'public/vendor/*.js',
        'public/app.js',
        'public/services/*.js',
        'public/controllers/*.js',
        'public/filters/*.js',
        'public/directives/*.js'
    ])
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public'));
});

gulp.task('watch', function() {
    gulp.watch(['public/app.js', 'public/vendor/*.js', 'public/services/*.js', 'public/controllers/*.js', 'public/filters/*.js', 'public/directives/*.js'], ['compress']);
});

gulp.task('default', ['compress', 'watch']);