import * as THREE from "three"

/**
 * Returns the average value in the range `[start, end)` for the provided byte array.
 * 
 * @param array - byte array
 * @param start - start index for range (inclusive)
 * @param end - end index for range (non-inclusive)
 * @returns average value in range [start, end)
 */
const calculateAverage = (array: Uint8Array, start: number, end: number): number => {
    let sum = 0;
    for (let i = start; i <= end; ++i) {
        sum += array[i]
    }
    return sum / (end - start + 1)
}

/**
 * Returns value normalized in range 0-1.
 * 
 * @param value - value to normalize
 * @param range - maximum value for a value (the divisor during normalization)
 */
const normalizeValue = (value: number, range: number) => {
    return value / range
}

/**
 * AudioManager.
 */
export default class AudioManager {
    song: { url: string; };
    isPlaying: boolean;
    isAudioLoaded: boolean;

    frequencyArray?: Uint8Array;
    frequencyData: { low: number; mid: number; high: number; };

    lowFrequency: number;
    midFrequency: number;
    highFrequency: number;
    smoothedLowFrequency: number;

    audio?: THREE.Audio<GainNode>
    audioAnalyser?: THREE.AudioAnalyser;
    bufferLength?: number;

    constructor() {
        this.frequencyData = { low: 0, mid: 0, high: 0 };

        this.lowFrequency = 10;    // 10 - 250 Hz
        this.midFrequency = 150;   // 150 - 2000 Hz
        this.highFrequency = 9000; // 2000 - 20000 Hz

        this.isPlaying = false;
        this.isAudioLoaded = false;

        this.smoothedLowFrequency = 0;
        this.song = { url: "/audio.mp3" }

        console.log("constructed audio manager")
    }

    async loadAudioBuffer() {
        const promise = new Promise<void>(async (resolve, reject) => {
            const audioLoader = new THREE.AudioLoader();

            const audioListener = new THREE.AudioListener();

            audioLoader.load(this.song.url,
                (buffer) => {
                    this.audio = new THREE.Audio(audioListener);
                    this.audio.setBuffer(buffer);
                    this.audio.setLoop(true);
                    this.audio.setVolume(0.5);

                    this.audioAnalyser = new THREE.AudioAnalyser(this.audio, 1024);
                    this.bufferLength = this.audioAnalyser.data.length;

                    this.isAudioLoaded = true
                    console.log("loaded audio")

                    resolve();
                },
                (event) => {
                    const { total, loaded } = event;
                    console.log(`loaded ${((loaded / total) * 100).toFixed(2)}%`)
                },
                (error) => {
                    console.error("failed to load audio:", error)
                    reject()
                }
            );

        });


        return promise
    }

    async play() {
        if (!this.isAudioLoaded) {
            await this.loadAudioBuffer();
        }
        if (this.audio) {
            this.audio.play()
            this.isPlaying = true
            console.log("started audio")
        }
    }

    pause() {
        if (this.audio) {
            this.audio.pause()
            this.isPlaying = false
            console.log("stopped audio")
        }
    }

    collectAudioData() {
        this.frequencyArray = this.audioAnalyser?.getFrequencyData()
    }

    analyzeFrequency() {
        if (!this.audio || !this.bufferLength || !this.frequencyArray) {
            return
        }

        const sampleRate = this.audio.context.sampleRate;
        const range = 256; // Maximum for 8-bit data.

        const lowFreqRangeStart = Math.floor((this.lowFrequency * this.bufferLength) / sampleRate);
        const midFreqRangeStart = Math.floor((this.midFrequency * this.bufferLength) / sampleRate);
        const highFreqRangeStart = Math.floor((this.highFrequency * this.bufferLength) / sampleRate);
        const highFreqRangeEnd = this.bufferLength - 1;

        const lowAvg = calculateAverage(this.frequencyArray, lowFreqRangeStart, midFreqRangeStart);
        const midAvg = calculateAverage(this.frequencyArray, midFreqRangeStart, highFreqRangeStart);
        const highAvg = calculateAverage(this.frequencyArray, highFreqRangeStart, highFreqRangeEnd);

        this.frequencyData = {
            low: normalizeValue(lowAvg, range),
            mid: normalizeValue(midAvg, range),
            high: normalizeValue(highAvg, range)
        }
    }

    update() {
        if (!this.isPlaying) {
            return
        }

        this.collectAudioData();
        this.analyzeFrequency();
    }
}