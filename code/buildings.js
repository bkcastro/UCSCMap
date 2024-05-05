import * as THREE from 'three';
import * as GEOLIB from 'geolib';

const center = [-122.0583, 36.9916]
const scale = 10000

// Color

let counter = 0;
let strenght = 0.1;

const buildingsGroup = new THREE.Group();

async function createBuildings() {
    try {
        const response = await fetch('/UCSC_Buildings.geojson');
        const data = await response.json();
        LoadBuildings(data);
        return buildingsGroup; // Assuming buildingsGroup is defined and updated in LoadBuildings
    } catch (error) {
        throw error; // This will allow the caller to handle the error
    }
}

function LoadBuildings(data) {

    let features = data.features

    for (let i = 0; i < features.length; i++) {

        let fel = features[i]
        if (!fel['properties']) return

        if (fel.properties['building']) {
            addBuilding(fel.geometry.coordinates, fel.properties, fel.properties["building:levels"])
        }
    }
}

function getMatrial(info) {

    switch (info["building"]) {
        case "university": return new THREE.MeshBasicMaterial({ color: "lightskyblue" });
        case "apartments": return new THREE.MeshBasicMaterial({ color: "greenyellow" });
        case "roof": new THREE.MeshBasicMaterial({ color: "purple" });
        case "dormitory": return new THREE.MeshBasicMaterial({ color: "orange" });
        case "house": return new THREE.MeshBasicMaterial({ color: "yellow" });
        case "trailer": return new THREE.MeshBasicMaterial({ color: "khaki" });
        case "greenhouse": return new THREE.MeshBasicMaterial({ color: "green" });
        case "farm_auxiliary": return new THREE.MeshBasicMaterial({ color: "aquamarine" });
        case "industrial": return new THREE.MeshBasicMaterial({ color: "darkblue" });
        default: return new THREE.MeshBasicMaterial({ color: "deeppink" });
    }
}

function addBuilding(data, info, height = 1) {

    height = height ? height : 1

    // This is because fel.geometry.coordinates is an array of arrays of cooridntes that make up all the polygons need for a building
    for (let i = 0; i < data.length; i++) {

        // Normalize the coordiantes and return the centroid in lat and long
        let temp = normalizePolygon(data[i]);

        let shape = genShape(temp.polygon, center)
        let geometry = genGeometry(shape, {
            curveSegments: 1,
            depth: 0.5 * height,
            bevelEnabled: false
        })

        geometry.rotateX(Math.PI / 2)
        geometry.rotateZ(Math.PI)

        let mesh = new THREE.Mesh(geometry, getMatrial(info))
        mesh.geometry.computeBoundingBox();

        // Now move the building to its new spot. 
        let direction = new THREE.Vector2((temp.centroid[0] - center[0]) * scale, (temp.centroid[1] - center[1]) * scale);

        mesh.position.x = -direction.x;
        mesh.position.z = direction.y;

        counter += 1;
        // Add info to mesh user data 
        mesh.userData.info = info;
        mesh.userData.centroid = temp.centroid;
        mesh.userData.type = "building"

        buildingsGroup.add(mesh)
    }
}

function findCentroid(polygon) {
    let x = 0, y = 0;
    const n = polygon.length - 1; // Subtract one because the last vertex is the same as the first

    for (let i = 0; i < n; i++) {
        x += polygon[i][0];
        y += polygon[i][1];
    }

    return [x / n, y / n];
}

function normalizePolygon(polygon) {
    const centroid = findCentroid(polygon);
    const normalizedPolygon = polygon.map(vertex => [
        (vertex[0] - centroid[0]) * scale,
        (vertex[1] - centroid[1]) * scale
    ]);

    return { polygon: normalizedPolygon, centroid: centroid };
}

function genShape(polygon) {
    let shape = new THREE.Shape()

    for (let i = 0; i < polygon.length; i++) {
        let elp = polygon[i]

        if (i == 0) {
            shape.moveTo(elp[0], elp[1])
        } else {
            shape.lineTo(elp[0], elp[1])
        }
    }

    return shape
}

function genGeometry(shape, settings) {
    let geometry = new THREE.ExtrudeGeometry(shape, settings)

    return geometry
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


export default createBuildings; 