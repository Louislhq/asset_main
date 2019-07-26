var gulp          = require('gulp'),
    less          = require('gulp-less'), //编译less
    rjs           = require('gulp-requirejs'),
    uglify        = require('gulp-uglify'), //压缩JavaScript文件
    maps          = require('gulp-sourcemaps'),
    minifycss     = require('gulp-minify-css'), //压缩css文件
    sprite        = require('gulp.spritesmith'),
    clean         = require('gulp-clean'), //清除文件
    plumber       = require('gulp-plumber'), //监听错误
    imagemin      = require('gulp-imagemin'), //图片压缩
    cache         = require('gulp-cache'),
    postcss       = require('gulp-postcss'), //css补充
    autoprefixer  = require('autoprefixer'),
    gulpif        = require('gulp-if'), //改变文件夹
    paths         = require('path'),
    browserSync   = require('browser-sync').create(),
    reload        = browserSync.reload,
    path          = {
                        dev: 'dev/',
                        dest: 'dest/'
                    };


//实时更新
gulp.task('server', ['clean'], function() {
    browserSync.init({
        proxy: 'http://fwjd/static/new/doc',
        port: 9090
    });
    gulp.watch('doc/**/*.html').on('change', reload);
    gulp.watch('dev/js/**/*.js').on('change', reload);
});

//less
gulp.task('less', function() {
    gulp
        .src(path.dev + 'less/styles.less')
        .pipe(maps.init())
        .pipe(plumber(function(error) {
            console.log(error);
            console.log('--------------------------  less Syntax Error! --------------------------');
        }))
        .pipe(less())
        // .pipe(minifycss({ compatibility: 'ie7' }))
        .pipe(postcss([autoprefixer({
            browsers: [
                'last 20 versions',
                'Firefox >= 0',
                'ie >= 10'
            ],
            cascade: true,
            remove: false
        })]))
        .pipe(gulp.dest(path.dest + 'css'))
        .pipe(reload({ stream: true }));
});
//js
gulp.task('r', ['clean:js'], function() {
    
    rjs({
        name: 'app/main',
        baseUrl: path.dev + 'js/lib/',
        paths: {
            core: '../core',
            app: '../app',
            jquery:'jquery-2.2.4.min'
        },
        mainConfigFile: path.dev + 'js/config.js',
        out: 'main.js',
        optimize: false
    })
    .pipe(plumber(function(error) {
        console.log(error);
        console.log('--------------------------  rjs Syntax Error! --------------------------');
    }))
    .pipe(uglify())
    .pipe(maps.write('./'))
    .pipe(gulp.dest(path.dest + 'js/app/'));

})
gulp.task('copy:js', ['clean:js'], function() {
    gulp
        .src(path.dev + 'js/config.js')
        .pipe(plumber(function(error) {
            console.log(error);
            console.log('--------------------------  cjs Syntax Error! --------------------------');
        }))
        .pipe(gulp.dest(path.dest + 'js'));
    gulp
        .src(path.dev + 'js/lib/**/*')
        .pipe(plumber(function(error) {
            console.log(error);
            console.log('--------------------------  js Syntax Error! --------------------------');
        }))
        .pipe(gulp.dest(path.dest + 'js/lib/'));
})
    //图片
gulp.task('images', ['clean:images'], function() {
    gulp
        .src(path.dev + 'img/default/**/*.{png,jpg,jpeg,gif}')
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true,
            multipass: true,
        })))
        .pipe(gulp.dest(path.dest + 'img/default/'));
});
//Sprites
gulp.task('sprite:png', ['clean:imagesSprite'], function() {
    gulp
        .src(path.dev+'img/sprite/**.png')
        .pipe(sprite({
            imgName: 'sprite.png',
            cssName: 'sprite-png.css',
            cssTemplate: path.dev+'less/core/handlebarsStr.css.handlebars',
            imgPath: '../img/sprite.png',
            padding: 15
        }))
        .pipe(gulpif('*.css', gulp.dest(path.dev + 'less/core/')))
        .pipe(gulpif('*.png', gulp.dest(path.dest + 'img/')));
});


gulp.task('clean', ['clean:js', 'clean:images', 'clean:imagesSprite'], function() {
    gulp.start('less', 'images', 'sprite:png', 'r', 'copy:js');
});
//清理图片
gulp.task('clean:images', function() {
    return gulp
        .src([
            path.dest + 'img/default/*.{png,jpg,jpeg,gif}'
        ], { read: false })
        .pipe(clean({ force: true }));
});
//清除雪碧图
gulp.task('clean:imagesSprite', function() {
    return gulp
        .src([
            path.dest+'img/sprite/*.{png,jpg}'
        ], { read: false })
        .pipe(clean({ force: true }));
});
//清除js
gulp.task('clean:js', function() {
    return gulp
        .src([
            path.dest + 'js/**/*','!'+path.dest+'js/lib/layui/**'
        ], { read: false })
        .pipe(clean({ force: true }));
});

gulp.task('default', ['clean', 'server'], function() {
    //监听less
    gulp.watch(path.dev + 'less/**', ['less'])
        .on('change', function(event) {
            console.log('File:' + event.path + 'was:' + event.type + ', running tasks……');
        });
    //监听图片
    gulp.watch(path.dev + 'img/default/**/*.*', ['clean:images', 'images'])
        .on('change', function(event) {
            console.log('File:' + event.path + 'was:' + event.type + ', running tasks……');
        });
    //监听sprite
    gulp.watch(path.dev + 'img/sprite/**.png', ['clean:imagesSprite', 'sprite:png'])
        .on('change', function(event) {
            console.log('File:' + event.path + 'was:' + event.type + ', running tasks……');
        });
    // //监听js编译
    gulp.watch(path.dev + 'js/**/*.js', ['clean:js', 'copy:js', 'r'])
        .on('change', function(event) {
            reload({ stream: true });
            console.log('File:' + event.path + 'was:' + event.type + ', running tasks……');
        });
})