const SUPER = document.querySelector('#SUPER');
const couleurs = document.querySelector('#couleurs');
const curseur = document.querySelector('#curseur');
// Définissez la durée du minuteur en minutes
var duration = duree;

var timer;
var interval;


// Récupérer l'élément HTML qui affichera le minuteur
var display = document.querySelector('#timer');

//On définit la taille du canva
const tailleCellule = 10;
SUPER.width= tailleCellule*width;
SUPER.height= tailleCellule*height;


//liste des couleurs qui compose la palette à laquelle l'utilisateur pourra accéder rapidement 
const palette = [ 
    "#FFEBEE", "#FCE4EC", "#F3E5F5", "#B39DDB", "#9FA8DA", "#90CAF9", "#81D4FA", "#80DEEA", 
    "#4DB6AC", "#66BB6A", "#9CCC65", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800", "#FF5722", 
    "#A1887F", "#E0E0E0", "#90A4AE", "#000"
]

//affichage de la palette de couleurs et gestion de la sélection 
let couleurChoisie = palette[20]

palette.forEach(color => {

    const couleur = document.createElement('div')
    couleur.style.backgroundColor = color
    couleurs.appendChild(couleur)

    couleur.addEventListener('click', () => {
        couleurChoisie = color 
        //couleur.innerHTML = `<i class="fa-solid fa-check"></i>`
    })
})  

//partie canva
const context = SUPER.getContext('2d');

const grid = SUPER.getContext('2d');

/*curseur.addEventListener('click', function(event) {
    addPixel()
})*/

SUPER.addEventListener('click', function(){
    [x, y] = addPixel()

    // Créer l'élément overlay
    var overlay = document.createElement('div');

    // Ajouter une classe CSS à l'élément overlay
    overlay.classList.add('overlay');

    // Ajouter l'élément overlay au corps de la page
    document.body.appendChild(overlay);

    // Récupérer l'élément overlay
    var overlay = document.querySelector('.overlay');
    

    // Exécuter la fonction qui supprime l'overlay une fois le minuteur terminé
    setTimeout(function() {
    overlay.parentNode.removeChild(overlay);
    }, 1000*60*duration); // durée voulue

    // Convertir la durée en secondes
    timer = duration * 60;

    interval = setInterval(startTimer, 1000);
})

function drawGrid(context, width, height, cellWidth, cellHeight){
    context.beginPath()
    context.strokeStyle = "#FFFFFF"

    for(let i = 0; i < width; i++) {
        context.moveTo(i*cellWidth, 0)
        context.lineTo(i*cellWidth, height)

    }

    for(let i = 0; i < height; i++) {
        context.moveTo(0, i*cellHeight)
        context.lineTo(width, i*cellHeight)

    }
    context.stroke()
    
}

drawGrid(grid, SUPER.width, SUPER.width, tailleCellule, tailleCellule)

SUPER.addEventListener('mousemove', function(event){
    const curseurLeft = event.clientX - (curseur.offsetWidth/2) 
    const curseurTop = event.clientY - (curseur.offsetHeight/2) 

    curseur.style.left =  (Math.floor(curseurLeft / tailleCellule) * tailleCellule) + "px"
    curseur.style.top =  (Math.floor(curseurTop / tailleCellule) * tailleCellule -4)  + "px"
})

function addPixel(){

    //on récup les coordonnées de l'endroit clické par l'utilisateur
    const x = curseur.offsetLeft - SUPER.offsetLeft
    const y = curseur.offsetTop - SUPER.offsetTop //on soustrait la distance qu'il y a entre le haut de la page et le haut du canva
    //on fait apparaitre un "pixel" à ces coordonnées 
    context.beginPath()
    context.fillStyle = couleurChoisie
    context.fillRect(x, y, tailleCellule, tailleCellule)
    return [x, y]
}

//affichage au chargement
for (let i = 0; i < matrice.length; i+=5){
        pixel = context.createImageData(tailleCellule, tailleCellule);

        for (let j = 0; j < pixel.data.length; j += 4) {
            // Modify pixel data
            pixel.data[j+0] = matrice[i+2];
            pixel.data[j+1] = matrice[i+3];
            pixel.data[j+2] = matrice[i+4];
            pixel.data[j+3] = 255;
        }     

        context.putImageData(pixel, matrice[i+0]*tailleCellule , matrice[i+1]*tailleCellule);    
}




// Définir une fonction qui mettra à jour le minuteur à chaque seconde
function startTimer() {
    // Convertir les secondes restantes en minutes et secondes
    var minutes = parseInt(timer / 60, 10)
    var seconds = parseInt(timer % 60, 10);

    // Ajouter un zéro devant les minutes et secondes si nécessaire
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    // Afficher le minuteur dans l'élément HTML
    display.textContent = minutes + ":" + seconds;

    // Décrémenter le compteur de 1 seconde
    --timer;

    // Si le minuteur atteint 0, arrêter le minuteur
    if (timer < 0) {
        clearInterval(interval);
    }
}




/* 
First, create a canvas element in your HTML file:
<canvas id="myCanvas" width="500" height="300"></canvas>

Next, use JavaScript to get a reference to the canvas element and its drawing context:
var canvas = document.getElementById("myCanvas");
var context = canvas.getContext("2d");

Then, use the canvas drawing context to draw on the canvas. For example, you can use the fillRect method to draw a filled rectangle:
context.fillRect(10, 10, 50, 50);

Once you have drawn on the canvas, you can convert the canvas pixels to a data URL using the toDataURL method:
var dataURL = canvas.toDataURL();

To store the data URL in a database, you will need to send it to a server-side script using an HTTP request (such as an AJAX request). The server-side script can then store the data URL in the database.
Here is an example of how you could send the data URL to a server-side script using an AJAX request:

$.ajax({
  type: "POST",
  url: "save_image.php",
  data: {
    dataURL: dataURL
  }
});

On the server side, you can use a server-side language like PHP to receive the data URL and store it in a database. Here is an example of how you could do this using PHP:

<?php

// Connect to the database
$db = new mysqli("localhost", "username", "password", "database");

// Escape the data URL to prevent SQL injection attacks
$dataURL = $db->real_escape_string($_POST["dataURL"]);

// Insert the data URL into the database
$query = "INSERT INTO images (data_url) VALUES ('$dataURL')";
$result = $db->query($query);

?>

*/