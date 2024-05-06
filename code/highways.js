import * as THREE from 'three';

const center = [-122.0583, 36.9916]
const scale = 10000;

const materials = {
    pedestrian: new THREE.LineBasicMaterial({ color: "lightblue" }),
    residential: new THREE.LineBasicMaterial({ color: "coral" }),
    service: new THREE.LineBasicMaterial({ color: 0xf695fc }),
    tertiary: new THREE.LineBasicMaterial({ color: "skyblue" }),
    secondary: new THREE.LineBasicMaterial({ color: "lightgreen" }),
    track: new THREE.LineBasicMaterial({ color: "lightbrown" }),
    secondary_link: new THREE.LineBasicMaterial({ color: "magenta" }), // Wheel chair ramp
    cycleway: new THREE.LineBasicMaterial({ color: "Bisque" }),
    footway: new THREE.LineBasicMaterial({ color: 0x828282 }),
    path: new THREE.LineBasicMaterial({ color: 0xE6E6FA }),
    steps: new THREE.LineDashedMaterial({ color: "orchid", linewidth: 1, scale: 1, dashSize: .4, gapSize: .4, opacity: 0.2 }),
    living_street: new THREE.LineBasicMaterial({ color: 0xfffdb8 }),
    default: new THREE.LineBasicMaterial({ color: "black" }),
}

const routesGroup = new THREE.Group();

const highwayTypes = new Set();

async function createHighways() {
    try {
        const response = await fetch('/UCSC_Highways.geojson');
        const data = await response.json();
        LoadHighways(data);
        printHighwayTypes();
        return routesGroup;
    } catch (error) {
        throw error;
    }
}

function LoadHighways(data) {
    let features = data.features

    console.log(features.length)

    for (let i = 0; i < features.length; i++) {

        let fel = features[i]

        if (fel.properties['highway']) {
            addHighway(fel.geometry.coordinates, fel.properties)
        }
    }
}

function getMatrial(info) {
    switch (info["highway"]) {
        case "pedestrian": return materials.pedestrian;
        case "residential": return materials.residential;
        case "service": return materials.service;
        case "tertiary": return materials.tertiary;
        case "secondary": return materials.secondary;
        case "track": return materials.track;
        case "secondary_link": return materials.secondary_link; // Wheel chair ramp
        case "cycleway": return materials.cycleway;
        case "footway": return materials.footway;
        case "path": return materials.path;
        case "steps": return materials.steps;
        case "living_street": return materials.living_street;
        default: return materials.default;
    }
}

function printHighwayTypes() {
    console.log("Printing types of highways")
    highwayTypes.forEach((type) => {
        console.log(type);
    })
}

function addHighway(data, info) {

    // This is because fel.geometry.coordinates is an array of arrays of coords that make up all the polygons need for a building
    for (let i = 0; i < data.length; i++) {

        // Normalize the coordiantes and return the centroid in lat and long
        let temp;
        if (data[0].length > 2) {
            temp = normalizePolygon(data[0]);
        } else {
            temp = normalizePolygon(data);
        }

        let geometry = genGemoetry(temp.polygon)

        //let line = new THREE.Points(geometry, pointMaterial);

        let line = new THREE.Line(geometry, getMatrial(info))

        // Now move the building to its new spot. 
        let direction = new THREE.Vector2((temp.centroid[0] - center[0]) * scale, (temp.centroid[1] - center[1]) * scale);

        //line.rotateX(Math.PI / 2)
        line.rotateZ(Math.PI)

        line.position.x = -direction.x;
        line.position.z = direction.y;

        // Add info to mesh user data 
        //line.userData.info = info;
        line.userData.centroid = temp.centroid;
        line.userData.type = "line"

        if (info["highway"] == "steps") {
            line.computeLineDistances()
        }

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

export default createHighways; 