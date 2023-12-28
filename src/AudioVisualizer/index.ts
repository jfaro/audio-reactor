import * as THREE from "three"
import App from "../main"
import { vertex } from "../glsl/vertex";
import { fragment } from "../glsl/fragment";

export default class AudioVisualizer {
    width: number;
    height: number;
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;

    objects: THREE.Object3D<THREE.Object3DEventMap>;
    material: THREE.ShaderMaterial;
    time: number

    constructor() {
        this.width = window.innerWidth
        this.height = window.innerHeight

        // Create scene
        this.scene = new THREE.Scene();

        // Create camera
        this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 0.1, 10000);
        this.camera.position.z = 2;
        this.camera.frustumCulled = false;

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Add renderer to DOM
        const app = document.getElementById("app");
        if (app) {
            console.log("visualizer setting renderer")
            app.appendChild(this.renderer.domElement);
        }

        // Initialize objects container and add to scene
        this.objects = new THREE.Object3D();
        this.scene.add(this.objects)

        // Object material
        this.material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            vertexShader: vertex,
            fragmentShader: fragment,
            transparent: true,
            uniforms: {
                time: { value: 0 },
                offsetSize: { value: 0.1 },
                size: { value: 1.5 }, // Vertex size
                frequency: { value: 1 }, // Single point rate of vibration
                amplitude: { value: 1 }, // Distance points travel away from home
                offsetGain: { value: 0.1 }, // Collective vibration amount
                maxDistance: { value: 2 }, // Greater value results in larger jump
            },
        });
        this.time = 0;

        // Create cube
        const geometry = new THREE.BoxGeometry(1, 1, 1, 200, 20, 20)
        const pointsMesh = new THREE.Points(geometry, this.material);
        this.objects.add(pointsMesh)

        // Handle resize 
        this.resize();
        window.addEventListener('resize', () => this.resize())

        console.log("visualizer constructed");
    }

    // Window resize handler.
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }

    // Render loop.
    update() {
        requestAnimationFrame(() => this.update())

        // Update audio analysis
        App.audioManager.update()

        // Progress time
        this.time += 0.1;
        this.material.uniforms.time.value = this.time;

        // Rotate cube
        this.objects.rotation.x += 0.01
        this.objects.rotation.y += 0.01

        // Re-render
        this.renderer.render(this.scene, this.camera)
    }
}