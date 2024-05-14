import * as THREE from 'three';

const center = [-122.0583, 36.9916]
const scale = 10000; // Adjust this scale factor to fit your scene
const lineMaterialBlack = new THREE.LineBasicMaterial({ color: "brown", opacity: .5, transparent: true });
const pointMaterial = new THREE.PointsMaterial({
    size: .01, // size of the points
    sizeAttenuation: true, // points get smaller with distance
    color: 0xff0000, // red
});
const routesGroup = new THREE.Group();

const highwayTypes = new Set();

async function createRotues() {
    try {
        const response = await fetch('/UCSC_Highways.geojson');
        const data = await response.json();
        LoadRoutes(data);
        printHighwayTypes();
        return routesGroup;
    } catch (error) {
        throw error; // This will allow the caller to handle the error
    }
}

function LoadRoutes(data) {
    let features = data.features

    console.log(features.length)

    for (let i = 0; i < features.length; i++) {

        let fel = features[i]

        if (fel.properties['highway']) {
            addRoute(fel.geometry.coordinates, fel.properties)
        }
    }
}

function getMatrial(info) {
    switch (info["highway"]) {
        // case "pedestrian": return new THREE.LineBasicMaterial({ color: "blue" });
        // case "residential": return new THREE.LineBasicMaterial({ color: "coral" });
        // case "service": return new THREE.LineBasicMaterial({ color: "springgreen" });
        // case "tertiary": return new THREE.LineBasicMaterial({ color: "skyblue" });
        // case "secondary": return new THREE.LineBasicMaterial({ color: "blue" });
        // case "track": return new THREE.LineBasicMaterial({ color: "brown" });
        // case "secondary_link": return new THREE.LineBasicMaterial({ color: "magenta" }); // Wheel chair ramp
        // case "cycleway": return new THREE.LineBasicMaterial({ color: "pink" });
        // case "footway": return new THREE.LineBasicMaterial({ color: "moccasin" });
        // case "path": return new THREE.LineBasicMaterial({ color: "orchid" });
        case "steps": return new THREE.LineDashedMaterial({ color: "orchid", linewidth: 1, scale: 1, dashSize: .4, gapSize: .4 });
        // case "living_street": return new THREE.LineBasicMaterial({ color: "ornage" });
        default: return lineMaterialBlack;
    }
}

function printHighwayTypes() {
    console.log("Printing types of highways")
    highwayTypes.forEach((type) => {
        console.log(type);
    })
}

function addHighwayType(info) {

    if (info["highway"] == undefined) { return }

    highwayTypes.add(info["highway"])
}

function addRoute(data, info) {

    let type = info["highway"];

    // This is because fel.geometry.coordinates is an array of arrays of cooridntes that make up all the polygons need for a building
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
            // line.computeLineDistances()
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

export default createRotues; 