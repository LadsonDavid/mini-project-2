import { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const MessageBox = ({ onSendMessage }) => {
  const { displayMessage, setDisplayMessage } = useAppContext();
  const [localMessage, setLocalMessage] = useState('');

  const handleSend = () => {
    if (localMessage.trim()) {
      setDisplayMessage(localMessage);
      if (onSendMessage) {
        onSendMessage(localMessage);
      }
      setLocalMessage('');
    }
  };

  const predefinedMessages = [
    'Take a break',
    'Stay hydrated',
    'Good posture',
    'Deep breath',
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-none shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Display Message
      </h3>

      <div className="space-y-4">
        {/* Current Message Display */}
        {displayMessage && (
          <div className="bg-primary/10 border border-primary/30 rounded-none p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Current Message:
            </p>
            <p className="text-lg font-medium text-gray-800 dark:text-white">
              {displayMessage}
            </p>
          </div>
        )}

        {/* Message Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Custom Message
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={localMessage}
              onChange={(e) => setLocalMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              maxLength={50}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleSend}
              disabled={!localMessage.trim()}
              className={`px-6 py-2 rounded-none font-semibold transition-all ${!localMessage.trim()
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90'
                }`}
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {localMessage.length}/50 characters
          </p>
        </div>

        {/* Predefined Messages */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick Messages
          </label>
          <div className="grid grid-cols-2 gap-2">
            {predefinedMessages.map((msg) => (
              <button
                key={msg}
                onClick={() => {
                  setDisplayMessage(msg);
                  if (onSendMessage) {
                    onSendMessage(msg);
                  }
                }}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-none hover:bg-primary hover:text-white hover:border-primary transition-all dark:text-gray-300"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBox;

