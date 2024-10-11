import { PerspectiveCamera } from 'three';

class Browser {
    container: any;
    camera: PerspectiveCamera;
    renderer: THREE.WebGLRenderer;

    constructor(container: any, camera: PerspectiveCamera, renderer: THREE.WebGLRenderer) {
        this.container = container;
        this.camera = camera;
        this.renderer = renderer;
    
        window.addEventListener('resize', this.WindowResize.bind(this), false);
    }

    Destroy() {
        window.removeEventListener('resize', this.WindowResize.bind(this), false);
    }

    WindowResize() {
        this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
        this.camera.updateProjectionMatrix();
    
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    }
}

export { Browser };