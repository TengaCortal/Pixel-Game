const express = require('express');
const router = express.Router();
const md5 = require('md5');

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
			const statement = db.prepare("SELECT pseudo, motDePasse, statut, nbParticipationCanva, nbTotalPixelPose FROM utilisateur WHERE pseudo=?;");
			statement.get(data['login'], (err, result) => {
				if(err){
					next(err);
				} else {
					if (typeof(result)==="undefined"){
						res.render('login.ejs', {logged: false, login: req.session.login, error: true});
					}
					else{
						if(result["motDePasse"] == md5(data["password"])){
							req.session.loggedin=true;
							req.session.login = result['pseudo'];
							req.session.statut = result['statut'];
							req.session.nbParticipationCanva = result['nbParticipationCanva'];
							req.session.nbTotalPixelPose = result['nbTotalPixelPose'];
							res.redirect("/")
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

router.get('/login', function (req, res) {
	res.render('login.ejs', {logged: req.session.loggedin, login: req.session.login, error: false});
});

router.get('/logout', function (req, res) {
	req.session.destroy();
	res.redirect('/login');
});

module.exports = router;