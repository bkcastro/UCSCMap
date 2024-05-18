import * as THREE from 'three';

const buildingMaterials = {
    university: new THREE.MeshBasicMaterial({ color: "lightskyblue" }),
    apartments: new THREE.MeshBasicMaterial({ color: "greenyellow" }),
    roof: new THREE.MeshBasicMaterial({ color: "purple" }),
    dormitory: new THREE.MeshBasicMaterial({ color: "orange" }),
    house: new THREE.MeshBasicMaterial({ color: "yellow" }),
    trailer: new THREE.MeshBasicMaterial({ color: "khaki" }),
    greenhouse: new THREE.MeshBasicMaterial({ color: "green" }),
    farm_auxiliary: new THREE.MeshBasicMaterial({ color: "aquamarine" }),
    industrial: new THREE.MeshBasicMaterial({ color: "darkblue" }),
    default: new THREE.MeshBasicMaterial({ color: "deeppink" }),
};

const highwayMaterials = {
    pedestrian: new THREE.LineBasicMaterial({ color: "black" }),
    residential: new THREE.LineBasicMaterial({ color: "coral" }),
    service: new THREE.LineBasicMaterial({ color: 0xf695fc }),
    tertiary: new THREE.LineBasicMaterial({ color: "skyblue" }),
    secondary: new THREE.LineBasicMaterial({ color: "lightgreen" }),
    track: new THREE.LineBasicMaterial({ color: "brown" }),
    secondary_link: new THREE.LineBasicMaterial({ color: "magenta" }), // Wheel chair ramp
    cycleway: new THREE.LineBasicMaterial({ color: "Bisque" }),
    footway: new THREE.LineBasicMaterial({ color: 0x828282 }),
    path: new THREE.LineBasicMaterial({ color: 0xE6E6FA }),
    steps: new THREE.LineDashedMaterial({ color: "orchid", linewidth: 1, scale: 1, dashSize: .4, gapSize: .4, opacity: 0.2 }),
    living_street: new THREE.LineBasicMaterial({ color: 0xfffdb8 }),
    default: new THREE.LineBasicMaterial({ color: "black" }),
}

const highlightedMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd700,   // Gold color
    emissive: 0xffa500, // Orange emissive color for a glowing effect
    roughness: 0.5,
    metalness: 0.1
});


function getHighwayMatrial(type) {
    switch (type) {
        case "pedestrian": return highwayMaterials.pedestrian;
        case "residential": return highwayMaterials.residential;
        case "service": return highwayMaterials.service;
        case "tertiary": return highwayMaterials.tertiary;
        case "secondary": return highwayMaterials.secondary;
        case "track": return highwayMaterials.track;
        case "secondary_link": return highwayMaterials.secondary_link; // Wheel chair ramp
        case "cycleway": return highwayMaterials.cycleway;
        case "footway": return highwayMaterials.footway;
        case "path": return highwayMaterials.path;
        case "steps": return highwayMaterials.steps;
        case "living_street": return highwayMaterials.living_street;
        case "crossing": return highwayMaterials.default;
        case "traffic_signals": return highwayMaterials.default;
        case "turning_circle": return highwayMaterials.default;
        case "proposed": return highwayMaterials.default;
        default: return highwayMaterials.default;
    }
}

function getBuildingMaterial(type) {

    switch (type) {
        case "university": return buildingMaterials.university;
        case "apartments": return buildingMaterials.apartments;
        case "roof": return buildingMaterials.roof;
        case "dormitory": return buildingMaterials.dormitory;
        case "house": return buildingMaterials.house;
        case "trailer": return buildingMaterials.trailer;
        case "greenhouse": return buildingMaterials.greenhouse;
        case "farm_auxiliary": return buildingMaterials.farm_auxiliary;
        case "industrial": return buildingMaterials.industrial
        default: return buildingMaterials.default;
    }
}


export { getBuildingMaterial, getHighwayMatrial, highlightedMaterial };