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
	console.log("passe1");
    let data = req.body;
    db.serialize(() => {
        db.get("SELECT nom FROM canva", (err, result) => {
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
	if(data['name']!=null && data['name']!="" && data['theme']!=null && data['theme']!="" && data['width']!=null && data['width']!="" && data['height']!=null && data['height']!=""){

		db.serialize(() => {
			// check if the name is okay
			db.get("SELECT nom FROM canva", (err, result) => {
				if(err){
					next(err);
				} else {
					if (typeof(result)==="undefined"){ //nom non utilisé -> creation du canva
						let name = data['name'];
                        let url_name = "/canva/" + name;
                        console.log(url_name);
                        //res.redirect(url_name); //page à créer
					}
					else{
						res.write("<p> canva's name already used </p>");
					}
				}
			});
			statement.finalize();
		
		});

	} else {
		res.status(400).send('Bad request!');
	}
});



router.get('/', function (req, res) {
	res.sendFile('create.html', {root: "../frontend"});
});



module.exports = router;