import * as THREE from 'three';

import createBuildings from './buildings';
import createRoutes from './routes';
import { fetchDirections } from './directions';
import makeDirection from './makeDirection';
let A = null;
let B = null;

// Define initial points for out line helper
const points = [];
points.push(new THREE.Vector3(-10, 0, 0));
points.push(new THREE.Vector3(10, 0, 2));

// Create the geometry and material
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const material = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 10 });

// Set up mouse events for raycasting

class Map extends THREE.Object3D {
    constructor(renderer, camera) {
        super();
        this.camera = camera;
        this.renderer = renderer;
        this.buildings = null;
        this.routes = null;
        this.rotateY(Math.PI);
        this.scale.multiplyScalar(.25);
        this.mouse = new THREE.Vector2();
        // Create the line object and add to scene
        this.line = new THREE.Line(geometry, material);
        this.line.visible = false;
        this.add(this.line);

        // Value to store current drawn route 
        this.route = null;
        // Raycaster 
        this.raycast = new THREE.Raycaster();
        //raycast.params.Line.threshold = 3;
        this.init();
    }

    async init() {

        // Try to make the buildings and the routes
        try {
            const buildingsGroup = await createBuildings();
            console.log('Buildings loaded:', buildingsGroup);
            this.buildings = buildingsGroup;
            this.add(this.buildings);
            //console.log(this.buildings.children);

            const routesGroup = await createRoutes();
            console.log('Routes loaded', routesGroup);
            this.routes = routesGroup;
            this.routes.position.y = -0.1
            this.add(this.routes);

            this.renderer.domElement.addEventListener('click', (event) => {
                console.log("clicked");

                if (this.buildings == null) { return } // Not ready yet

                // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
                this.mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
                this.mouse.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

                // Update the picking ray with the camera and mouse position
                this.raycast.setFromCamera(this.mouse, this.camera);

                // Calculate objects intersecting the picking ray
                const intersects = this.raycast.intersectObjects(this.buildings.children, true);

                if (intersects.length > 0) {

                    let object = intersects[0].object;

                    if (object.userData.type == "building") {
                        console.log("Building clicked", object.userData.info);
                        if (A == null) {
                            A = object;
                            A.material.color.addScalar(.5);
                            A.material.needsUpdate = true;
                        } else if (A != null && B == null) {
                            B = object;
                            B.material.color.addScalar(.5);
                            B.material.needsUpdate = true;

                            this.updateLine(A.position, B.position);
                            //this.line.visible = true;

                            let map = this;
                            fetchDirections(A, B, (cords) => {
                                const route = makeDirection(cords);
                                console.log("cords:= ", route)
                                this.route = route;
                                map.add(this.route);
                            });
                        }
                    } else {
                        console.log("Route clicked", object.userData.info);
                    }
                } else {
                    // If user clicked nothing then reset A and B
                    if (A) {
                        A.material.color.addScalar(-.5);
                        A.material.needsUpdate = true;
                        A = null;
                    }

                    if (B) {
                        B.material.color.addScalar(-.5);
                        B.material.needsUpdate = true;
                        B = null;
                    }

                    if (this.route != null) {
                        this.remove(this.route);
                        this.route.geometry.dispose();
                        this.route = null;
                    }

                    //this.line.visible = false;
                }
            })

        } catch (error) {
            console.error('Failed to load buildings:', error);
        }
    }

    updateLine(newStart, newEnd) {

        console.log(newStart, newEnd);
        const positions = this.line.geometry.attributes.position.array;
        positions[0] = newStart.x; // x of first point
        positions[1] = newStart.y; // y of first point
        positions[2] = newStart.z; // z of first point
        positions[3] = newEnd.x;   // x of second point
        positions[4] = newEnd.y;   // y of second point
        positions[5] = newEnd.z;   // z of second point
        this.line.geometry.attributes.position.array = positions;
        this.line.geometry.attributes.position.needsUpdate = true; // Required: update the geometry
        this.line.geometry.computeBoundingSphere(); // Recompute bounding sphere (if needed)
    }

    update(time) {

    }
}


export default Map;