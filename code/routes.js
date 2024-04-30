import * as THREE from 'three';
import * as GEOLIB from 'geolib';

const center = [-122.0583, 36.9916]
const R = 6371000; // Earth's radius in meters
const scale = 100; // Adjust this scale factor to fit your scene

const routesGroup = new THREE.Group();

async function createRotues() {
    try {
        const response = await fetch('/UCSC_Highways.geojson');
        const data = await response.json();
        LoadRoutes(data);
        return routesGroup;
    } catch (error) {
        throw error; // This will allow the caller to handle the error
    }
}

// Function to convert geographic coordinates to local coordinates
function latLonToXY(coordinates) {
    const centerLat = (coordinates[0][1] + coordinates[coordinates.length - 1][1]) / 2;
    const centerLon = (coordinates[0][0] + coordinates[coordinates.length - 1][0]) / 2;
    const localCoordinates = coordinates.map(coord => {
        const x = (coord[0] - centerLon) * 10540 * Math.cos(coord[1] * Math.PI / 180);
        const y = (coord[1] - centerLat) * 10540;
        return [x, y];
    });
    return localCoordinates;
}

function LoadRoutes(data) {
    let features = data.features

    console.log("features", features.length);

    for (let i = 0; i < 10; i++) {

        let fel = features[i]

        if (fel.properties['highway']) {
            addRoute(fel.geometry.coordinates, fel.properties)
        }
    }
}

function addRoute(data, info) {
    console.log("hi", data);

    let points = [];

    for (let i = 0; i < data.length; i++) {
        let el = data[i]
    }


}

function genLine(points) {
    let shape = new THREE.Shape()

    for (let i = 0; i < points.length; i++) {
        let elp = points[i]
        elp = GPSRelativePosition(elp)

        if (i == 0) {
            shape.moveTo(elp[0], elp[1])
        } else {
            shape.lineTo(elp[0], elp[1])
        }
    }

    return shape
}

function GPSRelativePosition(objPosi) {

    // Get GPS distance
    let dis = GEOLIB.getDistance(objPosi, center)

    // Get bearing angle
    let bearing = GEOLIB.getRhumbLineBearing(objPosi, center)

    // Calculate X by centerPosi.x + distance * cos(rad)
    let x = center[0] + (dis * Math.cos(bearing * Math.PI / 180))

    // Calculate Y by centerPosi.y + distance * sin(rad)
    let y = center[1] + (dis * Math.sin(bearing * Math.PI / 180))

    // Reverse X (it work) 
    return [-x / 100, y / 100]
}


export default createRotues; 