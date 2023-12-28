import AudioManager from "./AudioManager"
import AudioVisualizer from "./AudioVisualizer";

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