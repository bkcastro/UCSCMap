import * as THREE from 'three';

import { getHighwayMatrial } from './materials';
const center = [-122.0583, 36.9916, 36.9941766]
const scale = 10000;

let alltypes = ['pedestrian', 'track', 'crossing', 'secondary', 'steps', 'footway',
    'traffic_signals', 'living_street', 'secondary_link',
    'service', 'cycleway', 'turning_circle', 'proposed', 'tertiary', 'path']
let temp = ['residential', 'secondary', 'service', 'cycleway']
let test = ['residential']

const routesGroup = new THREE.Group();

const highwayTypes = new Set(temp);

console.log(highwayTypes);

async function createHighways() {
    try {
        // const response = await fetch('/UCSC_Highways.geojson');
        const response = await fetch('/UCSC_Highways_V7.geojson')
        const data = await response.json();
        LoadHighways(data);
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

    // This is because fel.geometry.coordinates is an array of arrays of coords that make up all the polygons need for a building
    for (let i = 0; i < data.length; i++) {

        // Normalize the coordiantes and return the centroid in lat and long
        let polygon;
        if (data[0].length == 1) {
            polygon = genGeometry(data[0]);
        } else {
            polygon = genGeometry(data);
        }

        console.log("polygon", polygon);

        let line = new THREE.Line(polygon, getHighwayMatrial(info['highway']))

        routesGroup.add(line);
    }
}

// Ok so my problem is that line segements renders the vertex in steps of two so I have to account for that. 

function genGeometry(polygon) {

    const points = [];

    for (let i = 0; i < polygon.length; i++) {
        const point = new THREE.Vector3(-(polygon[i][0] - center[0]) * scale, (polygon[i][2] / 10) - (center[2]), (polygon[i][1] - center[1]) * scale)
        points.push(point)
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    geometry.setIndex

    return geometry;
}

export default createHighways; 