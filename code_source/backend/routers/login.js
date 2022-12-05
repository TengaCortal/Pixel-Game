const express = require('express');
const router = express.Router();

// add data to req.body (for POST requests)
router.use(express.urlencoded({ extended: true }));

const sqlite3 = require('sqlite3').verbose();

// connecting an existing database (handling errors)
const db  = new sqlite3.Database('./db/pixel_war.db', (err) => {
	if (err) {
	  console.error(err.message);
	}
	console.log('Connected to the database!');
});

// check credentials in database + initialize session
router.post('/login', function (req, res, next) {
	let data = req.body;
    //console.log(data);
	if(data['login']!=null && data['login']!="" && data['password']!=null && data['password']!=""){
		
		db.serialize(() => {
			// check if the password is okay
			const statement = db.prepare("SELECT pseudo, motDePasse FROM utilisateur WHERE pseudo=?;");
			statement.get(data['login'], (err, result) => {
				if(err){
					next(err);
				} else {
					if (typeof(result)==="undefined"){
						res.send("Login incorrect") // faire page propre
					}
					else{
						if(result["motDePasse"] == data["password"]){
							req.session.loggedin=true;
							req.session.login=result['pseudo'];
							next();
						} else {
							res.render('login.ejs', {logged: false, login: req.session.login, error: true});
						}
					}
				}
			});
			statement.finalize();
		
		});

	} else {
		res.status(400).send('Bad request!');
	}
});

router.use('/login', function (req, res) {
	res.render('login.ejs', {logged: req.session.loggedin, login: req.session.login, error: false});
});

router.use('/logout', function (req, res) {
	req.session.destroy();
	res.redirect('/login');
});

/*
// 404
router.use('*', function(req, res){
	console.log("chelou")
    res.status(404);
	res.render('404.ejs', {login: req.session.login, logged: req.session.loggedin});
});*/

module.exports = router;