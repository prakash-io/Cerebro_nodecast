import React, { useEffect, useRef, useState } from 'react';

export default function TerminalConsole({ 
  onCommand, 
  initialOutput = ["Initializing Cerebro...", "System loaded.", "Ready for input."],
  className = "",
  inputEnabled = true,
  }) {
  const [input, setInput] = useState('');
  const [commandOutput, setCommandOutput] = useState([]);
  const outputRef = useRef(null);
  const inputRef = useRef(null);
  const output = [...initialOutput, ...commandOutput];

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = input.trim().toLowerCase();
      if (!cmd) return;

      setCommandOutput(prev => [...prev, `> ${input}`]);
      setInput('');

      // Pass command up to parent
      if (onCommand) {
        const response = onCommand(cmd);
        if (response) {
          // Simulate slight processing delay for realism
          setTimeout(() => {
            setCommandOutput(prev => [...prev, response]);
          }, 300);
        }
      } else {
        // Default local command handler
        setTimeout(() => {
          handleLocalCommand(cmd);
        }, 300);
      }
    }
  };

  const handleLocalCommand = (cmd) => {
    switch(cmd) {
      case 'help':
        setCommandOutput(prev => [...prev, 'Available commands: help, clear, scan, connect, broadcast, sync, debug']);
        break;
      case 'clear':
        setCommandOutput([]);
        break;
      case 'scan':
        setCommandOutput(prev => [...prev, 'Scanning Hawkins frequencies... [NO SIGNAL]']);
        break;
      default:
        setCommandOutput(prev => [...prev, `Command not recognized: ${cmd}`]);
    }
  };

  return (
    <div 
      className={`font-vt323 flex h-full flex-col rounded-sm border border-[#ff0033]/35 bg-black/85 p-4 shadow-[0_0_15px_rgba(255,0,51,0.16)] ${className}`}
      onClick={() => {
        if (inputEnabled) {
          inputRef.current?.focus();
        }
      }}
    >
      <div className="mb-2 flex items-center justify-between border-b border-[#ff0033]/20 pb-2">
        <span className="font-press-start text-sm uppercase tracking-widest text-[#ff0033]">Hawkins Terminal V1.0</span>
        <div className="flex gap-2.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-white/20"></div>
          <div className="w-3 h-3 rounded-full bg-[#ff0033]/80 shadow-[0_0_5px_#ff0033]"></div>
        </div>
      </div>

      <div ref={outputRef} className="flex flex-1 flex-col gap-1 overflow-y-auto no-scrollbar text-xl text-white/75">
        {output.map((line, i) => (
          <div key={i} className="break-words">
            {line}
          </div>
        ))}
      </div>

      {inputEnabled ? (
        <div className="mt-2 flex items-center border-t border-[#ff0033]/15 pt-2 text-[#ff0033]">
          <span className="mr-2 text-xl">{'>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none border-none text-xl w-full"
            spellCheck={false}
            autoComplete="off"
          />
          <div className="ml-1 h-6 w-3 bg-[#ff0033]/70 shadow-[0_0_8px_#ff0033]" />
        </div>
      ) : (
        <div className="mt-2 border-t border-[#ff0033]/15 pt-2 font-vt323 text-lg text-white/40">
          STATUS MODE ONLY
        </div>
      )}
    </div>
  );
}
