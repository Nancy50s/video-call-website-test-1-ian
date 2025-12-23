
import React from 'react';
import { Participant } from '../types';

interface ParticipantTileProps {
  participant: Participant;
  isSelf?: boolean;
  isActive?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

const ParticipantTile: React.FC<ParticipantTileProps> = ({ participant, isSelf, isActive, videoRef }) => {
  return (
    <div className={`relative h-full w-full rounded-2xl overflow-hidden glass transition-all duration-300 ${isActive ? 'ring-4 ring-blue-500 scale-[0.98]' : ''}`}>
      {isSelf ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-full w-full object-cover mirror transform -scale-x-100"
        />
      ) : (
        <div className="h-full w-full relative group">
          <img
            src={participant.avatar}
            alt={participant.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
          
          {/* Audio Visualizer Mockup */}
          {isActive && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-end space-x-1 h-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-blue-400 rounded-full animate-bounce"
                  style={{
                    height: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Identity Tag */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="flex flex-col">
          <span className="text-white font-bold text-lg drop-shadow-lg flex items-center gap-2">
            {participant.name}
            {participant.isAI && (
              <span className="bg-blue-600/30 border border-blue-500/50 text-blue-200 text-[10px] px-1.5 py-0.5 rounded-md uppercase tracking-wider font-black backdrop-blur-sm">
                AI Expert
              </span>
            )}
          </span>
          <span className="text-white/70 text-sm font-medium">{participant.role}</span>
        </div>
        
        {isActive && (
            <div className="bg-blue-500 p-2 rounded-full animate-pulse shadow-lg shadow-blue-500/50">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
            </div>
        )}
      </div>

      {/* Watermark/Status */}
      <div className="absolute top-4 right-4 flex gap-2">
        <div className="bg-black/40 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-white/60 font-mono">
            4K • 60 FPS
        </div>
      </div>
    </div>
  );
};

export default ParticipantTile;
