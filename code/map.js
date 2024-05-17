import * as THREE from 'three';
import Openrouteservice from 'openrouteservice-js'
import createBuildings from './buildings';
import createHighways from './highways';
import makeDirection from './makeDirection';
import { getProfileInfo } from './profiles';

// So I want to be able to export this Map as a contain unite where it handles routing between different locations, drawing, etc 
// The main problem is that I want to be able to use this map with different controllers and in different spaces like XR, mobile, and desktop 

// Things to do: 
// make stuff simple 
// add elevation 
// improve performance in route section 
// add a search bar 
// add 2D text to map 
// add hover 
// add default UI, problem: I need two different UIs 2D and 3D (for XR); 
// add multi 

function deselectBuilding(object) {
    object.material.color.setHex(object.userData.color);
    object.material.needsUpdate = true;
}

function selectBuilding(object) {
    object.material.color.setHex(0x000000);
    object.material.needsUpdate = true;
}

class Map extends THREE.Object3D {
    constructor(scene = null) {
        super();

        if (Map.instance) {
            return Map.instance;
        }

        this.buildings = null;
        this.highways = null;
        this.rotateY(Math.PI);
        this.scale.multiplyScalar(.25);
        scene.add(this);

        this.position.y = 5

        Map.instance = this;

        // Tools 
        this.orsDirections = new Openrouteservice.Directions({ api_key: import.meta.env.VITE_OPENSTREET_API_KEY });

        this.routes = [];
        this.clickedBuildings = new Set();

        // Profile type 
        this.profile = getProfileInfo('walking', 'walking');

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

            let from = this.clickedBuildings[0].userData.centroid;
            let to = this.clickedBuildings[1].userData.centroid;
            console.log("Getting Directions from " + from + " and " + to);

            // Don't ask lol 
            from = [from[0], from[1]];
            to = [to[0], to[1]];

            let temp = this;

            this.orsDirections.calculate({
                coordinates: [from, to],
                profile: temp.profile.profile,
                format: "geojson",
                api_version: 'v2',
            })
                .then(function (json) {

                    const routeCoordinates = json.features.find(feature => feature.geometry.type === 'LineString').geometry.coordinates;
                    const route = makeDirection(routeCoordinates);
                    console.log("cords:= ", route)
                    temp.routes.push(route);
                    temp.add(route);
                    console.log(JSON.stringify(json));
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
            console.log("Route cleared")
            this.remove(route);
        })

        this.routes = [];
    }

    checkIntersectedBuildings(object) {

        console.log("Building clicked", object.userData.info['@id']);
        console.log(this.profile)

        // let temp = -1;
        // for (let i = this.clickedBuildings.length - 1; i >= 0; i--) {
        //     if (this.clickedBuildings[i] === object) {
        //         temp = i;
        //         i = this.clickedBuildings.length + 2; // dip out 
        //     }
        // }

        // if (temp > -1) {
        //     this.clickedBuildings.splice(i, 1);
        //     deselectBuilding(object);
        // } else {
        //     selectBuilding(object);
        //     this.clickedBuildings.push(object);
        // }
    }

    update(time) {

    }

}




export default Map;