import * as THREE from "three"
import AudioManager from "./AudioManager"

class AudioVisualizer {
  width: number;
  height: number;

  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;

  static objects: THREE.Object3D<THREE.Object3DEventMap>;

  constructor() {
    this.width = window.innerWidth
    this.height = window.innerHeight

    // Create scene
    this.scene = new THREE.Scene();

    // Create camera
    const aspect = this.width / this.height;
    this.camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 10000);
    this.camera.position.z = 12;
    this.camera.frustumCulled = false;

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Add renderer to DOM
    const app = document.getElementById("app");
    if (app) {
      console.log("visualizer setting renderer")
      app.appendChild(this.renderer.domElement);
    }

    // Handle resize 
    this.resize();
    window.addEventListener('resize', () => this.resize())

    console.log("visualizer constructed");
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    if (this.camera) {
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
    }
    this.renderer?.setSize(this.width, this.height);
    console.log(`resized to ${this.width}x${this.height}`)
  }

  // Render loop.
  update() {
    App.audioManager.update()
    this.renderer.render(this.scene, this.camera)

    requestAnimationFrame(() => this.update())
  }
}

export default class App {
  static visualizer: AudioVisualizer;
  static audioManager: AudioManager;

  constructor() {
    App.visualizer = new AudioVisualizer();
    App.audioManager = new AudioManager();

    // Start update loop
    App.visualizer.update()

    // Register click handler
    document.addEventListener('click', this.onClick)

    console.log("app constructed");
  }

  async onClick() {
    if (!App.audioManager.isPlaying) {
      await App.audioManager.play()
    } else {
      App.audioManager.pause()
    }
  }
}

new App();