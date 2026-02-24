import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Send, ArrowLeft, CheckCircle } from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';
import { PrimaryButton } from './ui/PrimaryButton';
import { SecondaryButton } from './ui/SecondaryButton';
import { saveChatMessage, fetchChatMessages, uploadTranscript } from '../api/transcript';

const API_BASE = 'http://localhost:8000/api';

interface Message {
  id: string | number;
  sender: 'ai' | 'client';
  text?: string;
  options?: string[];
  allowOther?: boolean;
  selectedOption?: string;
  customResponse?: string;
  inputType?: 'options' | 'text' | 'mixed';
  sections?: Array<{
    question: string;
    inputType: 'options' | 'text';
    options?: string[];
    allowOther?: boolean;
    selectedOption?: string;
    customResponse?: string;
  }>;
  timestamp: string;
}

const initialMessages: Message[] = [
  {
    id: '1',
    sender: 'ai',
    text: 'To start, what kind of project do you want to build?',
    inputType: 'text',
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
  const [textInputValue, setTextInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actualSessionId, setActualSessionId] = useState<string>(sessionId || Date.now().toString());
  const [projectTitle, setProjectTitle] = useState<string>('New Project');
  const hasLoadedRef = useRef(false);
  const messageIdCounterRef = useRef(0);
  const [sectionInputs, setSectionInputs] = useState<Record<number, string>>({});

  const fetchNextMessage = useCallback(async (userText: string) => {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_query: userText,
        session_id: actualSessionId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch next message');
    }

    const data = await response.json();
    const hasOptions = Array.isArray(data.options) && data.options.length > 0;
    const inputType: 'options' | 'text' | 'mixed' = data.input_type || (hasOptions ? 'options' : 'text');
    const normalizedOptions = hasOptions
      ? (data.options.includes('Other') ? data.options : [...data.options, 'Other'])
      : undefined;

    // Normalize sections if they exist
    const sections = data.sections?.map((section: any) => ({
      ...section,
      options: section.options?.includes('Other') ? section.options : [...(section.options || []), 'Other']
    })) || [];

    messageIdCounterRef.current += 1;
    const nextMessage: Message = {
      id: `ai-${Date.now()}-${messageIdCounterRef.current}`,
      sender: 'ai',
      text: data.response,
      options: normalizedOptions,
      allowOther: data.allow_other ?? Boolean(normalizedOptions),
      inputType,
      sections,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };

    return nextMessage;
  }, [actualSessionId]);


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
          inputType: msg.sender === 'ai' ? (msg.options?.length ? 'options' : 'text') : undefined,
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

  // Load existing session on mount
  useEffect(() => {
    if (sessionId && sessionId !== 'new' && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadSessionMessages();
    } else if (!sessionId || sessionId === 'new') {
      setActualSessionId(Date.now().toString());
    }
  }, [sessionId, loadSessionMessages]);

  useEffect(() => {
    const shouldStart = !sessionId || sessionId === 'new';
    if (!shouldStart || messages.length > 0) return;

    // Just render the initial message, don't auto-load problem definition
    // Problem Definition will be loaded when user submits their first answer
  }, [sessionId, messages.length]);

  useEffect(() => {
    const firstClientResponse = messages.find(m => m.sender === 'client');
    if (firstClientResponse?.text) {
      setProjectTitle(firstClientResponse.text.substring(0, 40) + (firstClientResponse.text.length > 40 ? '...' : ''));
    }
  }, [messages]);

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

  // Save all messages periodically (only if user has responded)
  useEffect(() => {
    if (messages.length === 0) return;
    
    // Only save if there's at least one user message (not just initial AI greeting)
    const hasUserResponse = messages.some(m => m.sender === 'client');
    if (!hasUserResponse) return;

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

  useEffect(() => {
    if (messages.length === 0) return;

    const lastUnansweredAI = [...messages]
      .reverse()
      .find((m) => m.sender === 'ai' && !m.selectedOption && (m.options?.length || m.inputType === 'text'));

    if (lastUnansweredAI && lastUnansweredAI.id !== currentQuestionId) {
      setCurrentQuestionId(lastUnansweredAI.id);
    }
  }, [messages, currentQuestionId]);

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
    setTimeout(async () => {
      try {
        setIsLoading(true);
        const nextQuestion = await fetchNextMessage(option);
        setMessages(prev => [...prev, clientResponse, nextQuestion]);
        setCurrentQuestionId(nextQuestion.id);
      } catch (error) {
        console.error('Failed to fetch next question:', error);
      } finally {
        setShowOtherInput(false);
        setIsLoading(false);
      }
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
    setTimeout(async () => {
      try {
        setIsLoading(true);
        const nextQuestion = await fetchNextMessage(otherInputValue);
        setMessages(prev => [...prev, clientResponse, nextQuestion]);
        setCurrentQuestionId(nextQuestion.id);
      } catch (error) {
        console.error('Failed to fetch next question:', error);
      } finally {
        setShowOtherInput(false);
        setOtherInputValue('');
        setIsLoading(false);
      }
    }, 300);
  };

  const handleTextSubmit = (messageId: string | number) => {
    if (!textInputValue.trim()) return;

    const responseText = textInputValue.trim();

    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, selectedOption: 'Text', customResponse: responseText }
        : msg
    ));

    // Only create a separate client message if this is NOT the first question
    const isFirstQuestion = messageId === '1';

    setTimeout(async () => {
      try {
        setIsLoading(true);
        const nextQuestion = await fetchNextMessage(responseText);
        
        if (isFirstQuestion) {
          // For first question, just add the next question (selected response is already in AI message)
          setMessages(prev => [...prev, nextQuestion]);
        } else {
          // For other questions, add client response + next question
          const clientResponse: Message = {
            id: `client-${Date.now()}`,
            sender: 'client',
            text: responseText,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          };
          setMessages(prev => [...prev, clientResponse, nextQuestion]);
        }
        
        setCurrentQuestionId(nextQuestion.id);
      } catch (error) {
        console.error('Failed to fetch next question:', error);
      } finally {
        setTextInputValue('');
        setIsLoading(false);
      }
    }, 300);
  };

  const handleSectionSubmit = () => {
    // Combine all section inputs into a single response
    const responses = Object.entries(sectionInputs)
      .sort(([keyA], [keyB]) => parseInt(keyA) - parseInt(keyB))
      .map(([_, value]) => value)
      .filter(v => v.trim())
      .join('\n');

    if (!responses.trim()) return;

    setTimeout(async () => {
      try {
        setIsLoading(true);
        const nextQuestion = await fetchNextMessage(responses);
        
        const clientResponse: Message = {
          id: `client-${Date.now()}`,
          sender: 'client',
          text: responses,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, clientResponse, nextQuestion]);
        setCurrentQuestionId(nextQuestion.id);
        setSectionInputs({});
      } catch (error) {
        console.error('Failed to submit sections:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      
      // Only save if user has provided any responses
      const hasUserResponse = messages.some(m => m.sender === 'client');
      
      if (hasUserResponse) {
        // Save final state
        for (const message of messages) {
          await saveMessageToBackend(message);
        }
        // Upload transcript
        await uploadTranscript(actualSessionId);
      }
      
      navigate('/');
    } catch (error) {
      console.error('Save Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuestion = messages.find((m) => m.id === currentQuestionId);

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
              {projectTitle}
            </h1>
            <div className="flex items-center gap-2">
              <StatusBadge status="active" />
              <span className="text-sm text-gray-500">Defining Requirements</span>
            </div>
          </div>
          <PrimaryButton onClick={handleComplete} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Complete & Save'}
          </PrimaryButton>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-auto px-8 py-6 bg-[#F8F9FB] relative">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6 p-4 bg-white rounded-lg border border-gray-200">
            <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
            <span>Loading...</span>
          </div>
        )}
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
                      
                      {/* Multiple Sections (for Problem Definition etc) */}
                      {message.inputType === 'mixed' && message.sections && message.id === currentQuestionId && (
                        <div className="space-y-6 mt-4 pt-4 border-t border-gray-200">
                          {message.sections.map((section, sectionIdx) => (
                            <div key={sectionIdx} className="space-y-2">
                              <h3 className="text-sm font-semibold text-gray-900">{section.question}</h3>
                              
                              {section.inputType === 'options' && section.options && (
                                <div className="space-y-2">
                                  {section.options.map((option, optIdx) => (
                                    <button
                                      key={optIdx}
                                      onClick={() => setSectionInputs(prev => ({ ...prev, [sectionIdx]: option }))}
                                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                                        sectionInputs[sectionIdx] === option
                                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                                          : option === 'Other'
                                          ? 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50 text-gray-700'
                                          : 'border-gray-200 bg-white hover:border-indigo-500 hover:bg-indigo-50 text-gray-900'
                                      } font-medium text-sm`}
                                    >
                                      {option}
                                    </button>
                                  ))}
                                </div>
                              )}
                              
                              {section.inputType === 'text' && (
                                <input
                                  type="text"
                                  value={sectionInputs[sectionIdx] || ''}
                                  onChange={(e) => setSectionInputs(prev => ({ ...prev, [sectionIdx]: e.target.value }))}
                                  placeholder="Type your answer here..."
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                />
                              )}
                            </div>
                          ))}
                          
                          <button
                            onClick={() => handleSectionSubmit()}
                            disabled={isLoading}
                            className="w-full px-4 py-3 mt-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 font-medium text-sm"
                          >
                            {isLoading ? 'Submitting...' : 'Continue'}
                          </button>
                        </div>
                      )}
                      
                      {/* Single Options */}
                      {message.inputType === 'options' && message.options && !message.selectedOption && message.id === currentQuestionId && (
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

                      {message.inputType === 'text' && !message.selectedOption && message.id === currentQuestionId && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your answer:
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={textInputValue}
                              onChange={(e) => setTextInputValue(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleTextSubmit(message.id);
                                }
                              }}
                              placeholder="Type your answer here..."
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            />
                            <button
                              onClick={() => handleTextSubmit(message.id)}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
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

                      {/* Fallback: Show text input for any unanswered question without explicit inputType */}
                      {!message.inputType && !message.selectedOption && message.id === currentQuestionId && message.sender === 'ai' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your answer:
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={textInputValue}
                              onChange={(e) => setTextInputValue(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleTextSubmit(message.id);
                                }
                              }}
                              placeholder="Type your answer here..."
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            />
                            <button
                              onClick={() => handleTextSubmit(message.id)}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
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

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-8 py-6">
        <div className="max-w-4xl mx-auto">
          {currentQuestion?.inputType === 'options' ? (
            <div className="text-sm text-gray-500">
              Select an option above, or choose “Other” to type a custom response.
            </div>
          ) : (
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={textInputValue}
                  onChange={(e) => setTextInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleTextSubmit(currentQuestion?.id ?? '');
                    }
                  }}
                  placeholder="Type your response..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
              <button
                onClick={() => handleTextSubmit(currentQuestion?.id ?? '')}
                className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
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
