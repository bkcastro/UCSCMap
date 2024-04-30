import * as THREE from 'three';
import * as GEOLIB from 'geolib';

const center = [-122.0583, 36.9916]

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

function addBuilding(data, info, height = 1) {

    height = height ? height : 1

    for (let i = 0; i < data.length; i++) {
        let el = data[i]

        let shape = genShape(el, center)
        let geometry = genGeometry(shape, {
            curveSegments: 1,
            depth: 0.05 * height,
            bevelEnabled: false
        })

        geometry.rotateX(Math.PI / 2)
        geometry.rotateZ(Math.PI)

        let mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: "white" }))
        mesh.geometry.computeBoundingBox();

        buildingsGroup.add(mesh)

        let bbox = mesh.geometry.boundingBox
        // Create a helper to visualize the bounding box
        const bboxHelper = new THREE.Box3Helper(bbox, 0xff0000); // Red color for visibility

        buildingsGroup.add(bboxHelper);
    }
}

function genShape(points) {
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