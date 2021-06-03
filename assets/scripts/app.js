/*
    Déclaration des variabls relatives aux limites de la carte pour
    la première balades, déclaration de variables pour ciblage d'éléments.

    Initialisation et paramétrage de la carte Leaflet
*/

let sudOuest = L.latLng(48.815003, 2.227135),
    nordEst = L.latLng(48.902724, 2.488421),
    bounds = L.latLngBounds(sudOuest, nordEst),
    radius, positionUser, accuracy;

let appUserInterface = document.querySelector('html'),
    header = document.querySelector('header');
    locateBtn = document.querySelector('.locate-btn'),
    fullScreenBtn = document.querySelector('.fullScreen-btn'),
    range = document.querySelector(".range"),
    shutter = document.querySelector(".shutter"),
    notchBtn = document.querySelector(".notch"),
    closeBtn = document.querySelector(".close"),
    shutterPage = document.querySelector(".shutter-page"),
    route = document.querySelector(".route"),
    routeSection = document.querySelector(".route-section"),
    notif = document.querySelector('.notification');

let isClose = false; 
let firstGeoloc = true;


document.documentElement.style.setProperty('--inner-width', window.innerWidth + "px");
document.documentElement.style.setProperty('--inner-height', window.innerHeight + "px");


let mymap = new L.Map('mapid', {
    center: bounds.getCenter(),
    zoom: 12,
    minZoom: 5,
    maxBounds: bounds,
    maxBoundsViscosity: 0.5
});

// let ytURL = 'https://www.youtube.com/watch?v=7CeXNGArs54';
// console.log(ytURL);
// console.log(ytURL.replace(/.*id=([^\/]+)[\&]*.*]/, "$1"));

// let id = youtube_parser('https://www.youtube.com/watch?v=7CeXNGArs54');
// console.log(id); 
// id = youtube_parser('https://youtu.be/7CeXNGArs54');
// console.log(id); 
// id = youtube_parser('https://youtu.be/7CeXNGArs54?t=787');
// console.log(id); 
// id = youtube_parser('https://www.youtube.com/watch?v=7CeXNGArs54&list=TLPQMjEwNTIwMjF2pXxMAZt5_w&index=1');
// console.log(id); 


notchBtn.addEventListener('click', event => {
    openShutter(shutter);
});
closeBtn.addEventListener('click', event => {
    openShutter(shutter);
});
fullScreenBtn.addEventListener('click', event => {
    openFullscreen();
});

locateBtn.addEventListener('click', event => {
    console.log('okay');
    mymap.locate({maxZoom: 16});
    mymap.on('locationfound', onLocationFound);
    mymap.on('locationerror', onLocationError);
});

/*
    Chargements des tiles, déclaration des fonds de cartes via calques Leaflet
    et initialisation du bouton de contrôle des calques historiques.
*/

// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '',
//     maxZoom: 18,
//     id: 'mapbox/streets-v11',
// }).addTo(mymap);

var stepIcon = L.icon({
    iconUrl: 'assets/images/marker-leaflet.png',

    iconSize:     [25, 39.1], // size of the icon
    iconAnchor:   [13, 38], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -34] // point from which the popup should open relative to the iconAnchor
});

var userIcon = L.icon({
    iconUrl: 'assets/images/user-marker-leaflet.png',

    iconSize:     [25, 28], // size of the icon
    iconAnchor:   [12.5, 27], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -24] // point from which the popup should open relative to the iconAnchor
});

let googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    // maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
}).addTo(mymap);

let paris17 =  L.tileLayer('https://mapwarper.net/maps/tile/26642/{z}/{x}/{y}.png', {
    attribution: 'Tiles by <a href="http://mapwarper.net/maps/20531">Map Warper user sarahsimpkin</a>',
    // maxZoom: 20,
    minZoom: 1
});

