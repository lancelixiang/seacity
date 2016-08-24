/**
 * Created by Administrator on 2016/7/4.
 */
var gulp = require('gulp');
var del  = require('del');
//自动运行任务
var run          = require('run-sequence');
var concat       = require('gulp-concat');
var uglify       = require('gulp-uglify');
var rename       = require('gulp-rename');
var cssmin       = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var header       = require('gulp-header');
//自动刷新浏览器
var browserSync = require('browser-sync').create();
var reload      = browserSync.reload;

//配置文件
var config = require('./config.json');

//添加头部注释
function getHeader () {
    var pkg = require('./package.json');
    var template = ['/**',
        ' * <%= pkg.name %> - <%= pkg.description %>',
        ' * @version v<%= pkg.version %>',
        ' * @link <%= pkg.homepage %>',
        ' * @license <%= pkg.license %>',
        ' */',
        ''
    ].join('\n');
    return header(template, {
        pkg: pkg
    });
}
//js文件压缩
gulp.task('build:js',function(){
    gulp.src([
            config.path.js + '/core.js',
            config.path.lib + '/zepto.js',
            config.path.js + '/function/*.js',
            config.path.js + '/jq_plugin/jq-extend.js',
            config.path.js + '/jq_plugin/*.js',
            config.path.js + '/module/*.js']
        )
        .pipe( concat('base.js') )
        .pipe( gulp.dest(config.build.js) )
        .pipe(uglify({
            mangle: {except: ['$']},//排除混淆关键字
            compress: true
        }))
        .pipe( getHeader() )
        .pipe( rename({suffix: '.min'}) )
        .pipe( gulp.dest( config.build.js ))
        .pipe( gulp.dest( config.dist.js ));

});

//css文件压缩
gulp.task('build:css',function(){
    gulp.src([
            config.path.css + '/reset.css',
            config.path.css + '/**/*.css']
        )
        .pipe( concat('base-unmin.css') )
/*        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0']
        }))*/
        .pipe( gulp.dest( config.build.css ))
        .pipe( cssmin() )
        .pipe( getHeader() )
        .pipe( rename('base.css') )
        .pipe( gulp.dest( config.build.css ))
        .pipe( gulp.dest( config.dist.css ));
})


//清理目录
gulp.task('build:clean', function() {
    return del([
        config.build.css,
        config.build.js,
    ]);
});


//build所有配置的任务
gulp.task('build', function(cb) {
    run(
        'build:clean',
        ['build:js','build:css'],cb);
});

//文件改动，浏览器自动刷新
gulp.task('browserSync',function(){
    browserSync.init({
        server:{
            baseDir : config.path.base //根目录
        },
    })

})

//文件监听 触发任务
gulp.task('watch',function(){
    gulp.watch('./js/**/*.js',['build:js']);
    gulp.watch('./css/**/*.css',['build:css']);
    gulp.watch(config.path.base + "/**/*.html").on('change',reload);
    gulp.watch(config.path.base + "/**/*.css" ).on('change',reload);
})

gulp.task('default',['build','browserSync','watch']);






