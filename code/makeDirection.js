import * as THREE from 'three';
import { LineMaterial } from 'three/examples/jsm/Addons.js';

const center = [-122.0583, 36.9916, 36.9941766]
const scale = 10000

const material = new LineMaterial({

    color: 0xffffff,
    linewidth: 5, // in world units with size attenuation, pixels otherwise
    vertexColors: true,

    //resolution:  // to be set by renderer, eventually
    dashed: false,
    alphaToCoverage: true,

});

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

function makeDirection(data) {
    // Normalize the coordiantes and return the centroid in lat and long
    let temp = normalizePolygon(data);

    let geometry = genGemoetry(temp.polygon)

    let line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: "red" }))

    // Now move the building to its new spot. 
    let direction = new THREE.Vector2((temp.centroid[0] - center[0]) * scale, (temp.centroid[1] - center[1]) * scale);

    //line.rotateX(-Math.PI / 2)
    line.rotateZ(-Math.PI)

    line.position.x = -direction.x;
    line.position.z = direction.y;

    return line;
}

export default makeDirection;