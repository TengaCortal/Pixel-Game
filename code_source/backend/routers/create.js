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

router.post('/available', function(req, res) {
    let data = req.body;
    db.serialize(() => {
        const statement = db.prepare("SELECT nom FROM canva WHERE nom=?");
        statement.get(data['nom'], (err, result) => {
            if(err){
                next(err);
            } else {
                if(typeof(result)==="undefined"){
                    res.status(200).send("OK");
                } else{
                    res.status(200).send("KO");
                }
            }
        });
        statement.finalize();
    })
})

router.post('/', function (req, res, next) {
	let data = req.body;
    //console.log(data);
	if(data['nom']!=null && data['nom']!="" && data['theme']!=null && data['theme']!="" && data['width']!=0 && data['height']!=0){
        db.serialize(() => {
			const statement = db.prepare('INSERT INTO canva (nom, theme, longueur, largeur) VALUES(?, ?, ?, ?);');
			statement.get(data['nom'], data['theme'], data['width'], data['height'], (err, result) => {
				if(err){
					res.status(400).send('Name already used'); //faire une page propre
				} else {
                    if(req.session.loggedin){
						db.get('SELECT * FROM site;', (err, result) => {
							nbCanvaAvant = result["nbCanvaTotal"];
							incrementerNbCanva(nbCanvaAvant);
						});
						res.render('login.ejs', {logged: true, login: req.session.login, error: true});
					}
				}
			});
			statement.finalize();
        });
	} else {
		res.status(400).send('Bad request!');
	}
});

function incrementerNbCanva(nbCanvaAvant){   
	const statement = db.prepare('UPDATE site SET nbCanvaTotal = ?;');
	statement.get(nbCanvaAvant + 1, (err, result) => {});
	statement.finalize();
}

router.get('/', function (req, res) {
	res.sendFile('create.html', {root: "../frontend"});
});



module.exports = router;