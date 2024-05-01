import * as THREE from 'three';

class Controllers {
  constructor(renderer, camera) {

    // Set up mouse events for raycasting
    this.mouse = new THREE.Vector2();
    this.renderer = renderer;

    renderer.domElement.addEventListener('click', () => {
      console.log("clicked");

      if (map.buildings == null) { return } // Not ready yet

      // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
      mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

      // Update the picking ray with the camera and mouse position
      raycast.setFromCamera(mouse, camera);

      // Calculate objects intersecting the picking ray
      const intersects = raycast.intersectObjects(map.buildings.children, true);

      if (intersects.length > 0) {
        //console.log('Building clicked:', intersects[0].object);

        const randomColor = new THREE.Color(Math.random() * 0xffffff);
        intersects[0].object.material.color = randomColor;
        intersects[0].object.material.needsUpdate = true;
      }
    });
  }
}

export default Controllers; 
