import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Send, Mic, CheckCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { StatusBadge } from './ui/StatusBadge';
import { ChatBubble } from './ui/ChatBubble';
import { PrimaryButton } from './ui/PrimaryButton';
import { SecondaryButton } from './ui/SecondaryButton';
//markdwon
import { marked } from 'marked';


// const mockMessages = [
//   { id: 1, sender: 'ai', text: 'Hello! I\'m here to help you capture your project requirements. What kind of project are you looking to build?', timestamp: '10:23 AM' },
//   { id: 2, sender: 'client', text: 'We need to build an e-commerce platform with a modern design and seamless checkout experience.', timestamp: '10:24 AM' },
//   { id: 3, sender: 'ai', text: 'Great! Let me gather more details. What are the key features you need for the e-commerce platform?', timestamp: '10:24 AM' },
//   { id: 4, sender: 'client', text: 'We need product catalog, shopping cart, payment integration, user accounts, and an admin dashboard.', timestamp: '10:25 AM' },
//   { id: 5, sender: 'ai', text: 'Perfect! Do you have any specific requirements for the payment integration? Which payment providers would you like to support?', timestamp: '10:26 AM' },
//   { id: 6, sender: 'client', text: 'We want to support Stripe and PayPal initially.', timestamp: '10:27 AM' },
// ];

interface Message {
  id: string | number;
  sender: 'ai' | 'client';
  text: string;
  timestamp: string;
}

export function ChatInterface() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const isNewSession = id === 'new';
  const status = isNewSession ? 'active' : 'completed';

  useEffect(() => {
    if (isNewSession) {
      const newId = Date.now().toString();
      setSessionId(newId);
      
      setMessages([{
        id: 'welcome',
        sender: 'ai',
        text: "Hello! I'm here to help you define your project requirements. What kind of project are you looking to build?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } else {
      setSessionId(id || null);
      //uhhhhh probably fetch existing context/transcript here
    }
  }, [id, isNewSession]);


  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: Message = {
      id: Date.now(),
      sender: 'client',
      text: userText,
      timestamp,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_query: userText, 
          session_id: sessionId 
        })
      });

      if (!response.ok) throw new Error("Failed to reach server");

      const data = await response.json();
      const mdresp = await marked.parse(data.response);

      const aiMessage: Message = {
        id: Date.now() + 1,
        sender: 'ai',
        text: mdresp, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      await fetch(`http://127.0.0.1:8000/api/transcript/save/${sessionId}`, {
        method: "POST"
      });
      navigate(`/transcript/${sessionId}`);
    } catch (error) {
      console.error("Save Error:", error);
    }
  };


  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              {isNewSession ? 'New Session' : 'E-commerce Platform Redesign'}
            </h1>
            <div className="flex items-center gap-2">
              <StatusBadge status={status} />
              <span className="text-sm text-gray-500">Session #{id === 'new' ? '248' : id}</span>
            </div>
          </div>
          {status === 'completed' && (
            <SecondaryButton onClick={handleComplete}>
              View Transcript & Summary
            </SecondaryButton>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              sender={message.sender}
              text= {message.text}
              timestamp={message.timestamp}
            />
          ))}
        </div>
      </div>



      {/* Input Area */}
      
      <div className="bg-white border-t border-gray-200 px-8 py-6">

        <div className="max-w-4xl mx-auto">

          {/* added loading text */}
              {isLoading && (
                <div className="flex items-center gap-3 animate-pulse text-gray-500">
                  <span className="text-sm font-medium">Thinking, hold tight...</span>
                </div>
              )}
          <Card>
            
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 border-0 focus:ring-0 resize-none text-gray-900 placeholder-gray-400"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pb-2">
                <button className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                  <Mic className="w-5 h-5" />
                </button>
                <PrimaryButton onClick={handleSend}>
                  <Send className="w-5 h-5" />
                </PrimaryButton>
              </div>
            </div>
          </Card>
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Transcript auto-saving to database</span>
          </div>
        </div>
      </div>
    </div>
  );
}
