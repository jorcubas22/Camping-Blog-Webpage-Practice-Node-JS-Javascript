var express 		= 	require("express"),	
	app 			= 	express(),
	mongoose 		= 	require("mongoose"),
	passport		=	require("passport"),
	LocalStrategy	= 	require("passport-local"),
	bodyParser 		= 	require("body-parser"),
	Campground		=	require("./models/campgrounds"),
	Comment			=	require("./models/comment"),
	User			=	require("./models/user"),
	seedDB 			=	require("./seeds");

	var commentRoutes = require("./routes/comments")

seedDB();
mongoose.connect("mongodb://localhost/yelpcamp_v6");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
console.log(__dirname);
seedDB();

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
	next();
});

app.get("/", function(req, res){
	res.render("landing");
});

app.get("/campgrounds", function(req, res){
	console.log(req.user);
// 	Get All Campgrounds from DB 
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			console.log(err);
		}
		else{
			res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user});
		}
	});
	// res.render("campgrounds", {campgrounds: campgrounds});
});

app.post("/campgrounds", function(req, res){
// 	getdata from form and add campgrounds to array 
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var newCampground = {name: name, image: image, description: desc}
// 	Create a New Campaground and Save to DataBase
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		}
		else{
			res.redirect("/campgrounds")		
		}
	});
// 	redirect to campgrounds page 
// 	default es redirect a get request 
	
});

app.get("/campgrounds/new", function(req, res){
	res.render("campgrounds/new.ejs")
});

app.get("/campgrounds/:id", function(req, res){
// 	Find the Campground With Provided ID 
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err){
			console.log("error fin by id");
		}
		else{
			console.log(foundCampground);
			// 	Render the show tempalate with that campground
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});

});

// =====================================================
// COMMENTS ROUTES 
// =====================================================

app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res){
// 	find campground by id 
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
		}
		else{
			res.render("comments/new", {campground: campground});
		}
	});
});


app.post("/campgrounds/:id/comments", function(req, res){
// 		 Lookup Campground Using ID
		 Campground.findById(req.params.id, function(err, campground){
			if(err){
				console.log(err);
				res.redirect("/campgrounds");
			}
			 else{
				 Comment.create(req.body.comment, function(err, comment){
					 if(err){
						 res.redirect("/campgrounds");
					 }
					 else{
						 campground.comments.push(comment);
						 campground.save();
						 res.redirect("/campgrounds/" + campground._id);
					 }
				 })
			 }
		 });
// 		 Create a New Comment
	
// 		 Connct New Comment to Campground
// 		 Redirect to Campground ShowPage
	
		 
	});

// =================
// AUTH ROUTES
// =================

// show register form

app.get("/register", function(req, res){
	res.render("register");
});

// handle sign up logic
app.post("/register", function(req, res){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("/campgrounds");
		});
	})
});

// Show Login Form
app.get("/login", function(req, res){
	res.render("login");
});

// handling login logic
app.post("/login", passport.authenticate("local", 
	{
	successRedirect: "/campgrounds",
	failureRedirect: "/login"
	}),function(req, res){
	
	});

// logic route
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	else{
		res.redirect("/login");
	}
}


app.listen(3000, function(){
	console.log("YelpCamp server is now running")
});
