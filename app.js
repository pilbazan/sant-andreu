// 1. Configuración inicial del mapa
const map = L.map('map').setView([41.43093094217223, 2.1894056495250642], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// 2. Datos de las ubicaciones
const ubicaciones = [
    { id: 1, nombre: "01-Civic Center", lat: 41.43093094217223, lng: 2.1894056495250642, info: "Civic Center where we study English" },
    { id: 2, nombre: "02-Andrea Motis exHouse", lat: 41.43000788809112, lng: 2.1899769600516614, info: "Andrea Motis's parents house" },
    { id: 3, nombre: "03-Guardiola House", lat: 41.42989425576133, lng: 2.1885881882692146, info: "Modernist - 1904 - Josep Codina i Clapés" },
    { id: 4, nombre: "04-Sant Pacià Church", lat: 41.4314641382275, lng: 2.187598158800894, info: "Joan Torras Guardiola (1827-1910) - Mosaic Gaudi Design" },
    { id: 5, nombre: "05-Ignasi Iglesias's birthplace", lat: 41.43355481321356, lng: 2.1881294986625996, info: "Ignasi Iglesias Study Center and birthplace" },
    { id: 6, nombre: "06-Mazantini House", lat: 41.43314427447056, lng: 2.184589058417669, info: "Modernist - 1918 - Antoni Falqués i Ros" },
    { id: 7, nombre: "07-Wine press Can Xandri", lat: 41.4382293447858, lng: 2.1852772836869505, info: "18th century wine press" },
    { id: 8, nombre: "08-Grau Street", lat: 41.438897491936146, lng: 2.187751135335977, info: "Little Catalunya - Isidre Castell - 1985-2005" },
    { id: 9, nombre: "09-Bloc House", lat: 41.441436892353565, lng: 2.1905613340709755, info: "1930 - 5 blocks forming a S, with 207 homes" },
    { id: 10, nombre: "10-Ignasi Iglesias School", lat: 41.44144279876725, lng: 2.1909969873278685, info: "Public Infant and Primary School" },
    { id: 11, nombre: "11-Sant Andreu Church", lat: 41.436360249607894, lng: 2.191376360695934, info: "1881-1904 Projected by Pedro Falqués" },
    { id: 12, nombre: "12-Guinart Pharmacy", lat: 41.43714677330241, lng: 2.189756025362985, info: "1896 - Modernist exterior decoration - Anselm Guinart i González" },
    { id: 13, nombre: "13-Vidal House", lat: 41.43534380450655, lng: 2.1894265941445776, info: "1907 - Modernism decoration - Manuel Pascual i Tintorer -" },
    { id: 14, nombre: "14-Ignasi Iglesias Study Center", lat: 41.43436178022363, lng: 2.191501406762273, info: "Ignasi Iglesias Library - Musicians' Workshop (Andrea Motis)" },
    { id: 15, nombre: "15-Dr Sant Ponç Street Poem", lat: 41.43175, lng: 2.1919, info: "Entre tarongers, tresors: Un rellotge de sol, Atzavares i gerros amb flors." },
    { id: 16, nombre: "16-The Bomb House", lat: 41.431948998288725, lng: 2.18923598122458, info: "House Aresté - Revolution 1843 - La Jamància" }
];

// 3. Añadir marcadores con popups
ubicaciones.forEach(loc => {
    L.marker([loc.lat, loc.lng], {
        riseOnHover: true
    }).addTo(map)
    .bindPopup(`<b>${loc.nombre}</b><br><small>${loc.info}</small>`);
});

// 4. Configuración de geolocalización
let userMarker;
let userAccuracyCircle;
const markerIcon = L.divIcon({
    className: 'user-position-marker',
    html: '<div class="pulse-dot"></div>',
    iconSize: [20, 20]
});

// 5. Función para actualizar posición sin centrar
function updatePosition(position) {
    const userLatLng = [position.coords.latitude, position.coords.longitude];
    const accuracy = position.coords.accuracy;
    
    if (userMarker) {
        userMarker.setLatLng(userLatLng);
    } else {
        userMarker = L.marker(userLatLng, {
            icon: markerIcon,
            zIndexOffset: 1000
        }).addTo(map)
        .bindPopup("<b>¡You!</b><br><small>Real Time Position</small>");
    }
    
    if (userAccuracyCircle) {
        userAccuracyCircle.setLatLng(userLatLng);
        userAccuracyCircle.setRadius(accuracy);
    } else {
        userAccuracyCircle = L.circle(userLatLng, {
            radius: accuracy,
            fillColor: '#3388ff',
            color: '#3388ff',
            fillOpacity: 0.2,
            weight: 1
        }).addTo(map);
    }
}

// 6. Iniciar geolocalización
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        updatePosition,
        error => {
            console.error("Error de GPS:", error);
            alert("Activa la ubicación precisa para mejor experiencia");
        },
        { 
            enableHighAccuracy: true,
            maximumAge: 2000,
            timeout: 10000
        }
    );
} else {
    alert("Tu navegador no soporta geolocalización");
}

// 7. Calcular ruta peatonal
async function calcularRutaPeatonal() {
    if (ubicaciones.length < 2) return;
    
    try {
        const coordenadas = ubicaciones.map(loc => [loc.lng, loc.lat]);
        const response = await fetch('https://api.openrouteservice.org/v2/directions/foot-walking/geojson', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': '5b3ce3597851110001cf6248aa52c64845204e28bd91ed14412554ef'
            },
            body: JSON.stringify({
                coordinates: coordenadas,
                preference: 'shortest',
                elevation: false
            })
        });
        
        const data = await response.json();
        L.geoJSON(data, {
            style: { color: '#4CAF50', weight: 5, opacity: 0.8 }
        }).addTo(map);
        
    } catch (error) {
        console.error("Error al calcular la ruta:", error);
    }
}

// 8. Event listeners para los botones
document.getElementById('center-me').addEventListener('click', () => {
    if (userMarker) {
        map.flyTo(userMarker.getLatLng(), 17, {
            duration: 1
        });
    }
});

document.getElementById('calc-route').addEventListener('click', calcularRutaPeatonal);

// Calcular ruta al cargar (opcional)
window.addEventListener('load', calcularRutaPeatonal);
