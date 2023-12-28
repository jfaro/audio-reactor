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
        this.camera = new THREE.PerspectiveCamera(80, this.width / this.height, 0.1, 10000);
        this.camera.position.z = 2;
        this.camera.frustumCulled = false;

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Add renderer to DOM
        const app = document.getElementById("app");
        if (app) {
            app.appendChild(this.renderer.domElement);
        } else {
            throw new Error("no #app element in DOM")
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
                size: { value: 1 }, // Vertex size
                frequency: { value: 1 }, // Single point rate of vibration
                amplitude: { value: 1 }, // Distance points travel away from home
                offsetGain: { value: 0.1 }, // Collective vibration amount
                maxDistance: { value: 2 }, // Greater value results in larger jump
                startColor: { value: new THREE.Color(0xee0000) },
                endColor: { value: new THREE.Color(0x4422ff) }
            },
        });
        this.time = 0;

        // Create cube
        const geometry = new THREE.BoxGeometry(1, 1, 1, 50, 20, 50)
        const pointsMesh = new THREE.Points(geometry, this.material);
        this.objects.add(pointsMesh)

        // Handle resize 
        this.resize();
        window.addEventListener('resize', () => this.resize())
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

        // Use audio to affect materials
        const ampHigh = App.audioManager.frequencyData.high;
        const ampMid = App.audioManager.frequencyData.mid;
        const ampLow = App.audioManager.frequencyData.low;

        // Point scaling
        const scaling = THREE.MathUtils.mapLinear(ampHigh, 0, 0.6, 2, 3)
        this.material.uniforms.size.value = THREE.MathUtils.clamp(scaling, 2, 3);

        // Warp amplitude
        const magMid = THREE.MathUtils.mapLinear(ampMid, 0, 0.6, -0.1, 1)
        this.material.uniforms.amplitude.value = magMid

        // Vibrate gain
        const offsetGain = ampHigh * 0.6;
        this.material.uniforms.offsetGain.value = offsetGain;

        // Time delta
        const delta = THREE.MathUtils.mapLinear(ampLow, 0.6, 1, 0.1, 0.4);
        const deltaClamped = THREE.MathUtils.clamp(delta, 0.1, 0.4)

        // Progress time
        this.time += deltaClamped * 0.2;
        this.material.uniforms.time.value = this.time;

        // Rotate cube
        this.objects.rotation.x += deltaClamped * 0.01
        this.objects.rotation.y += deltaClamped * 0.05

        // Re-render
        this.renderer.render(this.scene, this.camera)
    }
}