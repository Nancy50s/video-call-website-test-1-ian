
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Participant, CallState, TranscriptionEntry } from './types';
import { AI_PARTICIPANTS } from './constants';
import ParticipantTile from './components/ParticipantTile';
import ControlBar from './components/ControlBar';
import { GeminiLiveManager } from './services/geminiLiveService';

const App: React.FC = () => {
  const [callState, setCallState] = useState<CallState>(CallState.IDLE);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const liveManager = useRef<GeminiLiveManager | null>(null);
  const transcriptionEndRef = useRef<HTMLDivElement>(null);

  const selfParticipant: Participant = {
    id: 'user-1',
    name: 'You',
    role: 'Lead Project Owner',
    avatar: '',
    isAI: false,
    voiceName: '',
    personality: ''
  };

  const scrollToBottom = useCallback(() => {
    transcriptionEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [transcriptions, scrollToBottom]);

  const startCall = async () => {
    setCallState(CallState.CONNECTING);
    try {
      if (!liveManager.current) {
        liveManager.current = new GeminiLiveManager();
      }

      await liveManager.current.connect({
        onTranscription: (text, isModel) => {
          setTranscriptions(prev => {
            const last = prev[prev.length - 1];
            if (last && ((isModel && last.speaker !== 'You') || (!isModel && last.speaker === 'You'))) {
              return [...prev.slice(0, -1), { ...last, text: last.text + text }];
            }
            return [...prev, {
              speaker: isModel ? 'Gemini Panel' : 'You',
              text: text,
              timestamp: Date.now()
            }];
          });
          
          if (isModel) {
            // Check if the text identifies a specific speaker
            const lowercaseText = text.toLowerCase();
            const foundParticipant = AI_PARTICIPANTS.find(p => 
              lowercaseText.includes(p.name.toLowerCase()) || 
              lowercaseText.includes(p.role.toLowerCase())
            );
            if (foundParticipant) {
              setActiveSpeakerId(foundParticipant.id);
            } else {
              setActiveSpeakerId('expert-1'); // Default to Orion
            }
          } else {
            setActiveSpeakerId('user-1');
          }
        },
        onInterrupted: () => {
          setActiveSpeakerId(null);
        },
        onClose: () => {
          setCallState(CallState.ENDED);
          setActiveSpeakerId(null);
        }
      });

      // Handle User Video
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }

      setCallState(CallState.ACTIVE);
    } catch (err) {
      console.error('Failed to start call:', err);
      alert('Failed to connect to AI Think Tank. Please ensure camera/microphone permissions are granted.');
      setCallState(CallState.IDLE);
    }
  };

  const endCall = () => {
    liveManager.current?.disconnect();
    if (userVideoRef.current?.srcObject) {
      (userVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setCallState(CallState.ENDED);
    setActiveSpeakerId(null);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    // Logic to actually mute microphone would go in GeminiLiveManager
  };

  const handleToggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    if (userVideoRef.current?.srcObject) {
      const videoTrack = (userVideoRef.current.srcObject as MediaStream).getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = isVideoOff;
    }
  };

  if (callState === CallState.IDLE || callState === CallState.ENDED) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
        </div>

        <div className="z-10 text-center max-w-2xl">
          <div className="inline-block p-3 rounded-2xl bg-white/5 border border-white/10 mb-8 backdrop-blur-xl">
             <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
             </svg>
          </div>
          <h1 className="text-6xl font-black mb-6 tracking-tight bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
            AI Think Tank
          </h1>
          <p className="text-xl text-white/50 mb-12 font-medium leading-relaxed">
            Collaborate with a high-stakes panel of 4 AI experts in a seamless video call experience. 
            Brainstorm, strategize, and build with the power of Gemini.
          </p>
          <button
            onClick={startCall}
            className="group relative px-12 py-5 bg-blue-600 rounded-full text-white font-black text-xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
          >
            Join Meeting
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          
          <div className="mt-16 grid grid-cols-4 gap-4 opacity-40">
            {AI_PARTICIPANTS.map(p => (
                <div key={p.id} className="text-center">
                    <img src={p.avatar} className="w-12 h-12 rounded-full mx-auto mb-2 grayscale" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{p.role}</span>
                </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#050505] text-white flex flex-col overflow-hidden font-sans">
      {/* Header Info */}
      <div className="h-16 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl border-b border-white/5 z-20">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {AI_PARTICIPANTS.map(p => (
              <img key={p.id} src={p.avatar} className="w-8 h-8 rounded-full border-2 border-[#050505]" />
            ))}
          </div>
          <h2 className="font-bold tracking-tight">AI Think Tank Strategy Session</h2>
          <div className="flex items-center gap-2 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-[10px] font-black uppercase">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            End-to-End Encrypted
          </div>
        </div>
        <div className="text-white/40 font-mono text-sm tracking-widest">
            00:{new Date().getSeconds().toString().padStart(2, '0')} SESSION ID: THNK-TNX-4
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Participants Grid */}
        <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {/* User Tile */}
          <ParticipantTile
            participant={selfParticipant}
            isSelf={true}
            isActive={activeSpeakerId === 'user-1'}
            videoRef={userVideoRef}
          />

          {/* AI Expert Tiles */}
          {AI_PARTICIPANTS.map((participant) => (
            <ParticipantTile
              key={participant.id}
              participant={participant}
              isActive={activeSpeakerId === participant.id}
            />
          ))}
        </div>

        {/* Sidebar Transcript */}
        <div className="w-96 bg-black/30 border-l border-white/5 backdrop-blur-3xl flex flex-col h-full overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="font-bold flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Live Transcript
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {transcriptions.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                    <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <p className="text-sm font-medium">Say something to start the discussion...</p>
                </div>
            )}
            {transcriptions.map((t, i) => (
              <div key={i} className="animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${t.speaker === 'You' ? 'text-blue-400' : 'text-purple-400'}`}>
                    {t.speaker}
                  </span>
                  <span className="text-[10px] text-white/20 font-mono">
                    {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed font-medium">
                  {t.text}
                </p>
              </div>
            ))}
            <div ref={transcriptionEndRef} />
          </div>
          <div className="p-4 bg-black/40 border-t border-white/5">
              <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">AI Listening...</span>
              </div>
          </div>
        </div>
      </div>

      {/* Connection Loader */}
      {callState === CallState.CONNECTING && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <h2 className="text-2xl font-black mb-2 animate-pulse">Connecting to Think Tank...</h2>
              <p className="text-white/40 text-sm font-medium tracking-wide uppercase">Initializing Neural Link with Gemini Live</p>
          </div>
      )}

      <ControlBar
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        onToggleMute={handleToggleMute}
        onToggleVideo={handleToggleVideo}
        onEndCall={endCall}
        activeSession={callState === CallState.ACTIVE}
      />
    </div>
  );
};

export default App;
