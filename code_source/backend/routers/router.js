const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

var statut = "0";
var nbParticipationCanva = 0;
var nbTotalPixelPose = 0;

// connecting an existing database (handling errors)
const db  = new sqlite3.Database('./db/pixel_war.db', (err) => {
	if (err) {
	  console.error(err.message);
	}
	console.log('Connected to the database!');
});

// home
router.get('/home', function (req, res) {
	res.redirect('/');
});

router.get('/index.html', function (req, res) {
	res.redirect('/');
});

router.get('/', function (req, res) {
	let nbUtilisateur = 0;
	let nbCanva = 0;
	db.get('SELECT * FROM site;', (err, result) => {
		nbUtilisateur = result["nbUtilisateurTotal"];
		nbCanva = result["nbCanvaTotal"];
		if (req.session.loggedin){
			statPerso(req.session.login);
		}
		res.render('index.ejs', {logged: req.session.loggedin, login: req.session.login, nbUtilisateurSite: nbUtilisateur, nbCanvaSite : nbCanva,
								statutU: statut, nbTotalPixelPoseU: nbTotalPixelPose, nbParticipationCanvaU: nbParticipationCanva});
	});
	
});

function statPerso(login){
	db.serialize(() => {
		const statement = db.prepare('SELECT * FROM utilisateur WHERE pseudo=?;');
		statement.get(login, (err, result) =>{
			statut = result["statut"];
			nbTotalPixelPose = result["nbTotalPixelPose"];
			nbParticipationCanva = result["nbParticipationCanva"];
		});
		statement.finalize();
		
	});
	
}

module.exports = router;