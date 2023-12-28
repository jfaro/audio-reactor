import * as THREE from "three"
import AudioManager from "./AudioManager"

class AudioVisualizer {
  width: number;
  height: number;

  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;

  static objects: THREE.Object3D<THREE.Object3DEventMap>;
  static audioManager: AudioManager;

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

    // Add cube for testing
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);

    // Create audio manager.
    this.createAudioManager()

    // Handle resize 
    this.resize();
    window.addEventListener('resize', () => this.resize())

    // Start update loop
    this.update()
    console.log("visualizer constructed");
  }

  async createAudioManager() {
    AudioVisualizer.audioManager = new AudioManager();
    await AudioVisualizer.audioManager.loadAudioBuffer();
    AudioVisualizer.audioManager.play()
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

  update() {
    requestAnimationFrame(() => this.update())

    // Update audio.
    AudioVisualizer.audioManager?.update()

    // Update scene.
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera)
    }
  }
}

export default class App {
  onClick: () => void;
  static visualizer?: AudioVisualizer;

  constructor() {
    this.onClick = () => this.start();
    document.addEventListener('click', this.onClick)
    console.log("app constructed");
  }

  start() {
    document.removeEventListener('click', this.onClick)
    App.visualizer = new AudioVisualizer()
    console.log("app started");
  }
}

new App();