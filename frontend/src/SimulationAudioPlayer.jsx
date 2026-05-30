import { useEffect, useRef, useState } from 'react';

const controlButton = {
  minWidth: 64,
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid rgba(148,163,184,0.24)',
  background: 'rgba(15,23,42,0.75)',
  color: '#e2e8f0',
  fontSize: 11,
  fontWeight: 800,
  fontFamily: 'inherit',
};

function getSpeechVoice(voices, voiceHint) {
  if (!voices?.length) return null;
  const hint = (voiceHint || '').toLowerCase();
  const englishVoices = voices.filter(v => /^en[-_]/i.test(v.lang));
  const profiles = {
    female: /zira|susan|samantha|victoria|karen|aria|jenny|female/i,
    male: /david|daniel|guy|mark|alex|george|ryan|male/i,
    executive: /guy|daniel|david|mark|alex|george|ryan/i,
    support: /zira|jenny|aria|susan|samantha|karen/i,
    caller: /david|zira|guy|jenny|aria|alex|samantha/i,
  };
  if (hint && profiles[hint]) {
    const profiled = englishVoices.find(v => profiles[hint].test(v.name)) || voices.find(v => profiles[hint].test(v.name));
    if (profiled) return profiled;
  }
  if (hint) {
    const hinted = voices.find(v => `${v.name} ${v.lang}`.toLowerCase().includes(hint));
    if (hinted) return hinted;
  }
  return (
    englishVoices.find(v => /david|daniel|guy|male|mark|alex/i.test(v.name)) ||
    englishVoices[0] ||
    voices[0]
  );
}

