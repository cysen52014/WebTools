var gulp = require('gulp');
var path = require('path');
var prompt = require('gulp-prompt');
var readFiles = require('./gulp/readFiles.js');
var babelify = require("babelify");
var pngquant = require('imagemin-pngquant');
var tinypng = require('gulp-tinypng');
var S = require("./gulp/Db");

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});
var browserSync = require('browser-sync').create();
var appName = S(null,false);

//创建多层文件夹 异步

var conf = {
	"paths" : {
		"release" : "./release/",
		"project" : "./project/",
		"tmp"    :  "./.tmp"
	}
};

// var jsFilter = $.filter('**/*.js', {restore: true});
// var cssFilter = $.filter('**/*.css', { restore: true });
// var assets;
var files = [
        path.join(conf.paths.tmp, '/serve/'+appName.name+'/*.html'),
        path.join(conf.paths.tmp, '/serve/'+appName.name+'/css/**/*'),
        path.join(conf.paths.tmp, '/serve/'+appName.name+'/js/**/*.js'),
        path.join(conf.paths.tmp, '/serve/'+appName.name+'/fonts/**/*'),
        path.join(conf.paths.tmp, '/serve/'+appName.name+'/images/**/*')
];

function isOnlyChange(event) {
  return event.type === 'changed';
}

function errorHandler(title) {

  return function(err) {
    gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
    this.emit('end');
  };
};

gulp.task('create',function(){
	return gulp.src('./')
	.pipe(prompt.prompt({
      type: 'input',
      name: 'name',
      message: 'enter your app name'
    }, function (res) {
    	gulp.start('clean-tmp');
        readFiles(res.name, '0777', function(res){
             console.log("app create")
        });
        
    }));
})

gulp.task('changeApp',function(){
	return gulp.src('./')
	.pipe(prompt.prompt({
      type: 'input',
      name: 'name',
      message: 'enter change app name'
    }, function (res) {
    	gulp.start('clean-tmp');
        var data = {
            "name" : res.name
        }
        S(data,true,function(){
        	appName = res.name;
        	//gulp.start('build');	 
        });
        
    }));
})


gulp.task('scripts', function () { 
	var src = path.join(conf.paths.project, appName.name+'/js/main.js');
	return  gulp.src(src)
	    .pipe($.plumber({errorHandler: $.notify.onError('Error: <%= error.message %>')}))
	    .pipe($.browserify({
	    	transform : ['babelify']
	    }))
		.pipe($.uglify())
		.pipe($.rename({suffix: '.min'}))   //rename压缩后的文件名
	    .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/'+appName.name+'/js')));
})

gulp.task('images', function () { 
	var src = [path.join(conf.paths.project, appName.name+'/images/**/*'),path.join(conf.paths.project, appName.name+'/css/img/*')];
	var bimages = $.filter(path.join(conf.paths.project, appName.name+'/images/**/*'), { restore: true });
    var cimg = $.filter(path.join(conf.paths.project, appName.name+'/css/img/*'), { restore: true });
	return  gulp.src(src)
		        .pipe(bimages)
			    .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/'+appName.name+'/images')))
			    .pipe(bimages.restore)
			    .pipe(cimg)
		        .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/'+appName.name+'/css/img')))
})


gulp.task('imagemin', function () {
    var src = [path.join(conf.paths.tmp, '/serve/'+appName.name+'/images/**/*'),path.join(conf.paths.tmp, '/serve/'+appName.name+'/css/img/*')];
	var bimages = $.filter(path.join(conf.paths.tmp, '/serve/'+appName.name+'/images/**/*'), { restore: true });
    var cimg = $.filter(path.join(conf.paths.tmp, '/serve/'+appName.name+'/css/img/*'), { restore: true });
	return  gulp.src(src)
		        .pipe($.cache(tinypng('dqw9JqgRzlaKNVJVsBzlb-mCJf_E4mxQ')))
		        .pipe(bimages)
			    .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/'+appName.name+'/images')))
			    .pipe(bimages.restore)
			    .pipe(cimg)
		        .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/'+appName.name+'/css/img')))
})

gulp.task('fonts', function () {
	var src = path.join(conf.paths.project, appName.name+'/fonts/**/*');
	return gulp.src(src)
               .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/'+appName.name+'/fonts')));
})

gulp.task('html', function () { 
	var src = path.join(conf.paths.project, appName.name+'/*.html');
	return  gulp.src(src)
		        .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/'+appName.name+'/')))
})

gulp.task('styles', function () { 
	var src = path.join(conf.paths.project, appName.name+'/css/*.css');
	return   gulp.src(src)
			     .pipe($.plumber({errorHandler: $.notify.onError('Error: <%= error.message %>')}))
			     .pipe($.if('*.less',$.less()))
			     .pipe($.autoprefixer())
			     .pipe($.concat('style.css'))
			     .pipe($.minifyCss({ processImport: false }))
			     .pipe($.rename({suffix: '.min'}))   //rename压缩后的文件名
			     .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/'+appName.name+'/css')))
})

gulp.task('watch', function () {

  gulp.watch(path.join(conf.paths.project, appName.name+'/*.html'), function(event){
  	 gulp.start('html'); 
  });
  gulp.watch(path.join(conf.paths.project, appName.name+'/css/*.css'), function(event){
  	 gulp.start('styles'); 
  });
  gulp.watch(path.join(conf.paths.project, appName.name+'/css/img/*.{jpg,png,gif}'), function(event){
  	 gulp.start('images'); 
  });
  gulp.watch(path.join(conf.paths.project, appName.name+'/js/**/*'), function(event){
  	 if(isOnlyChange(event)) {
        gulp.start('scripts');
     }	 
  });
  gulp.watch(path.join(conf.paths.project, appName.name+'/fonts/**/*'), function(event){
  	 gulp.start('fonts');	 
  });
  gulp.watch(path.join(conf.paths.project, appName.name+'/images/**/*'), function(event){
  	 gulp.start('images'); 
  });


});



gulp.task('serve',['watch'],function () {

	browserSync.init({
		files : files,
		startPath: '/',
        server: path.join(conf.paths.tmp, '/serve/'+appName.name+'/')
    });

    gulp.on("change", browserSync.stream);
})

gulp.task('clean-tmp',['cleanCash'], function () {
	var src = path.join(conf.paths.tmp, '');
	return gulp.src(src).pipe($.clean());
})

gulp.task('cleanCash', function (done) {  
    return $.cache.clearAll(done);  
});  

gulp.task('clean',['cleanCash'], function () {
	var tmpsrc = path.join(conf.paths.tmp, '');
	var psrc = path.join(conf.paths.project, '');
	var rsrc = path.join(conf.paths.release, '');
	gulp.src(tmpsrc).pipe($.clean());
	gulp.src(psrc).pipe($.clean());
	gulp.src(rsrc).pipe($.clean());
})

gulp.task('release',['imagemin'], function () {
	var tmpsrc = path.join(conf.paths.tmp, '/serve/'+appName.name+'/**/*');
	return gulp.src(tmpsrc)
	           .pipe($.zip(appName.name + '.zip'))
	           .pipe(gulp.dest(path.join(conf.paths.release, '/')));
})

gulp.task('build', ['html', 'styles', 'fonts','images','scripts']);
