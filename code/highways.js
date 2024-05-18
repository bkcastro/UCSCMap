import * as THREE from 'three';

import { getHighwayMatrial } from './materials';
const center = [-122.0583, 36.9916, 36.9941766]
const scale = 10000;

let alltypes = ['pedestrian', 'track', 'crossing', 'secondary', 'steps', 'footway',
    'traffic_signals', 'living_street', 'secondary_link',
    'service', 'cycleway', 'turning_circle', 'proposed', 'tertiary', 'path']
let temp = ['residential', 'secondary', 'service', 'path', 'track']

const routesGroup = new THREE.Group();

const highwayTypes = new Set(temp);

console.log(highwayTypes);

async function createHighways() {
    try {
        // const response = await fetch('/UCSC_Highways.geojson');
        const response = await fetch('/UCSC_Highways_V7.geojson')
        const data = await response.json();
        LoadHighways(data);
        //printHighwayTypes();
        return routesGroup;
    } catch (error) {
        throw error;
    }
}

function LoadHighways(data) {
    let features = data.features

    for (let i = 0; i < features.length; i++) {

        let fel = features[i]
        if (fel.properties['highway']) {
            addHighway(fel.geometry.coordinates, fel.properties)
        }
    }
}

function addHighway(data, info) {

    if (!highwayTypes.has(info["highway"])) {
        return
    }

    //console.log(data)
    // This is because fel.geometry.coordinates is an array of arrays of coords that make up all the polygons need for a building
    for (let i = 0; i < data.length; i++) {

        // Normalize the coordiantes and return the centroid in lat and long
        let temp;
        if (data[0].length == 1) {
            temp = normalizePolygon(data[0]);
        } else {
            temp = normalizePolygon(data);
        }

        let geometry = genGeometry(temp.polygon)

        let line = new THREE.Line(geometry, getHighwayMatrial(info['highway']))

        // Now move the building to its new spot. 
        let direction = new THREE.Vector2((temp.centroid[0] - center[0]) * scale, (temp.centroid[1] - center[1]) * scale);

        //line.rotateX(Math.PI / 2)
        line.rotateZ(Math.PI)

        line.position.x = -direction.x;
        line.position.z = direction.y;

        line.userData.type = "line"

        // if (info["highway"] == "steps") {
        //     line.computeLineDistances()
        // }

        routesGroup.add(line);
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
        (vertex[1] - centroid[1]) * scale,
        -((vertex[2] / 10) - (center[2])),
    ]);

    return { polygon: normalizedPolygon, centroid: centroid };
}

function genGeometry(polygon) {

    const points = [];

    for (let i = 0; i < polygon.length; i++) {
        let elp = polygon[i]
        points.push(new THREE.Vector3(elp[0], elp[2], elp[1]))
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    return geometry;
}

export default createHighways; 