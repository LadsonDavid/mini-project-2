import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { api } from '../utils/api';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const AIChatBox = () => {
  const { addNotification } = useAppContext();
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Hi! I'm WellnessAI, your intelligent assistant for the Smart Headache Relief System. I can help you interpret sensor readings, control vibration therapy, recommend music from our 8-track library, explain features, troubleshoot issues, and guide you through relaxation protocols. What would you like help with?",
      sender: 'ai',
      timestamp: Date.now(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Only scroll if there are multiple messages (prevents initial page scroll)
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSend = async () => {
    if (inputMessage.trim() && !isLoading) {
      const userMessage = {
        id: messages.length + 1,
        content: inputMessage,
        sender: 'user',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputMessage('');
      setIsLoading(true);

      try {
        const result = await api.chatWithAI(inputMessage);

        if (result.success) {
          const aiMessage = {
            id: messages.length + 2,
            content: result.response,
            sender: 'ai',
            timestamp: Date.now(),
            model: result.model,
          };
          setMessages((prev) => [...prev, aiMessage]);
        } else {
          addNotification('AI response failed', 'error');
        }
      } catch (error) {
        addNotification(`Error connecting to AI: ${error.message || 'Unknown error'}`, 'error');
        const errorMessage = {
          id: messages.length + 2,
          content: "I'm having trouble connecting right now. Try the vibration therapy on low setting and take deep breaths.",
          sender: 'ai',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "I have a headache",
    "What do my sensor readings mean?",
    "How do I use vibration therapy?",
    "Recommend a relaxation protocol",
    "Suggest music for stress relief",
    "What's my stress level telling me?",
  ];

  const handleQuickPrompt = (prompt) => {
    setInputMessage(prompt);
  };

  return (
    <div className="group premium-card flex flex-col h-[500px] p-6 transition-all duration-300">
      <div className="flex items-center space-x-3 mb-5">
        <SmartToyIcon sx={{ fontSize: 28, color: 'rgb(139, 92, 246)' }} />
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            WellnessAI Assistant
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            AI-powered health & wellness guide
          </p>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickPrompt(prompt)}
            className="px-3 py-1.5 text-xs font-medium rounded-none bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all duration-300 whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto mb-6 space-y-4 pr-3 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'
              } animate-fade-in-up`}
          >
            <div
              className={`flex items-start space-x-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
            >
              <div className="flex-shrink-0">
                {msg.sender === 'user' ? (
                  <PersonIcon sx={{ fontSize: 20, color: 'rgb(99, 102, 241)' }} />
                ) : (
                  <SmartToyIcon sx={{ fontSize: 20, color: 'rgb(139, 92, 246)' }} />
                )}
              </div>
              <div className="flex-1">
                <div
                  className={`px-4 py-2.5 rounded-none rounded-tl-sm shadow-sm ${msg.sender === 'user'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
                <p className="text-xs mt-2 px-2 font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                  {msg.model && msg.model === 'fallback' && ' (offline mode)'}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 animate-pulse">
                <SmartToyIcon sx={{ fontSize: 20, color: 'rgb(139, 92, 246)' }} />
              </div>
              <div className="px-4 py-2.5 rounded-none rounded-tl-sm shadow-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">WellnessAI is thinking</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-none bg-violet-500 dark:bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-1 rounded-none bg-violet-500 dark:bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-1 rounded-none bg-violet-500 dark:bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex space-x-4 pt-6 border-t border-white/10">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about headache relief..."
          disabled={isLoading}
          className="flex-1 px-6 py-4 rounded-none focus:ring-2 focus:ring-purple-500 text-base font-medium transition-all shadow-lg disabled:opacity-50"
          style={{
            background: 'var(--color-card)',
            borderColor: 'var(--border-medium)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-medium)',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!inputMessage.trim() || isLoading}
          className={`px-5 py-3 rounded-none transition-all duration-300 shadow-sm ${!inputMessage.trim() || isLoading
            ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 active:scale-95'
            }`}
        >
          <SendIcon sx={{ fontSize: 20, color: !inputMessage.trim() || isLoading ? 'rgb(156, 163, 175)' : 'white' }} />
        </button>
      </div>
    </div>
  );
};

export default AIChatBox;

