const e = require('express');
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
					statut = "OK " + req.session.statut;
                    res.status(200).send(statut);
                } else{
                    res.status(200).send("KO");
                }
            }
        });
        statement.finalize();
    })
})

router.post('/', function (req, res, next){
	let data = req.body;
	var width = 10;
	var height = 10;
	if(data['nom']!=null && data['nom']!="" && data['theme']!=null && data['theme']!="" && data['width']!=0 && data['height']!=0){
        db.serialize(async() => {
			const statement = db.prepare('INSERT INTO canva (nom, theme, longueur, largeur) VALUES(?, ?, ?, ?);');
			if(req.session.statut == "vip"){
				width = data['width'];
				height = data['height'];
			}
			statement.get(data['nom'], data['theme'], width, height, (err, result) => {
				if(err){
					res.status(400).send('Name already used'); //faire une page propre
				} else {
                    if(req.session.loggedin){
						db.get('SELECT * FROM site;', (err, result) => {
							nbCanvaAvant = result["nbCanvaTotal"];
							incrementerNbCanva(nbCanvaAvant);
						});
					}
				}
			});
			let id = await idCanva(data["nom"]);
			let sql = '';
			for(let i = 0; i < width; i++){
				for(let j = 0; j < height; j++){
					db.get(`INSERT INTO matrice (id, ligne, colonne, red, green, blue ) VALUES(${id}, ${i}, ${j}, 255,255,255);`)
				}
			}
			url = '/canva/join/nom/'+data['nom']
			res.redirect(url);
        });
	} else {
		res.status(400).send('Bad request!');
	}
});

db.query = function (sql, params) { //fonction pour permettre d'utiliser le await
    sql = sql.replace(/SERIAL PRIMARY KEY/, "INTEGER PRIMARY KEY AUTOINCREMENT");
    var that = this;
    return new Promise(function (resolve, reject) {
      that.all(sql, params, function (error, result) {
        if (error)
          reject(error);
        else
          resolve(result);
      });
    });
};

async function idCanva(nom){
	let res;
	let sql = `SELECT id FROM canva WHERE nom = "${nom}";`;
	result = await db.query(sql)
	return result[0]["id"];
}

function incrementerNbCanva(nbCanvaAvant){   
	const statement = db.prepare('UPDATE site SET nbCanvaTotal = ?;');
	statement.get(nbCanvaAvant + 1, (err, result) => {});
	statement.finalize();
}

router.get('/', function (req, res) {
	res.sendFile('create.html', {root: "../frontend"});
});



module.exports = router;