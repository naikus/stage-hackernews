var gulp = require("gulp"),
    del = require("del"),
    jshint = require("gulp-jshint"),
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    less = require("gulp-less"),
    LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    vsource = require("vinyl-source-stream"),
    eventStream = require("event-stream"),
    connect = require("gulp-connect"),
    browserify = require("browserify"),
    babel = require("gulp-babel"),
    pkg = require("./package.json"),
    fs = require("fs");


var config = {
  src: {
    dir: "src/www/",
    assets: [
      "css/**/*",
      "fonts/**/*",
      "images/**/*",
      "!views/**/*.js",
      "!views/**/*.less",
      "views/**/*",
      "!less"
    ],
    libs: [
      // add libraries here that you want to 'require'
      {name: "activables", path: "lib"},
      {name: "vue", path: "lib"},
      {name: "firebase-service", path: "services"}
    ]
  },
  vendor: [],
  dist: {
    app_dir: "dist/",
    css_dir: "dist/css"
  },
  browserify: {
    debug: false,
    extensions: [
      ".js",
      ".json"
    ]
  }
};

gulp.task("default", function() {
  console.log("Available tasks:");
  console.log([
    "------------------------------------------------------------------------",
    "build           Build webapp in the dest directory",
    "clean           Clean the dest directory",
    "-------------------------------------------------------------------------"
  ].join("\n"));
});


gulp.task("jshint", function() {
  return gulp.src(["src/js", "!src/js/lib"])
      .pipe(jshint())
      .pipe(jshint.reporter("default"));
});


gulp.task("lessc", function() {
  // WARNING!! "add" option MUST be false. For stage.less
  // var prefixer = new LessPluginAutoPrefix({add: false, browsers: ["iOS >= 5"]});
  /*
  gulp.src(config.src.dir + "less/*.theme.less")
        .pipe(less({plugins: [prefixer]}))
        .pipe(gulp.dest(config.dist.css_dir));
  */
  gulp.src(config.src.dir + "app.less")
      .pipe(less(/*{plugins: [prefixer]}*/))
      .pipe(gulp.dest(config.dist.css_dir));
});


gulp.task("clean", function(cb) {
  del([
    config.dist.app_dir
  ], cb);
});


/* Lib Bundle ---------------------------------------------------------------- */
gulp.task("build-libs", function() {
  var b = browserify({
    debug: false
  });

  var deps = pkg.dependencies;
  for(var dep in deps) {
    b.require(dep);
  }

  // Expose additional libs in the js and lib directories
  config.src.libs.forEach(function(lib) {
    b.require("./" + lib.name, {
      basedir: config.src.dir + lib.path,
      expose: lib.name
    });
  });

  b.transform("babelify", {presets: ["es2015"]})
      .bundle().pipe(vsource("lib.js")).pipe(gulp.dest(config.dist.app_dir + "js/"));
});


gulp.task("copy-assets", function() {
  var src = config.src.dir,
      dist = config.dist.app_dir,
      assets = config.src.assets.map(function(a) {
        return a.indexOf("!") === 0 ?
            "!" + config.src.dir + a.substring(1) :
            config.src.dir + a;
      });
  console.log("Copying assets", assets);
  return gulp.src(assets, {base: src}).pipe(gulp.dest(dist));
});


gulp.task("build", ["build-libs", "copy-assets"], function() {
  gulp.start("jshint", "lessc");

  var src = config.src.dir, dist = config.dist.app_dir;

  var b = browserify();
  b.require("./src/www/app.js", {expose: "app"});

  b.transform("babelify", {presets: ["es2015"]})
      .bundle()
      .pipe(vsource("app.js"))
      .pipe(gulp.dest(dist + "js/"));

  // babel transform view js files
  gulp.src(src + "views/**/*.js")
      .pipe(babel({presets: ["es2015"]}))
      .pipe(gulp.dest(dist + "views"));

  // Exclude vendors since we've created a separate bundle for vendor libraries
  var deps = pkg.dependencies;
  for(var dep in deps) {
    b.external(dep);
  }
  config.src.libs.forEach(function(lib) {
    b.external(lib.name);
  });

  return gulp.src([
    src + "*.{html, css, png, jpg}"
  ]).pipe(gulp.dest(dist));

});


gulp.task("server", ["build"], function() {
  connect.server({
    root: "dist",
    post: 8080
  });
});
