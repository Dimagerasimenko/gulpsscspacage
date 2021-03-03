let preprocessor = 'scss';

const {src, dest, parallel, series, watch} = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const scss = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const less = require('gulp-less');
const imageMin = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');


function browsersync() {
    browserSync.init({
        server: {baseDir: 'app/'},
        notify: false,
        online: true
    });
}

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.min.js',
        'app/js/app.js'
    ])
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}

function styles() {
    return src('app/' + preprocessor + '/index.' + preprocessor + '')
        .pipe(eval(preprocessor)())
        .pipe(concat('index.css'))
        .pipe(autoprefixer({overrideBrowserslist: ['last 10 versions'], grid: true}))
        .pipe(cleanCSS(( { level: { 1: { specialComments: 0 } }/*, format: 'beautify'*/ } )))
        .pipe(dest('app/css/'))
        .pipe(browserSync.stream())
}

function images() {
    return src('app/images/src/**/*')
        .pipe(newer('app/images/dest/'))
        .pipe(imageMin())
        .pipe(dest('app/images/dest/'))
}

function cleanImg() {
    return del('app/images/dest/**/*', {force: true})
}

function cleandist() {
    return del('dist/**/*')
}

function buildcopy() {
    return src([
        'app/css/**',
        'app/js/**/*min.js',
        'app/images/dest/**/*',
        'app/**/*.html',
    ], { base: 'app' })
        .pipe(dest('dist'))
}

function startWatch() {
    watch(['app/**/*.js',
        '!app/**/*min.js'], scripts)
    watch(['app/**/' + preprocessor + '/**/*'], styles)
    watch('app/**/*.html').on('change', browserSync.reload)
    watch('app/images/src/**/*', images)
}

exports.browsersync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.del = cleanImg;
exports.deldist = cleandist;
exports.build = series(cleandist, styles, scripts, images, buildcopy);
exports.default = parallel(styles, scripts, browsersync, startWatch);