export default function SimulationAudioPlayer({
  title = 'Audio Simulation',
  subtitle = 'Generated narration',
  transcript = '',
  audioSrc = '',
  voiceHint = '',
  rate = 0.92,
  pitch = 0.86,
  accent = '#22c55e',
  onEvidence = null,
}) {
  const audioRef = useRef(null);
  const utteranceRef = useRef(null);
  const timerRef = useRef(null);
  const startedAtRef = useRef(0);
  const pausedAtRef = useRef(0);
  const durationRef = useRef(1);
  const playRunRef = useRef(0);
  const expectedCancelRef = useRef(false);
  const [mode, setMode] = useState(audioSrc ? 'file' : 'speech');
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [error, setError] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);

  useEffect(() => {
    if (!audioSrc) setMode('speech');
  }, [audioSrc]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setVoicesReady(false);
      return undefined;
    }
    const loadVoices = () => setVoicesReady(window.speechSynthesis.getVoices().length > 0);
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if (window.speechSynthesis.onvoiceschanged === loadVoices) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (utteranceRef.current && 'speechSynthesis' in window) {
        expectedCancelRef.current = true;
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    if (utteranceRef.current) utteranceRef.current.volume = volume;
  }, [volume]);

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const startSpeechProgress = (text) => {
    clearTimer();
    const words = text.trim().split(/\s+/).filter(Boolean).length || 1;
    durationRef.current = Math.max(4, words / 2.35);
    startedAtRef.current = Date.now() - pausedAtRef.current * 1000;
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      setProgress(Math.min(98, (elapsed / durationRef.current) * 100));
    }, 180);
  };

  const playFile = async () => {
    setMode('file');
    setError('');
    setStatus('loading');
    try {
      if (!audioRef.current) throw new Error('Audio element is not ready.');
      audioRef.current.volume = volume;
      await audioRef.current.play();
      setStatus('playing');
    } catch (e) {
      setMode('speech');
      setError(`Audio file could not play. Using transcript narration fallback. ${e.message || ''}`.trim());
      await playSpeech();
    }
  };

  const playSpeech = async () => {
    setMode('speech');
    setError('');
    const text = transcript?.trim();
    if (!text) {
      setError('No audio or transcript is available for this simulation.');
      setStatus('error');
      setShowTranscript(true);
      return;
    }
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      setError('This browser cannot synthesize audio. Transcript is shown instead.');
      setStatus('error');
      setShowTranscript(true);
      return;
    }

    const runId = Date.now();
    playRunRef.current = runId;
    if (window.speechSynthesis.speaking || window.speechSynthesis.paused) {
      expectedCancelRef.current = true;
      window.speechSynthesis.cancel();
      await new Promise(resolve => window.setTimeout(resolve, 140));
      expectedCancelRef.current = false;
    }
    setStatus(voicesReady ? 'playing' : 'buffering');
    setProgress(0);
    pausedAtRef.current = 0;

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = getSpeechVoice(voices, voiceHint);
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.onstart = () => {
      if (playRunRef.current !== runId) return;
      setStatus('playing');
      startSpeechProgress(text);
    };
    utterance.onpause = () => {
      if (playRunRef.current !== runId) return;
      setStatus('paused');
      pausedAtRef.current = Math.min(durationRef.current, (Date.now() - startedAtRef.current) / 1000);
      clearTimer();
    };
    utterance.onresume = () => {
      if (playRunRef.current !== runId) return;
      setStatus('playing');
      startSpeechProgress(text);
    };
    utterance.onend = () => {
      if (playRunRef.current !== runId) return;
      clearTimer();
      pausedAtRef.current = 0;
      setProgress(100);
      setStatus('ended');
    };
    utterance.onerror = (event) => {
      if (expectedCancelRef.current || playRunRef.current !== runId || event.error === 'interrupted') return;
      clearTimer();
      setError(`Playback failed: ${event.error || 'speech synthesis error'}. Transcript is available below.`);
      setStatus('error');
      setShowTranscript(true);
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    window.setTimeout(() => {
      if (window.speechSynthesis.speaking && status === 'buffering') setStatus('playing');
    }, 450);
  };

  const play = async () => {
    onEvidence?.('audio');
    if (audioSrc && mode === 'file') await playFile();
    else await playSpeech();
  };

  const pause = () => {
    if (mode === 'file' && audioRef.current) {
      audioRef.current.pause();
      setStatus('paused');
      return;
    }
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setStatus('paused');
    }
  };

  const resume = async () => {
    onEvidence?.('audio');
    if (mode === 'file' && audioRef.current) {
      await audioRef.current.play();
      setStatus('playing');
      return;
    }
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setStatus('playing');
    } else {
      await playSpeech();
    }
  };

  const replay = async () => {
    onEvidence?.('audio');
    clearTimer();
    setProgress(0);
    pausedAtRef.current = 0;
    setError('');
    if (mode === 'file' && audioRef.current && audioSrc) {
      audioRef.current.currentTime = 0;
      await playFile();
      return;
    }
    await playSpeech();
  };

  const stop = () => {
    clearTimer();
    if (mode === 'file' && audioRef.current) audioRef.current.pause();
    if ('speechSynthesis' in window) {
      playRunRef.current += 1;
      expectedCancelRef.current = true;
      window.speechSynthesis.cancel();
      window.setTimeout(() => { expectedCancelRef.current = false; }, 120);
    }
    pausedAtRef.current = 0;
    setStatus('idle');
    setProgress(0);
  };

  const canPause = status === 'playing' || status === 'buffering';
  const canResume = status === 'paused';
  const label = status === 'buffering' ? 'BUFFERING' : status === 'loading' ? 'LOADING' : status.toUpperCase();

  return (
    <div style={{ background: 'rgba(5,8,16,0.55)', border: '1px solid var(--border)', borderRadius: 14, padding: 14 }}>
      {audioSrc && (
        <audio
          ref={audioRef}
          preload="metadata"
          src={audioSrc}
          onLoadedMetadata={(e) => {
            setStatus('idle');
            durationRef.current = e.currentTarget.duration || 1;
          }}
          onWaiting={() => setStatus('buffering')}
          onPlaying={() => setStatus('playing')}
          onPause={() => setStatus(prev => prev === 'ended' ? 'ended' : 'paused')}
          onEnded={() => { setProgress(100); setStatus('ended'); }}
          onTimeUpdate={(e) => {
            const audio = e.currentTarget;
            if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
          }}
          onError={() => {
            setError('Audio file failed to load. Transcript narration fallback is available.');
            setMode('speech');
            setShowTranscript(true);
          }}
        />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 900 }}>{title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{subtitle}</div>
        </div>
        <div style={{ fontSize: 10, color: status === 'error' ? '#fca5a5' : accent, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
      </div>
      <div style={{ height: 7, background: 'rgba(148,163,184,0.14)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ width: `${Math.max(0, Math.min(100, progress))}%`, height: '100%', background: accent, transition: 'width 0.18s linear' }} />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {!canResume && <button onClick={play} style={{ ...controlButton, background: `linear-gradient(135deg, ${accent}, rgba(6,182,212,0.85))`, color: '#fff' }}>Play</button>}
        {canPause && <button onClick={pause} style={controlButton}>Pause</button>}
        {canResume && <button onClick={resume} style={controlButton}>Resume</button>}
        <button onClick={replay} style={controlButton}>Replay</button>
        <button onClick={stop} style={controlButton}>Stop</button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 11, marginLeft: 'auto' }}>
          Volume
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{ width: 110, accentColor: accent }}
          />
        </label>
      </div>
      {error && (
        <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#fecaca', fontSize: 12, lineHeight: 1.5 }}>
          {error}
        </div>
      )}
      <button onClick={() => { setShowTranscript(v => !v); onEvidence?.('technical'); }} style={{ marginTop: 12, border: 'none', background: 'transparent', color: 'var(--accent-cyan)', fontSize: 11, fontWeight: 800, fontFamily: 'inherit' }}>
        {showTranscript ? 'Hide transcript' : 'Show transcript'}
      </button>
      {showTranscript && (
        <div style={{ marginTop: 8, maxHeight: 150, overflow: 'auto', padding: 12, borderRadius: 10, background: 'rgba(15,23,42,0.72)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
          {transcript || 'No transcript available.'}
        </div>
      )}
    </div>
  );
}
