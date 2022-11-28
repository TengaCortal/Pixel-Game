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
			const statement = db.prepare("SELECT pseudo, motDePasse FROM utilisateur WHERE login=?;");
			statement.get(data['login'], (err, result) => {
				if(err){
					next(err);
				} else {
					if(result["motDePasse"] == data["password"]){
						req.session.loggedin=true;
						req.session.login=result['pseudo'];
						next();
					} else {
						res.render('login.ejs', {logged: false, login: req.session.login, error: true});
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



router.post('/signup', function (req, res) {
    let data = req.body;
    let aCree = false;
    if(data['login']!=null && data['login']!="" && data['password']!=null && data['password']!=""){
        db.serialize(() => {
			const statement = db.prepare('INSERT INTO utilisateur (pseudo, motDePasse, statut, nbParticipationCanva, nbTotalPixelPose) VALUES(?, ?, "normal", 0, 0);');
			statement.get(data['login'], data['password'], (err, result) => {
				if(err){
					res.status(400).send('Login déjà utilisé!'); //faire une page propre
				} else {
                    req.session.login = data["login"];
                    incrementerNbUtilisateur();
                    res.render('login.ejs', {logged: true, login: req.session.login, error: true});
				}
			});
			statement.finalize();
        });
        
    }
    else{
        res.status(400).send('Bad request!');
    }
});

function incrementerNbUtilisateur(){
    let nbUtilisateur = 0;
    db.serialize(() => {
        db.get('SELECT nbUtilisateurTotal FROM site', (err, result) => {
            console.log(result);
            nbUtilisateur = result["nbUtilisateurTotal"];
        });
        
        const statement = db.prepare('UPDATE site SET nbUtilisateurTotal = ?;')
        statement.get(nbUtilisateur+1, (err, result) => {});
        statement.finalize();
    });

}

router.use('/signup', function (req, res) {
	res.sendFile('signup.html', {root: "../frontend"});
});



module.exports = router;