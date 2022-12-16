const SUPER = document.querySelector('#SUPER');
const couleurs = document.querySelector('#couleurs');
const curseur = document.querySelector('#curseur');

//On définit la taille du canva
SUPER.width= 700;
SUPER.height= 700; 
const tailleCellule = 10;


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

curseur.addEventListener('click', function(event) {
    addPixel()
})

SUPER.addEventListener('click', function(){
    addPixel()
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
}