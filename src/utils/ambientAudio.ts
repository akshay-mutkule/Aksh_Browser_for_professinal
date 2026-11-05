/**
 * Procedural Web Audio Focus Soundscapes
 * Synthesizes ambient noise and binaural tones completely client-side without external audio assets.
 */

export type SoundscapeType = 'rain' | 'waves' | 'brown' | 'binaural' | 'gamma40' | 'cyber';

class AmbientSoundscapeEngine {
  private ctx: AudioContext | null = null;
  private currentType: SoundscapeType | null = null;
  private isPlaying = false;
  private gainNode: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private volume = 0.4;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentType: this.currentType,
      volume: this.volume,
    };
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public stop() {
    if (!this.ctx) return;
    this.activeNodes.forEach((node) => {
      try {
        if (typeof node === 'number') {
          window.clearInterval(node);
        } else if ('stop' in node && typeof (node as any).stop === 'function') {
          (node as any).stop();
        } else {
          node.disconnect();
        }
      } catch (e) {
        // ignore disconnect errors
      }
    });
    this.activeNodes = [];
    this.isPlaying = false;
    this.currentType = null;
  }

  public play(type: SoundscapeType) {
    this.initContext();
    if (!this.ctx) return;

    if (this.isPlaying && this.currentType === type) {
      this.stop();
      return;
    }

    this.stop();
    this.isPlaying = true;
    this.currentType = type;

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    masterGain.connect(this.ctx.destination);
    this.gainNode = masterGain;

    if (type === 'rain') {
      this.createRainSoundscape(masterGain);
    } else if (type === 'waves') {
      this.createWavesSoundscape(masterGain);
    } else if (type === 'brown') {
      this.createBrownNoiseSoundscape(masterGain);
    } else if (type === 'binaural') {
      this.createBinauralSoundscape(masterGain);
    } else if (type === 'gamma40') {
      this.createGamma40Soundscape(masterGain);
    } else if (type === 'cyber') {
      this.createCyberSoundscape(masterGain);
    }
  }

  private createNoiseBuffer(durationSeconds = 5): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown noise integration
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }
    return buffer;
  }

  private createRainSoundscape(targetGain: GainNode) {
    if (!this.ctx) return;
    const noiseBuffer = this.createNoiseBuffer(6);
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // High pass to isolate rain droplets hiss
    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(800, this.ctx.currentTime);

    // Low pass for warm rain atmosphere
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(4500, this.ctx.currentTime);

    noiseSource.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(targetGain);

    noiseSource.start();
    this.activeNodes.push(noiseSource, highpass, lowpass);
  }

  private createWavesSoundscape(targetGain: GainNode) {
    if (!this.ctx) return;
    const noiseBuffer = this.createNoiseBuffer(8);
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);

    // LFO to modulate wave surge
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8 sec ocean swell cycle
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(450, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noiseSource.connect(filter);
    filter.connect(targetGain);

    noiseSource.start();
    lfo.start();
    this.activeNodes.push(noiseSource, filter, lfo, lfoGain);
  }

  private createBrownNoiseSoundscape(targetGain: GainNode) {
    if (!this.ctx) return;
    const noiseBuffer = this.createNoiseBuffer(5);
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(600, this.ctx.currentTime);

    noiseSource.connect(lowpass);
    lowpass.connect(targetGain);

    noiseSource.start();
    this.activeNodes.push(noiseSource, lowpass);
  }

  private createBinauralSoundscape(targetGain: GainNode) {
    if (!this.ctx) return;
    // 432 Hz Alpha wave tone (432Hz and 440Hz for 8Hz alpha beat frequency)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(432, this.ctx.currentTime);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(440, this.ctx.currentTime); // 8Hz beat difference

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    osc1.connect(subGain);
    osc2.connect(subGain);
    subGain.connect(targetGain);

    osc1.start();
    osc2.start();
    this.activeNodes.push(osc1, osc2, subGain);
  }

  private createGamma40Soundscape(targetGain: GainNode) {
    if (!this.ctx) return;
    // 40Hz Gamma wave cognitive synchrony (200Hz carrier tone and 240Hz tone = 40Hz gamma entrainment)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(200, this.ctx.currentTime);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(240, this.ctx.currentTime);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    // Subtle lowpass to make it deeply comfortable for prolonged coding / reading
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    osc1.connect(subGain);
    osc2.connect(subGain);
    subGain.connect(filter);
    filter.connect(targetGain);

    osc1.start();
    osc2.start();
    this.activeNodes.push(osc1, osc2, subGain, filter);
  }

  private createCyberSoundscape(targetGain: GainNode) {
    if (!this.ctx) return;
    // Ambient cyberpunk server room drone: low fundamental + resonant warmth + soft noise
    const noiseBuffer = this.createNoiseBuffer(6);
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(240, this.ctx.currentTime);
    noiseFilter.Q.setValueAtTime(3, this.ctx.currentTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(targetGain);

    // Warm sub-bass drone oscillator (55Hz / A1)
    const droneOsc = this.ctx.createOscillator();
    droneOsc.type = 'triangle';
    droneOsc.frequency.setValueAtTime(55, this.ctx.currentTime);

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.15, this.ctx.currentTime);

    droneOsc.connect(droneGain);
    droneGain.connect(targetGain);

    noiseSource.start();
    droneOsc.start();
    this.activeNodes.push(noiseSource, noiseFilter, noiseGain, droneOsc, droneGain);
  }
}

export const ambientSound = new AmbientSoundscapeEngine();
