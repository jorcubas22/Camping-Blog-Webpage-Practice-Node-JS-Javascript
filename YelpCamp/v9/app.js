var express 		= 	require("express"),	
	app 			= 	express(),
	mongoose 		= 	require("mongoose"),
	flash			=	require("connect-flash"),
	passport		=	require("passport"),
	LocalStrategy	= 	require("passport-local"),
	methodOverride	=	require("method-override"),
	bodyParser 		= 	require("body-parser"),
	Campground		=	require("./models/campgrounds"),
	Comment			=	require("./models/comment"),
	User			=	require("./models/user"),
	seedDB 			=	require("./seeds");

// Requiring Routes
	var commentRoutes 		= 	require("./routes/comments"),
		campgroundRoutes	=	require("./routes/campgrounds"),
		indexRoutes 			= 	require("./routes/index");

seedDB();
mongoose.connect("mongodb://localhost/yelpcamp_v6");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

console.log(__dirname);
// seedDB(); Seedd the Database

// PASSPORT CONFIG
app.use(require("express-session")({
	secret: "Sign In Secret",
	resave: false, 
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});


app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(3000, function(){
	console.log("YelpCamp server is now running")
});
