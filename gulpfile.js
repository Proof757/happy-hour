// Call required plugins
var gulp = require("gulp"),
    browserSync = require("browser-sync"),
    changed = require("gulp-changed"),
    plumber = require("gulp-plumber"),
    notify = require("gulp-notify"),
    sourcemaps = require("gulp-sourcemaps"),
    autoprefixer = require("gulp-autoprefixer"),
    scsslint = require("gulp-scss-lint"),
    sass = require("gulp-sass"),
    minifyCSS = require("gulp-minify-css"),
    jshint = require("gulp-jshint"),
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    imagemin = require("gulp-imagemin");


// Set project paths
// 
// Scripts var sets JS load order for Concat.
// Ex: ["vendor/pluginName/plugin.js",
//      "js/custom.js",
//      "js/scripts.js"]
var paths = {
  src: "src/",
  dest: "dist/",
  scripts: []
};


// Set up BrowserSync Reloading
var reload = browserSync.reload;


// Build Pipes
// HTML
gulp.task("html", function() {
  return gulp.src(paths.src + "**/*.html")
    .pipe(changed(paths.dest))
    .pipe(gulp.dest(paths.dest))
});

// Styles
gulp.task("styles", function() {
  return gulp.src(paths.src + "scss/**/*.scss")
    .pipe(plumber({
      errorHandler: notify.onError("<%= error.message %>")
    }))
    // Initialize sourcemapping
    .pipe(sourcemaps.init())
      // Run SCSS Lint on all SCSS files
      .pipe(scsslint({
        config: "default.yml",
        reporterOutput: "scssReport.xml"
      }))
      // Compile SCSS
      .pipe(sass())
      // Autoprefix compiled CSS
      .pipe(autoprefixer({
        browsers: ["last 2 versions", "Explorer >= 8"],
        cascade: false
      }))
      // Minify compiled CSS
      .pipe(minifyCSS())
    // Create the sourcemap
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.dest + "css"))
    .pipe(reload({
      stream: true
    }))
    .pipe(notify({
      title: "Bartender",
      message: "SCSS compiled.",
      onLast: true
    }))
});


// Scripts
gulp.task("scripts", function() {
  return gulp.src(paths.scripts)
    .pipe(plumber({
      errorHandler: notify.onError("<%= error.message %>")
    }))
    // Initialize sourcemapping
    .pipe(sourcemaps.init())
      // Run JSHint on all JS files
      .pipe(jshint())
      .pipe(jshint.reporter('default'))
      // Concatenate JS filels in the order specified
      // in the paths.scripts variable
      .pipe(concat("scripts.js"))
      // Uglify (minimize) the concatenated file
      .pipe(uglify())
    // Create the sourcemap
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.dest + "scripts"))
    .pipe(notify({
      title: "Bartender",
      message: "Scripts concatenated and uglified.",
      onLast: true
    }))
});


// Image Management
gulp.task("images", function() {
  return gulp.src(paths.src + "images/**/*")
    .pipe(changed(paths.dest + "images"))
    .pipe(plumber({
      errorHandler: notify.onError("<%= error.message %>")
    }))
    // Minify all image assets
    .pipe(imagemin())
    .pipe(gulp.dest(paths.dest + "images"))
    // Inject changes via BrowserSync
    .pipe(reload({
      stream: true
    }))
    .pipe(notify({
      title: "Bartender",
      message: "Images minified.",
      onLast: true
    }))
});


// BrowserSync
// 
// Options documention can be found at
// http://www.browsersync.io/docs/options/
gulp.task('browser-sync', function() {
  browserSync({
    // Which browsers should BS load into
    browser: ['google chrome'],
    // Local Server
    server: {
      baseDir: paths.dest
    }
    // Proxy Server (Custom Enviro.)
    // proxy: "yourlocal.dev"
  })
});


// Default Task
gulp.task("default", ['browser-sync'], function() {
  gulp.start("html", "styles", "scripts", "images");
});


// Watch Task
gulp.task("watch", ['browser-sync'], function() {
  gulp.watch(paths.src + "**/*.html", ["html", reload]);
  gulp.watch(paths.src + "scss/**/*.scss", ["styles"]);
  gulp.watch(paths.scripts, ["scripts", reload]);
  gulp.watch(paths.src + "images/**/*", ["images"]);
});
