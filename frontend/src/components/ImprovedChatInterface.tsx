import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Send, ArrowLeft, CheckCircle } from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';
import { PrimaryButton } from './ui/PrimaryButton';
import { SecondaryButton } from './ui/SecondaryButton';
import { saveChatMessage, fetchChatMessages, uploadTranscript } from '../api/transcript';

interface Message {
  id: string | number;
  sender: 'ai' | 'client';
  text?: string;
  options?: string[];
  allowOther?: boolean;
  selectedOption?: string;
  customResponse?: string;
  timestamp: string;
}

const initialMessages: Message[] = [
  {
    id: '1',
    sender: 'ai',
    text: 'Hello! I\'m here to help you capture your project requirements. What type of project are you building?',
    options: [
      'Web Application',
      'Mobile App',
      'Desktop Software',
      'E-commerce Platform',
      'API/Backend Service',
      'Other'
    ],
    allowOther: true,
    timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }
];

export function ImprovedChatInterface() {
  const navigate = useNavigate();
  const { id: sessionId } = useParams();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | number>('1');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherInputValue, setOtherInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actualSessionId, setActualSessionId] = useState<string>(sessionId || Date.now().toString());
  const hasLoadedRef = useRef(false);

  // Load existing session on mount
  useEffect(() => {
    if (sessionId && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadSessionMessages();
    } else if (!sessionId) {
      setActualSessionId(Date.now().toString());
    }
  }, [sessionId]);

  const loadSessionMessages = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      const dbMessages = await fetchChatMessages(sessionId);
      
      if (dbMessages.length > 0) {
        // Convert DB messages to Message format
        const loadedMessages: Message[] = dbMessages.map(msg => ({
          id: msg.message_id,
          sender: msg.sender as 'ai' | 'client',
          text: msg.text,
          options: msg.options,
          allowOther: msg.allow_other,
          selectedOption: msg.selected_option,
          customResponse: msg.custom_response,
          timestamp: new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        }));
        
        setMessages(loadedMessages);
        
        // Find the last unanswered AI message
        const lastUnansweredAI = loadedMessages.slice().reverse().find(m => 
          m.sender === 'ai' && !m.selectedOption
        );
        
        if (lastUnansweredAI) {
          setCurrentQuestionId(lastUnansweredAI.id);
        }
        
        console.log('[DEBUG] Loaded session messages:', loadedMessages);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Auto-save messages
  const saveMessageToBackend = useCallback(async (message: Message) => {
    try {
      await saveChatMessage(actualSessionId, {
        message_id: String(message.id),
        sender: message.sender,
        text: message.text,
        options: message.options,
        allow_other: message.allowOther || false,
        selected_option: message.selectedOption,
        custom_response: message.customResponse
      });
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  }, [actualSessionId]);

  // Save all messages periodically
  useEffect(() => {
    if (messages.length === 0) return;

    const saveAllMessages = async () => {
      for (const message of messages) {
        await saveMessageToBackend(message);
      }
    };

    const timer = setTimeout(() => {
      void saveAllMessages();
    }, 1000);

    return () => clearTimeout(timer);
  }, [messages, saveMessageToBackend]);

  const handleOptionSelect = (messageId: string | number, option: string) => {
    if (option === 'Other') {
      setShowOtherInput(true);
      return;
    }

    // Update the message with selected option
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, selectedOption: option }
        : msg
    ));

    // Add client response
    const clientResponse: Message = {
      id: `client-${Date.now()}`,
      sender: 'client',
      text: option,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };

    // Get next AI question based on selection
    const nextQuestion = getNextQuestion();
    
    setTimeout(() => {
      setMessages(prev => [...prev, clientResponse, nextQuestion]);
      setCurrentQuestionId(nextQuestion.id);
      setShowOtherInput(false);
    }, 300);
  };

  const handleOtherSubmit = (messageId: string | number) => {
    if (!otherInputValue.trim()) return;

    // Update the message with custom response
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, selectedOption: 'Other', customResponse: otherInputValue }
        : msg
    ));

    // Add client response
    const clientResponse: Message = {
      id: `client-${Date.now()}`,
      sender: 'client',
      text: otherInputValue,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };

    // Get next AI question
    const nextQuestion = getNextQuestion();
    
    setTimeout(() => {
      setMessages(prev => [...prev, clientResponse, nextQuestion]);
      setCurrentQuestionId(nextQuestion.id);
      setShowOtherInput(false);
      setOtherInputValue('');
    }, 300);
  };

  const getNextQuestion = (): Message => {
    const questionBank = [
      {
        text: 'What is the primary goal of this project?',
        options: [
          'Increase revenue',
          'Improve user experience',
          'Automate processes',
          'Enter new market',
          'Replace legacy system',
          'Other'
        ],
        allowOther: true
      },
      {
        text: 'What is your estimated timeline for this project?',
        options: [
          'Less than 1 month',
          '1-3 months',
          '3-6 months',
          '6-12 months',
          'More than 1 year',
          'Not sure yet'
        ],
        allowOther: false
      },
      {
        text: 'What is your estimated budget range?',
        options: [
          'Under $10k',
          '$10k - $50k',
          '$50k - $100k',
          '$100k - $500k',
          'Over $500k',
          'Other'
        ],
        allowOther: true
      },
      {
        text: 'Which departments will be primarily involved?',
        options: [
          'Frontend Development',
          'Backend Development',
          'Design/UX',
          'Business/Product',
          'DevOps',
          'QA/Testing'
        ],
        allowOther: false
      },
      {
        text: 'Do you have any existing systems this needs to integrate with?',
        options: [
          'Yes, multiple systems',
          'Yes, one system',
          'No integrations needed',
          'Not sure yet'
        ],
        allowOther: false
      }
    ];

    const randomQuestion = questionBank[Math.floor(Math.random() * questionBank.length)];
    const newId = `ai-${Date.now()}`;
    
    return {
      id: newId,
      sender: 'ai',
      text: randomQuestion.text,
      options: randomQuestion.options,
      allowOther: randomQuestion.allowOther,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      // Save final state
      for (const message of messages) {
        await saveMessageToBackend(message);
      }
      // Upload transcript
      await uploadTranscript(actualSessionId);
      navigate('/');
    } catch (error) {
      console.error('Save Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-4 mb-3">
          <SecondaryButton onClick={handleBack}>
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </SecondaryButton>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              Project Requirements Gathering
            </h1>
            <div className="flex items-center gap-2">
              <StatusBadge status="active" />
              <span className="text-sm text-gray-500">Session #{actualSessionId}</span>
            </div>
          </div>
          <PrimaryButton onClick={handleComplete} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Complete & Save'}
          </PrimaryButton>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-auto px-8 py-6 bg-[#F8F9FB]">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id}>
              {message.sender === 'ai' ? (
                <div className="flex justify-start">
                  <div className="max-w-3xl">
                    {/* AI Message */}
                    <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">AI</span>
                        </div>
                        <span className="text-xs text-gray-400">{message.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-900 leading-relaxed mb-4">
                        {message.text}
                      </p>
                      
                      {/* Options */}
                      {message.options && !message.selectedOption && message.id === currentQuestionId && (
                        <div className="space-y-2">
                          {message.options.map((option, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleOptionSelect(message.id, option)}
                              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                                option === 'Other'
                                  ? 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50 text-gray-700'
                                  : 'border-gray-200 bg-white hover:border-indigo-500 hover:bg-indigo-50 text-gray-900'
                              } font-medium text-sm`}
                            >
                              {option}
                            </button>
                          ))}
                          
                          {/* Other Input Field */}
                          {showOtherInput && message.allowOther && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Please specify:
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={otherInputValue}
                                  onChange={(e) => setOtherInputValue(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleOtherSubmit(message.id);
                                    }
                                  }}
                                  placeholder="Type your answer here..."
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleOtherSubmit(message.id)}
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Selected Option Display */}
                      {message.selectedOption && (
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            <strong>Selected:</strong> {message.selectedOption}
                            {message.customResponse && ` - ${message.customResponse}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Client Response */
                <div className="flex justify-end">
                  <div className="max-w-2xl">
                    <div className="bg-indigo-600 text-white rounded-lg px-5 py-3 shadow-sm">
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                    <div className="flex justify-end items-center gap-2 mt-1 px-2">
                      <span className="text-xs text-gray-400">{message.timestamp}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info Footer */}
      <div className="bg-white border-t border-gray-200 px-8 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>
              Your responses are automatically saved. Refresh the page anytime - your progress will be preserved.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
