import * as THREE from 'three';
import * as GEOLIB from 'geolib';
import { pointUV } from 'three/examples/jsm/nodes/Nodes.js';

const center = [-122.0583, 36.9916]
const scale = 10000; // Adjust this scale factor to fit your scene
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });

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

function LoadRoutes(data) {
    let features = data.features

    console.log("features", features.length);

    for (let i = 0; i < features.length; i++) {

        let fel = features[i]

        if (fel.properties['highway']) {
            addRoute(fel.geometry.coordinates, fel.properties)
        }
    }
}

function addRoute(data, info) {

    // This is because fel.geometry.coordinates is an array of arrays of cooridntes that make up all the polygons need for a building
    for (let i = 0; i < data.length; i++) {

        // Normalize the coordiantes and return the centroid in lat and long
        let temp;
        if (data[0].length > 2) {
            temp = normalizePolygon(data[0]);
        } else {
            temp = normalizePolygon(data);
        }

        console.log("normpoints: ", temp, data, info);

        let geometry = genGemoetry(temp.polygon)

        let line = new THREE.Line(geometry, lineMaterial)

        // Now move the building to its new spot. 
        let direction = new THREE.Vector2((temp.centroid[0] - center[0]) * scale, (temp.centroid[1] - center[1]) * scale);

        //line.rotateX(Math.PI / 2)
        line.rotateZ(Math.PI)

        line.position.x = -direction.x;
        line.position.z = direction.y;

        // Add info to mesh user data 
        line.userData.info = info;
        line.userData.centroid = temp.centroid;
        line.userData.type = "line"

        routesGroup.add(line)
    }

}

function findCentroid(polygon) {
    let x = 0, y = 0;
    const n = polygon.length - 1; // Subtract one because the last vertex is the same as the first

    for (let i = 0; i < n; i++) {
        x += polygon[i][0];
        y += polygon[i][1];
    }

    console.log("find centroid ", polygon)
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

function genGemoetry(polygon) {

    const points = [];

    for (let i = 0; i < polygon.length; i++) {
        let elp = polygon[i]

        points.push(new THREE.Vector3(elp[0], 0, elp[1]))
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    return geometry;
}

export default createRotues; 