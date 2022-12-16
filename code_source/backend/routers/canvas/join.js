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
	if (existe){
		res.send(nomCanva); //à modifier plus tard
	} else{
		res.sendFile("canva_inexistant.html", {root: "./../frontend"});
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