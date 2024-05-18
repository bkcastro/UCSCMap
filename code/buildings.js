import * as THREE from 'three';

import { getBuildingMaterial } from './materials';

const center = [-122.0583, 36.9916, 36.9941766] // lon, lat, elev (note elevation is relative to ORS (openrouteservice) classification)
const scale = 10000

const buildingsGroup = new THREE.Group();

async function createBuildings() {
    try {
        // const response = await fetch('/UCSC_Buildings.geojson');
        const response = await fetch('/UCSC_Buildings_V3.geojson');
        const data = await response.json();
        LoadBuildings(data);
        return buildingsGroup;
    } catch (error) {
        throw error;
    }
}

function LoadBuildings(data) {

    let features = data.features

    for (let i = 0; i < features.length; i++) {

        let fel = features[i]
        if (!fel['properties']) return

        if (fel.properties['building']) {
            addBuilding(fel.geometry, fel.properties, fel.properties["building:levels"])
        }
    }
}

function addBuilding(building, info, height = 1) {

    height = height ? height : 1

    let data = building.coordinates;
    let centroid = building.centroid;

    // This is because fel.geometry.coordinates is an array of arrays of cooridntes that make up all the polygons need for a building
    for (let i = 0; i < data.length; i++) {

        // Normalize the coordiantes and return the centroid in lat and long
        let polygon = normalizePolygon(data[i], centroid);

        let shape = genShape(polygon, center)
        let geometry = genGeometry(shape, {
            curveSegments: 1,
            depth: 0.5 * height,
            bevelEnabled: false
        })

        geometry.rotateX(Math.PI / 2)
        geometry.rotateZ(Math.PI)

        let mesh = new THREE.Mesh(geometry, getBuildingMaterial(info['building']))
        mesh.geometry.computeBoundingBox();

        // Now move the building to its new spot. 
        let direction = new THREE.Vector2((centroid[0] - center[0]) * scale, (centroid[1] - center[1]) * scale);

        mesh.position.x = -direction.x;
        mesh.position.z = direction.y;
        mesh.position.y = (centroid[2] / 10) - (center[2])

        // Add info to mesh user data 
        mesh.userData.info = info;
        mesh.userData.centroid = centroid;
        mesh.userData.type = "building"
        mesh.userData.color = mesh.material.color.getHex();

        buildingsGroup.add(mesh)
    }
}

function normalizePolygon(polygon, centroid) {
    const normalizedPolygon = polygon.map(vertex => [
        (vertex[0] - centroid[0]) * scale,
        (vertex[1] - centroid[1]) * scale
    ]);

    return normalizedPolygon
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

export default createBuildings; 