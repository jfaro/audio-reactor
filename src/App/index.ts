import AudioManager from "../AudioManager"
import AudioVisualizer from "../AudioVisualizer";

export default class App {
    static visualizer: AudioVisualizer;
    static audioManager: AudioManager;

    constructor() {
        App.audioManager = new AudioManager();

        // Starting update loop requires audio manager to be initialized. Maybe a 
        // reference to existing audio source should be required as an argument.
        App.visualizer = new AudioVisualizer();
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

