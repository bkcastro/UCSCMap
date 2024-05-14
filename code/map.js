import * as THREE from 'three';
import Openrouteservice from 'openrouteservice-js'

import createBuildings from './buildings';
import createHighways from './highways';

import makeDirection from './makeDirection';

// So I want to be able to export this Map as a contain unite where it handles routing between different locations, drawing, etc 
// The main problem is that I want to be able to use this map with different controllers and in different spaces like XR, mobile, and desktop 

// Things to do: 
// make stuff simple 
// add elevation 
// improve performance in route section 
// add a search bar 
// add 2D text to map 
// add hover 
// add multi building routing 
// add a Level Of Detail algorithm to improve performance. I think this LOD can be really neat. 
    // - Like only draw the primary highways and not the pedestrian highways when the camera 
    //   is at a certain distance from the map. 
    // - Clipping! We can take stuff out of the renderer if we can't see it. 
// ? where can I get images ? that change in level of detail? how do I make my map cooler? 
// Should I draw onto a texture green areas which represent trees, grass, roads, etc. Lot of work 

function deselectBuilding(object) {
    object.material.color.setHex(object.userData.color);
    object.material.needsUpdate = true;
}

function selectBuilding(object) {
    object.material.color.setHex(0x000000);
    object.material.needsUpdate = true;
}

class Map extends THREE.Object3D {
    constructor() {
        super();
        this.buildings = null;
        this.highways = null;
        this.rotateY(Math.PI);
        this.scale.multiplyScalar(.25);

        // Tools 
        this.orsDirections = new Openrouteservice.Directions({ api_key: import.meta.env.VITE_OPENSTREET_API_KEY });

        // Value to store current drawn route 
        this.routes = [];
        this.clickedBuildings = [];

        this.init();
    }

    async init() {
        try {
            const buildingsGroup = await createBuildings();
            console.log('Buildings loaded:', buildingsGroup);
            this.buildings = buildingsGroup;
            this.add(this.buildings);
            //console.log(this.buildings.children);

            const routesGroup = await createHighways();
            console.log('Highways loaded', routesGroup);
            this.highways = routesGroup;
            this.highways.position.y = -0.1
            this.add(this.highways);

        } catch (error) {
            console.error('Failed to load buildings:', error);
        }

    }
    // This function draws the route. 
    generateDirections() {

        let length = this.clickedBuildings.length;
        if (length <= 1) {
            console.log("Not enough buildings clicked");
            return
        } else if (length == 2) {

            const from = this.clickedBuildings[0].userData.centroid;
            const to = this.clickedBuildings[1].userData.centroid;
            console.log("Getting Directions from " + from + " and " + to);

            let temp = this;

            this.orsDirections.calculate({
                coordinates: [from, to],
                profile: "driving-car",
                format: "geojson",
                api_version: 'v2',
            })
                .then(function (json) {

                    const routeCoordinates = json.features.find(feature => feature.geometry.type === 'LineString').geometry.coordinates;
                    const route = makeDirection(routeCoordinates);
                    console.log("cords:= ", route)
                    temp.routes.push(route);
                    temp.add(route);
                })
                .catch(function (err) {
                    let response = JSON.stringify(err, null, "\t")
                    console.error(response);
                })

        } else { // Matrix direction 

        }
    }

    clearRoutes() {

        // Clear the buildings then the routes 
        this.clickedBuildings.forEach((building) => {
            deselectBuilding(building);
        })

        this.clickedBuildings = [];

        this.routes.forEach((route) => {
            console.log("hi kill me ")
            this.remove(route);
        })

        this.routes = [];
    }

    checkIntersectedBuildings(object) {

        console.log("Building clicked", object.userData.info);

        let temp = -1;
        for (let i = this.clickedBuildings.length - 1; i >= 0; i--) {
            if (this.clickedBuildings[i] === object) {
                temp = i;
                i = this.clickedBuildings.length + 2; // dip out 
            }
        }

        if (temp > -1) {
            this.clickedBuildings.splice(i, 1);
            deselectBuilding(object);
        } else {
            selectBuilding(object);
            this.clickedBuildings.push(object);
        }
    }

    update(time) {

    }
}




export default Map;