let paris19 =  L.tileLayer('https://mapwarper.net/maps/tile/42383/{z}/{x}/{y}.png', {
    attribution: 'Tiles by <a href="http://mapwarper.net/maps/20531">Map Warper user sarahsimpkin</a>',
    // maxZoom: 20,
    minZoom: 1
});

let fondsDeCarte = {
    "Paris XVII": paris17,
    "Paris XIX": paris19
};

paris19.on('click', function(e) {
    alert('I have been clicked ')
});

let control = L.control.layers(fondsDeCarte).addTo(mymap);
let checkboxes = document.querySelectorAll(".leaflet-control-layers-selector"); 
let enabledSettings = [];

checkboxes.forEach(function(checkbox) {
    checkbox.addEventListener('change', function() {
      enabledSettings = 
        Array.from(checkboxes)
        .filter(i => i.checked)
        .map(i => i.value)
        
      if (enabledSettings == "on") {
          range.classList.add("opacityCursor-reveal");
      }
    })
  });



/*
    Démarrage de l'application
    
    Chargement des données des CSV via la librairie Papa Parse, détection de la position
    de l'utilisateur et test provisoire de distance entre celle-ci et un marqueur donné
*/

let dataEtape,
    dataDocument,
    dataDames;

Papa.parse('https://docs.google.com/spreadsheets/d/e/2PACX-1vTMejdM_tVXKPm0vpS45-8CnHVQCtjGPUCl_G_7OoCm9uXhZY7TS7EnfBokrf-LQMyEgKMuR91MEGui/pub?gid=2098688852&single=true&output=csv', {
    download: true,
    header: true,
    complete: function (results) {
        const items = results.data;
        items.sort((a, b) => a.ordre - b.ordre);
        dataEtape = items;
        console.log(dataEtape);
        // addStep(items);
    }
});

Papa.parse('https://docs.google.com/spreadsheets/d/e/2PACX-1vTMejdM_tVXKPm0vpS45-8CnHVQCtjGPUCl_G_7OoCm9uXhZY7TS7EnfBokrf-LQMyEgKMuR91MEGui/pub?gid=954920506&single=true&output=csv', {
    download: true,
    header: true,
    complete: function (results) {
        dataDocument = results.data;
        console.log(dataDocument);
        // dataDocument.push(results.data);
    }
});

Papa.parse('https://docs.google.com/spreadsheets/d/e/2PACX-1vTMejdM_tVXKPm0vpS45-8CnHVQCtjGPUCl_G_7OoCm9uXhZY7TS7EnfBokrf-LQMyEgKMuR91MEGui/pub?gid=0&single=true&output=csv', {
    download: true,
    header: true,
    complete: function (results) {
        dataDames = results.data;
        console.log(dataDames);
        // dataDocument.push(results.data);
    }
});


setTimeout(() => {
    addStep(dataEtape);
    // let stepDocument = document.querySelector(".step-document");
    let stepAddress = document.querySelector(".address");
    addDocuments(dataDocument, dataDames);
    addDames(dataDames);

    let documentDiv = document.querySelectorAll(".document");
    documentDiv.forEach(function(i) {
        i.addEventListener('click', event => {
            if(i.childNodes[3].classList.contains("hidden")) {
                i.childNodes[3].classList.remove("hidden");
            } else if (i.childNodes[3].classList.contains("video-type")) {
                if (i.childNodes[3].classList.contains("video-reveal")) { // rajouter condition && pour audio-type à l'avenir
                    i.childNodes[3].classList.remove("video-reveal");
                } else {
                    i.childNodes[3].classList.add("video-reveal");
                }
            } else {
                i.childNodes[3].classList.add("hidden");
            }
        });
    });

    handlePermission();

    document.querySelector('.dame-btn').addEventListener('click', function() {
        console.log(this.parentNode);
        // cardExtend(this.parentNode);
    })
}, 2000)

/*
    Détectection des coordonnées GPS au clique de l'utilisateur => provisoire
*/

// mymap.on('click', onMapClick);