const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

// connecting an existing database (handling errors)
const db  = new sqlite3.Database('./db/pixel_war.db', (err) => {
	if (err) {
	  console.error(err.message);
	}
	console.log('Connected to the database!');
});
 
router.get("/", function(req, res) {
	let list_theme;
	db.serialize(() =>{
		db.all("SELECT DISTINCT theme FROM canva;", (err, result) =>{
			list_theme = result;
		});
		db.all("SELECT c.nom, c.theme, c.longueur, c.largeur FROM canva c;", (err, result) => {
			res.render("join.ejs", {themes : list_theme, canvas : result});
		})
	})	    
});

router.get("/nom/:nom", async (req, res) =>{
	let nomCanva = req.params.nom;
	let existe = await canvaExists(nomCanva);
	duree = 1; 
	if (req.session.statut === "normal"){
		duree = 5;
	}
	if (existe){
		[width, height] = await getWidhtHeight(nomCanva);
		pixels = await getPixels(nomCanva);
		res.render("canva.ejs", {login: req.session.login, name: nomCanva, width: width, height: height, pixels: pixels, duree: duree, logged: req.session.loggedin}); 
	} else{
		res.sendFile("canva_inexistant.html", {root: "./../frontend"});
	}
	
});

async function idCanva(nom){
	let sql = `SELECT id FROM canva WHERE nom = "${nom}";`;
	result = await db.query(sql)
	return result[0]['id'];
}

router.post("/addPixelToDB", function(req,res){
	let data = req.body;
	if(req.session.loggedin){
		db.serialize(async() => {
			let id = await idCanva(data['nom']);
			const statement = db.prepare('INSERT INTO matrice (id, ligne, colonne, red, green, blue) VALUES(?, ?, ?, ?, ?, ?);');
			statement.get(id, data['ligne'], data['colonne'], data['r'], data['g'], data['b'], (err, result) => {
				if(err){
					res.status(400).send('Erreur lors de la maj de la BD'); //faire une page propre
				} else {
					let pseudo = data['login']
					const statement2 = db.prepare('SELECT * FROM utilisateur WHERE pseudo = ?;');
					statement2.get(pseudo, (err, result) => {
						nbPixelAvant = result['nbTotalPixelPose'];
						incrementerNbPixel(nbPixelAvant,pseudo);
					});
					statement2.finalize();
				}
			});
			statement.finalize();
		})
	}
})

function incrementerNbPixel(nbPixelAvant,pseudo){   
	const statement3 = db.prepare('UPDATE utilisateur SET nbTotalPixelPose = ? WHERE pseudo = ?;');
	statement3.get(nbPixelAvant + 1, pseudo, (err, result) => {});
	statement3.finalize();
}

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

async function getPixels(nom){
	let sql = `SELECT ligne, colonne, red, green, blue FROM matrice m, canva c WHERE m.id = c.id and c.nom = "${nom}";`;
	result = await db.query(sql);
	return result;

}

async function getWidhtHeight(nom){
	let sql = `SELECT largeur, longueur FROM canva WHERE nom = "${nom}";`;
	result = await db.query(sql);
	return [result[0]["largeur"], result[0]["longueur"]];
}

async function canvaExists(nom){
	let res;
	let sql = `SELECT * FROM canva WHERE nom = "${nom}";`;
	result = await db.query(sql)
	if (result.length===0){
		res = false;
	} else{
		res = true;
	}
	return res;
};

module.exports = router;