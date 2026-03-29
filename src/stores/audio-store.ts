import { create } from "zustand";

interface AudioState {
  isPlaying: boolean;
  currentTitle: string | null;
  currentAudio: HTMLAudioElement | null;
  progress: number;
  voice: string;
  speed: number;

  play: (title: string, text: string) => Promise<void>;
  toggle: () => void;
  stop: () => void;
  setVoice: (voice: string) => void;
  setSpeed: (speed: number) => void;
  setProgress: (progress: number) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  isPlaying: false,
  currentTitle: null,
  currentAudio: null,
  progress: 0,
  voice: "nova",
  speed: 1,

  play: async (title, text) => {
    const { currentAudio, voice, speed } = get();

    // Stop current audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.removeAttribute("src");
    }

    set({ currentTitle: title, isPlaying: false, progress: 0 });

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice, speed }),
      });

      if (!response.ok) throw new Error("TTS request failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.addEventListener("timeupdate", () => {
        if (audio.duration) {
          set({ progress: audio.currentTime / audio.duration });
        }
      });

      audio.addEventListener("ended", () => {
        set({ isPlaying: false, progress: 1 });
      });

      await audio.play();
      set({ currentAudio: audio, isPlaying: true });
    } catch (error) {
      console.error("Audio playback failed:", error);
      set({ currentTitle: null, isPlaying: false });
    }
  },

  toggle: () => {
    const { currentAudio, isPlaying } = get();
    if (!currentAudio) return;

    if (isPlaying) {
      currentAudio.pause();
    } else {
      currentAudio.play();
    }
    set({ isPlaying: !isPlaying });
  },

  stop: () => {
    const { currentAudio } = get();
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.removeAttribute("src");
    }
    set({
      currentAudio: null,
      currentTitle: null,
      isPlaying: false,
      progress: 0,
    });
  },

  setVoice: (voice) => set({ voice }),
  setSpeed: (speed) => set({ speed }),
  setProgress: (progress) => set({ progress }),
}));
