const SUPER = document.querySelector('#SUPER');
const couleurs = document.querySelector('#couleurs');
const curseur = document.querySelector('#curseur');

var nom = name;
// Définissez la durée du minuteur en minutes
var duration = duree;
var interval;

//partie canva
const context = SUPER.getContext('2d');

// chargement de Jquery
var s = document.createElement("script"); 
s.src = "jquery.min.js"; 
s.onload = function(e){ 
    console.log("Load jq complete !")
};
document.head.appendChild(s);

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
    })
})

 SUPER.addEventListener('click', function(event){
    const x = event.offsetX;
    const y = event.offsetY;
    //ajout à la BD
    const gridX = Math.floor(x / tailleCellule);
    const gridY = Math.floor(y / tailleCellule);
    //Store the values when the mouse will quit the pixel we are on
    let r = context.getImageData(gridX*tailleCellule, gridY*tailleCellule, 1, 1).data[0]
    let g = context.getImageData(gridX*tailleCellule, gridY*tailleCellule, 1, 1).data[1]
    let b = context.getImageData(gridX*tailleCellule, gridY*tailleCellule, 1, 1).data[2]
    $.ajax({
        type: 'POST',
        url: '/canva/join/addPixelToDB',
        data: {nom:nom, ligne:gridX, colonne:gridY, r:r, g:g, b:b, login:login},
        error: function(){
            alert('Problème AJAX')
        },
        success: function(){
            alert('Requète envoyée')
        }
    });

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
    document.cookie=`timer${login}=${duration * 60}`

    interval = setInterval(startTimer, 1000);
})

var ancienX;
var ancienY;
var ancienneCouleur

function drawMouseEffect(x, y) {
    // Set fill color
    context.fillStyle = couleurChoisie;

    // Calculate grid position
    const gridX = Math.floor(x / tailleCellule) * tailleCellule;
    const gridY = Math.floor(y / tailleCellule) * tailleCellule;
    ancienX = gridX;
    ancienY = gridY;

    //Store the values when the mouse will quit the pixel we are on
    r = context.getImageData(gridX, gridY, 1, 1).data[0]
    g = context.getImageData(gridX, gridY, 1, 1).data[1]
    b = context.getImageData(gridX, gridY, 1, 1).data[2]
    ancienneCouleur = rgbToHex(r,g,b); 

    // Fill grid square
    context.fillRect(gridX, gridY, tailleCellule, tailleCellule);      
}

SUPER.addEventListener('mousemove', function(event){
    //redraw the previous pixel we were on
    context.beginPath();
    context.fillStyle = ancienneCouleur
    context.fillRect(ancienX, ancienY, tailleCellule, tailleCellule)

    // Get mouse position
    const x = event.offsetX;
    const y = event.offsetY;

    // Draw mouse effect
    drawMouseEffect(x, y);
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

if (getCookie(`timer${login}`)>0){
    interval = setInterval(startTimer, 1000);

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
    }, 1000*getCookie(`timer${login}`)); // durée voulue
}

var pixelBlanc = context.createImageData(tailleCellule, tailleCellule);
for (let j = 0; j < pixelBlanc.data.length; j += 4) {
    // Modify pixel data
    pixelBlanc.data[j+0] = 255;
    pixelBlanc.data[j+1] = 255;
    pixelBlanc.data[j+2] = 255;
    pixelBlanc.data[j+3] = 255;
}

//initialisation par défaut à tous les pixels blancs
for (let i = 0; i < width; i+=1){
    for (let j = 0; j < height; j+=1){
        context.putImageData(pixelBlanc, i*tailleCellule, j*tailleCellule)
    }
}

//affichage des pixels qui sont en BD
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
    var minutes = parseInt(getCookie(`timer${login}`) / 60, 10)
    var seconds = parseInt(getCookie(`timer${login}`) % 60, 10);

    // Ajouter un zéro devant les minutes et secondes si nécessaire
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    // Récupérer l'élément HTML qui affichera le minuteur
    var display = document.querySelector('#timer');

    // Afficher le minuteur dans l'élément HTML
    display.textContent = minutes + ":" + seconds;

    // Décrémenter le compteur de 1 seconde
    document.cookie = `timer${login}=${getCookie(`timer${login}`) - 1}`;

    // Si le minuteur atteint 0, arrêter le minuteur
    if (getCookie(`timer${login}`) < 0) {
        clearInterval(interval);
        window.location.reload()
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
  
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
