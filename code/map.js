import * as THREE from 'three';

import createBuildings from './buildings';
import createRoutes from './routes';

class Map extends THREE.Object3D {
    constructor() {
        super();

        this.buildings = null;
        this.routes = null;

        this.raycast = new THREE.Raycaster();
        this.raycast.params.Line.threshold = 3;

        this.init();
    }

    async init() {

        // Try to make the buildings and the routes
        try {
            const buildingsGroup = await createBuildings();
            console.log('Buildings loaded:', buildingsGroup);
            this.buildings = buildingsGroup;
            this.add(this.buildings);
            console.log(this.buildings.children);

            const routesGroup = await createRoutes();
            console.log('Routes loaded', routesGroup);
            this.routes = routesGroup;
            this.add(this.routes);

        } catch (error) {
            console.error('Failed to load buildings:', error);
        }
    }

    update(time) {

    }
}


export default Map;