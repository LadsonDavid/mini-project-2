import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { api } from '../utils/api';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const { addNotification } = useAppContext();

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (isOpen && !hasShownWelcome) {
      // Show welcome message when chat opens for the first time
      setMessages([{
        type: 'ai',
        text: "Hi! I'm WellnessAI, your intelligent assistant for the Smart Headache Relief System. I can help you interpret sensor readings, control vibration therapy, recommend music from our 8-track library, explain features, troubleshoot issues, and guide you through relaxation protocols. What would you like help with?",
        timestamp: new Date(),
      }]);
      setHasShownWelcome(true);
    }
  }, [isOpen, hasShownWelcome]);

  useEffect(() => {
    if (messages.length > 1 && isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (messageText) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend) return;

    const userMessage = {
      type: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await api.chatWithAI(textToSend);

      const aiMessage = {
        type: 'ai',
        text: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        type: 'ai',
        text: `I'm having trouble connecting right now (${error.message || 'Server error'}). Please make sure the backend server is running and try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      addNotification('AI assistant temporarily unavailable', 'error');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 sm:bottom-24 sm:right-6 sm:left-auto sm:w-96 h-[calc(100vh-60px)] sm:h-[600px] bg-white dark:bg-gray-900 sm:rounded-none rounded-none shadow-2xl border-t sm:border border-gray-200 dark:border-gray-800 flex flex-col z-50 animate-slide-up">
          {/* Header */}
          <div className="bg-white dark:bg-indigo-700 border-b border-gray-200 dark:border-indigo-600 p-4 sm:rounded-none rounded-none flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-none bg-indigo-100 dark:bg-white/10 flex items-center justify-center">
                <SupportAgentIcon sx={{ fontSize: 22, color: 'rgb(99, 102, 241)' }} className="dark:text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">WellnessAI Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Online</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setMessages([{
                    type: 'ai',
                    text: "Chat cleared! How can I assist you today?",
                    timestamp: new Date(),
                  }]);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-none transition-all hover:scale-110 text-gray-600 dark:text-white"
                title="New conversation"
              >
                <RestartAltIcon sx={{ fontSize: 18 }} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-none transition-all hover:scale-110 text-gray-600 dark:text-white"
                title="Minimize"
              >
                <MinimizeIcon sx={{ fontSize: 18 }} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-none transition-all hover:scale-110 text-gray-600 dark:text-white"
                title="Close"
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} group`}
              >
                <div className="flex-shrink-0 mt-1">
                  {message.type === 'ai' ? (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
                      <SupportAgentIcon sx={{ fontSize: 16, color: 'rgb(99, 102, 241)' }} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <PersonIcon sx={{ fontSize: 16, color: 'white' }} />
                    </div>
                  )}
                </div>
                <div className={`flex-1 ${message.type === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                  <div className={`inline-block max-w-[85%] px-4 py-3 rounded-none shadow-sm ${message.type === 'ai'
                    ? 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-800'
                    : 'bg-indigo-600 text-white'
                    }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  </div>
                  {message.type === 'ai' && index > 0 && (
                    <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-none transition-colors" title="Good response">
                        <ThumbUpIcon sx={{ fontSize: 14, color: 'gray' }} />
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-none transition-colors" title="Bad response">
                        <ThumbDownIcon sx={{ fontSize: 14, color: 'gray' }} />
                      </button>
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
                    <SupportAgentIcon sx={{ fontSize: 16, color: 'rgb(99, 102, 241)' }} />
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-none shadow-sm">
                  <div className="space-y-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Thinking...</p>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>


          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 rounded-none">
            <div className="flex gap-2 items-end">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                rows={3}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="p-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed rounded-none transition-colors self-end"
              >
                <SendIcon sx={{ fontSize: 20, color: 'white' }} />
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              AI Assistant • Powered by Qwen 2 latest
            </p>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-none shadow-2xl ${isOpen ? 'hidden sm:flex' : 'flex'} items-center justify-center transition-all duration-300 hover:scale-110 z-50 active:scale-95`}
      >
        {isOpen ? (
          <CloseIcon sx={{ fontSize: 28, color: 'white' }} />
        ) : (
          <SupportAgentIcon sx={{ fontSize: 32, color: 'white' }} />
        )}
      </button>
    </>
  );
};

export default FloatingChatWidget;

