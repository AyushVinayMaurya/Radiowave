import { useEffect, useRef, useState } from "react";
import { songs } from "../data/songs";

function RadioPlayer() {
  const audioRef = useRef(null);

  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);

  const song = songs[currentSongIndex];

  // Load current song
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.pause();

    audio.src = song.audio;
    audio.load();

    setCurrentTime(0);
    setDuration(0);

    if (isPlaying) {
      audio.play().catch((error) => {
        console.error("Audio could not play:", error);
        setIsPlaying(false);
      });
    }
  }, [currentSongIndex]);

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.volume = volume;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      nextSong();
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);

      audio.removeEventListener("timeupdate", handleTimeUpdate);

      audio.removeEventListener("ended", handleEnded);
    };
  }, [volume, currentSongIndex]);

  // Play / Pause
  const togglePlay = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Audio could not play:", error);
      }
    }
  };

  // Next song
  const nextSong = () => {
    setCurrentSongIndex((currentIndex) => {
      return (currentIndex + 1) % songs.length;
    });
  };

  // Previous song
  const previousSong = () => {
    setCurrentSongIndex((currentIndex) => {
      return (currentIndex - 1 + songs.length) % songs.length;
    });
  };

  // Progress
  const handleProgress = (event) => {
    const newTime = Number(event.target.value);

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Volume
  const handleVolume = (event) => {
    const newVolume = Number(event.target.value);

    setVolume(newVolume);

    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Format time
  const formatTime = (time) => {
    if (!time || isNaN(time)) {
      return "00:00";
    }

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  };

  return (
    <section
      className="radio-player"
      style={{
        backgroundImage: `url(${song.wallpaper})`,
      }}
    >
      <div className="overlay"></div>

      <audio ref={audioRef} preload="metadata" />

      <div className="player-content">
        <div className="radio-icon">📻</div>

        <p className="radio-label">90s RADIO</p>

        <h1>Feel the Nostalgia</h1>

        <div className="song-info">
          <h2>{song.title}</h2>

          <p>{song.artist}</p>
        </div>

        {/* Progress */}

        <div className="progress-container">
          <input
            className="progress-slider"
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgress}
          />
        </div>

        <div className="time">
          <span>{formatTime(currentTime)}</span>

          <span>{formatTime(duration)}</span>
        </div>

        {/* Controls */}

        <div className="controls">
          <button onClick={previousSong} aria-label="Previous song">
            ⏮
          </button>

          <button
            className="play-button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>

          <button onClick={nextSong} aria-label="Next song">
            ⏭
          </button>
        </div>

        {/* Volume */}

        <div className="volume">
          <span>🔊</span>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolume}
          />
        </div>

        {/* Visualizer */}

        <div className={`visualizer ${isPlaying ? "playing" : ""}`}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <p className="live">LIVE FROM 90s</p>
      </div>
    </section>
  );
}

export default RadioPlayer;
