var gulp        = require('gulp'),
	less        = require('gulp-less'),
	uglify      = require('gulp-uglify'),
	minifycss   = require('gulp-minify-css'),
	sprite      = require('gulp.spritesmith'),
	postcss      = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),

	clean       = require('gulp-clean'),
	plumber     = require('gulp-plumber'),
	concat      = require('gulp-concat'),
	cache       = require('gulp-cache'),
	path       	= {
					dev: 'dev/',
					dest: 'dest/'
				};
var px2rem = require('postcss-px2rem');
var version = new Date().getTime();
var browserSync = require("browser-sync").create();
var reload = browserSync.reload;

// 静态服务器 + 监听 scss/html 文件
gulp.task('serve', ['less', 'copy:jsMerge','copy:jsDefault'], function() {

    browserSync.init({
        proxy: "http://yyweb/h5/doc",
        port: 9090
    });
    gulp.watch("path.dest+'css'", ['less']).on('change', reload);
    gulp.watch("../dev/less/*.less").on('change', reload);
    gulp.watch(path.dev + 'js/**.js', ['copy:jsMerge','copy:jsDefault']).on('change', reload);
    gulp.watch("doc/*.html").on('change', reload);

});
//less
gulp.task('less', function () {
	var processors = [px2rem({remUnit: 75})];
    gulp
		.src(path.dev+'less/styles.less')
		.pipe(plumber(function(error){
			console.log(error);
			console.log('--------------------------  less Syntax Error! --------------------------');
		}))
		.pipe(less())
		.pipe(postcss(processors))
		.pipe(postcss([ autoprefixer({ browsers: [
			'last 20 versions'
		] }) ]))
		.pipe(minifycss())
        .pipe(gulp.dest(path.dest+'css'))
        .pipe(reload({ stream: true }));
});

//清理图片
gulp.task('clean', ['clean:imagesDefault', 'clean:imagesSprite','clean:jsMerge']);

gulp.task('clean:jsMerge', function() {
	gulp
		.src([
			path.dest+'js/merge/**/*'
		], {read: false})
		.pipe(clean({force: true}));
});

gulp.task('clean:jsDefault', function() {
	gulp
		.src([
			path.dest+'js/default/**/*'
		], {read: false})
		.pipe(clean({force: true}));
});

gulp.task('clean:imagesDefault', function() {
	gulp
		.src([
			path.dest+'img/default/*.{png,jpg,jpeg,gif}'
		], {read: false})
		.pipe(clean({force: true}));
});

gulp.task('clean:imagesSprite', function() {
	gulp
		.src([
			path.dest+'img/sprite/*.{png,jpg}'
		], {read: false})
		.pipe(clean({force: true}));
});



//复制文件
gulp.task('copy', ['copy:jsMerge', 'copy:jsDefault', 'copy:images']);

gulp.task('copy:jsMerge', function(){
	gulp
		.src([path.dev +'js/default/jquery.min.js',path.dev +'js/merge/**.js'])
		.pipe(plumber(function(error){
			console.log(error);
			console.log('--------------------------  js Syntax Error! --------------------------');
		}))
		.pipe(concat('all.js'))
		.pipe(uglify())
		.pipe(gulp.dest(path.dest+'js/'));
});

gulp.task('copy:jsDefault',function(){
    gulp
		.src([path.dev+'js/default/**.js','!'+path.dev+'js/default/jquery.min.js'])
		.pipe(plumber(function(error){
			console.log(error);
			console.log('--------------------------  js Syntax Error! --------------------------');
		}))
		.pipe(uglify())
		.pipe(gulp.dest(path.dest+'js/'));
})

gulp.task('copy:images', function(){
	gulp
		.src(path.dev+'img/default/**/*.{png,jpg,jpeg,gif}')

		.pipe(gulp.dest(path.dest+'img/'));
})


//sprite
//合并png
gulp.task('sprite', ['clean:imagesSprite'], function () {	
	var spriteData = gulp
						.src(path.dev+'img/sprite/**.png')
						.pipe(sprite({
							imgName: 'sprite.png',
							cssName: 'sprite-png.css',
							cssTemplate: path.dev+'less/core/handlebarsStr.css.handlebars',
							imgPath: '../img/sprite.png',
							padding: 10
						}));
		spriteData
			.img

			.pipe(gulp.dest(path.dest+'img/'));
		
		spriteData
			.css
			.pipe(gulp.dest(path.dev+'less/core/'));
});

gulp.task('spriteChange', ['clean:imagesSprite'], function () {	
	var spriteData = gulp
						.src(path.dev+'img/sprite/**.png')
						.pipe(sprite({
							imgName: 'sprite.png',
							cssName: 'sprite-png.css',
							cssTemplate: path.dev+'less/core/handlebarsStr.css.handlebars',
							imgPath: '../img/sprite.png?v'+version,
							padding: 10
						}));
		spriteData
			.img

			.pipe(gulp.dest(path.dest+'img/'));
		
		spriteData
			.css
			.pipe(gulp.dest(path.dev+'less/core/'));
});

gulp.task('default', ['clean','less','copy', 'sprite','serve'], function(){
	
	//监听不合并图片
	gulp.watch(path.dev+'img/default/**/*.*', ['copy:images']);
	
	//监听sprite png
	gulp.watch(path.dev+'img/sprite/*.png', ['sprite']);
	
	//监听js
	gulp.watch(path.dev+'js/merge/**.js', ['copy:jsMerge']);
	gulp.watch(path.dev+'js/default/**.js', ['copy:jsDefault']);

    //监听less
    gulp.watch(path.dev+'less/**/*.*', ['less']);
	
});