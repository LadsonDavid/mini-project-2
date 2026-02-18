import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import DevicesIcon from '@mui/icons-material/Devices';
import ChatIcon from '@mui/icons-material/Chat';

const ChatBox = ({ messages, onSendMessage }) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Only scroll if there are messages (prevents initial page scroll)
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="group premium-card flex flex-col h-[500px] p-6 transition-all duration-300">
      <div className="flex items-center space-x-4 mb-8">
        <div className="relative">
          <div className="w-14 h-14 gradient-primary rounded-none flex items-center justify-center shadow-premium">
            <ChatIcon sx={{ fontSize: 28, color: 'white' }} />
          </div>
        </div>
        <div>
          <h3 className="text-title text-[var(--text-primary)]" style={{ fontSize: '16px' }}>
            Device messages
          </h3>
          <p className="text-xs text-[var(--text-tertiary)]">
            Send commands to headband
          </p>
        </div>
      </div>

      {/* Modern Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto mb-6 space-y-5 pr-3 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-sm text-[var(--text-secondary)] mb-1">Ready to communicate</p>
              <p className="text-xs text-[var(--text-tertiary)]">Send commands to your headband</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'
                } animate-fade-in-up`}
            >
              <div
                className={`flex items-start space-x-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
              >
                <div
                  className={`p-3 rounded-none flex-shrink-0 shadow-md ${msg.sender === 'user'
                      ? 'gradient-blue-purple'
                      : 'bg-[var(--color-card)] border border-[var(--border-medium)]'
                    }`}
                >
                  {msg.sender === 'user' ? (
                    <PersonIcon sx={{ fontSize: 18, color: 'white' }} />
                  ) : (
                    <DevicesIcon sx={{ fontSize: 18, color: 'var(--text-secondary)' }} />
                  )}
                </div>
                <div className="flex-1">
                  <div
                    className={`px-5 py-4 rounded-none shadow-md ${msg.sender === 'user'
                        ? 'gradient-blue-purple text-white'
                        : 'bg-[var(--color-card)] border border-[var(--border-medium)]'
                      }`}
                    style={msg.sender !== 'user' ? { color: 'var(--text-primary)' } : {}}
                  >
                    <p className="text-base font-medium leading-relaxed">{msg.content}</p>
                  </div>
                  <p className="text-xs mt-2.5 px-2 font-semibold" style={{ color: 'var(--text-muted)' }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Modern Input Area */}
      <div className="flex space-x-4 pt-6 border-t border-white/10">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-sm border border-[var(--border-medium)] rounded-none focus:ring-2 focus:ring-blue-500 text-[var(--text-primary)] placeholder-[var(--text-muted)] text-base font-medium transition-all shadow-lg"
          style={{ background: 'var(--color-card)', borderColor: 'var(--border-medium)' }}
        />
        <button
          onClick={handleSend}
          disabled={!inputMessage.trim()}
          className={`px-5 py-3 rounded-none transition-all var(--transition-base) shadow-md hover:shadow-lg ${!inputMessage.trim()
              ? 'bg-white/10 text-white/30 cursor-not-allowed'
              : 'bg-[var(--color-accent)] text-white hover:scale-[1.01]'
            }`}
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          <SendIcon sx={{ fontSize: 20, color: !inputMessage.trim() ? 'rgba(255,255,255,0.3)' : 'white' }} />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;

