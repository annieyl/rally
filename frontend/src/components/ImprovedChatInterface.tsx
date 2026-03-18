import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Send, ArrowLeft, CheckCircle } from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';
import { PrimaryButton } from './ui/PrimaryButton';
import { SecondaryButton } from './ui/SecondaryButton';
import { uploadTranscript, fetchSessionDetail, getTranscript } from '../api/transcript';

const API_BASE = 'http://localhost:8000/api';

interface Section {
  question: string;
  inputType: 'options' | 'text';
  options?: string[];
  allowOther?: boolean;
  selectedOption?: string;
  customResponse?: string;
  // Persisted answer shown after submission
  answer?: string;
}

interface Message {
  id: string | number;
  sender: 'ai' | 'client';
  text?: string;
  options?: string[];
  allowOther?: boolean;
  selectedOption?: string;
  customResponse?: string;
  inputType?: 'options' | 'text' | 'mixed';
  sections?: Section[];
  timestamp: string;
}

const initialMessages: Message[] = [
  {
    id: '1',
    sender: 'ai',
    text: 'Hi, nice to meet you. I can help turn your idea into a clear MVP plan (scope, features, timeline). To start: what are you hoping to build or improve, and what prompted you to tackle it now?',
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

  const fetchNextMessage = useCallback(async (userText: string, question?: string, selectedOption?: string) => {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_query: userText,
        session_id: actualSessionId,
        question,
        selected_option: selectedOption
      })
    });

    if (!response.ok) throw new Error('Failed to fetch next message');

    const data = await response.json();
    const hasOptions = Array.isArray(data.options) && data.options.length > 0;
    const inputType: 'options' | 'text' | 'mixed' = data.input_type || (hasOptions ? 'options' : 'text');
    const normalizedOptions = hasOptions
      ? (data.options.includes('Other') ? data.options : [...data.options, 'Other'])
      : undefined;

    const sections = data.sections?.map((section: any) => ({
      ...section,
      options: section.options?.includes('Other') ? section.options : [...(section.options || []), 'Other']
    })) || [];

    if (data.session_title) setProjectTitle(data.session_title);

    messageIdCounterRef.current += 1;
    return {
      id: `ai-${Date.now()}-${messageIdCounterRef.current}`,
      sender: 'ai' as const,
      text: data.response,
      options: normalizedOptions,
      allowOther: data.allow_other ?? Boolean(normalizedOptions),
      inputType,
      sections,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
  }, [actualSessionId]);

  // ---------------------------------------------------------------------------
  // Session restore
  // ---------------------------------------------------------------------------

  const loadSessionMessages = useCallback(async () => {
    if (!sessionId || sessionId === 'new') return;
    try {
      setIsLoading(true);
      const sessionData = await fetchSessionDetail(sessionId);
      if (!sessionData?.transcript_url) return;
      if (sessionData.title) setProjectTitle(sessionData.title);

      const transcript = await getTranscript(sessionData.transcript_url);
      if (!transcript || transcript.length === 0) return;

      const restored: Message[] = transcript.map((entry, idx) => {
        const isAI = entry.role === 'bot';
        const message = entry.message;
        const sections: Section[] = [];
        const lines = message.split('\n');
        let mainText = message;

        if (isAI) {
          const questionLines = lines.filter(line => /^\d+\.\s/.test(line.trim()));
          if (questionLines.length > 0) {
            const firstQuestionIdx = lines.findIndex(line => /^\d+\.\s/.test(line.trim()));
            mainText = lines.slice(0, firstQuestionIdx).join('\n').trim();
            questionLines.forEach((line) => {
              sections.push({
                question: line.replace(/^\d+\.\s/, '').trim(),
                inputType: 'text',
                options: [],
                allowOther: false
              });
            });
          }
        }

        return {
          id: `restored-${idx}`,
          sender: isAI ? 'ai' : 'client',
          text: mainText,
          sections: sections.length > 0 ? sections : undefined,
          selectedOption: isAI ? 'restored' : undefined,
          inputType: sections.length > 0 ? 'mixed' : isAI ? 'text' : undefined,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        };
      });

      setMessages(restored);

      const lastAIIdx = [...restored].map((m, i) => ({ m, i })).reverse().find(({ m }) => m.sender === 'ai')?.i;
      if (lastAIIdx !== undefined) {
        setMessages(prev =>
          prev.map((msg, idx) => idx === lastAIIdx ? { ...msg, selectedOption: undefined } : msg)
        );
        setCurrentQuestionId(restored[lastAIIdx].id);
      }
    } catch (error) {
      console.error('Failed to load session history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (sessionId && sessionId !== 'new' && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      setActualSessionId(sessionId);
      loadSessionMessages();
    } else if (!sessionId || sessionId === 'new') {
      setActualSessionId(Date.now().toString());
      setMessages(initialMessages);
    }
  }, [sessionId, loadSessionMessages]);

  useEffect(() => {
    if (messages.length === 0) return;
    const lastUnansweredAI = [...messages]
      .reverse()
      .find((m) => m.sender === 'ai' && !m.selectedOption && (m.options?.length || m.inputType === 'text' || !m.inputType));
    if (lastUnansweredAI && lastUnansweredAI.id !== currentQuestionId) {
      setCurrentQuestionId(lastUnansweredAI.id);
    }
  }, [messages, currentQuestionId]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleOptionSelect = (messageId: string | number, option: string) => {
    if (option === 'Other') { setShowOtherInput(true); return; }
    const currentMsg = messages.find(m => m.id === messageId);
    setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, selectedOption: option } : msg));
    const clientResponse: Message = {
      id: `client-${Date.now()}`, sender: 'client', text: option,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
    setTimeout(async () => {
      try {
        setIsLoading(true);
        const nextQuestion = await fetchNextMessage(option, currentMsg?.text || '', option);
        setMessages(prev => [...prev, clientResponse, nextQuestion]);
        setCurrentQuestionId(nextQuestion.id);
        await uploadTranscript(actualSessionId);
      } catch (error) { console.error('Failed to fetch next question:', error); }
      finally { setShowOtherInput(false); setIsLoading(false); }
    }, 300);
  };

  const handleOtherSubmit = (messageId: string | number) => {
    if (!otherInputValue.trim()) return;
    const currentMsg = messages.find(m => m.id === messageId);
    setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, selectedOption: 'Other', customResponse: otherInputValue } : msg));
    const clientResponse: Message = {
      id: `client-${Date.now()}`, sender: 'client', text: otherInputValue,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
    setTimeout(async () => {
      try {
        setIsLoading(true);
        const nextQuestion = await fetchNextMessage(otherInputValue, currentMsg?.text || '', 'Other');
        setMessages(prev => [...prev, clientResponse, nextQuestion]);
        setCurrentQuestionId(nextQuestion.id);
        await uploadTranscript(actualSessionId);
      } catch (error) { console.error('Failed to fetch next question:', error); }
      finally { setShowOtherInput(false); setOtherInputValue(''); setIsLoading(false); }
    }, 300);
  };

  const handleTextSubmit = (messageId: string | number) => {
    if (!textInputValue.trim()) return;
    const responseText = textInputValue.trim();
    setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, selectedOption: 'Text', customResponse: responseText } : msg));
    setTimeout(async () => {
      try {
        setIsLoading(true);
        const nextQuestion = await fetchNextMessage(responseText);
        const clientResponse: Message = {
          id: `client-${Date.now()}`, sender: 'client', text: responseText,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        };
        setMessages(prev => [...prev, clientResponse, nextQuestion]);
        setCurrentQuestionId(nextQuestion.id);
        setTextInputValue('');
        await uploadTranscript(actualSessionId);
      } catch (error) { console.error('Failed to fetch next question:', error); }
      finally { setIsLoading(false); }
    }, 300);
  };

  const handleSectionSubmit = () => {
    const currentMsg = messages.find(m => m.id === currentQuestionId);
    const sections = currentMsg?.sections || [];

    const allQuestions = sections.map((s, i) => `${i + 1}. ${s.question}`).join('\n');
    const responses = Object.entries(sectionInputs)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([, v]) => `A: ${v}`)
      .filter(v => v.trim())
      .join('\n\n');

    if (!responses.trim()) return;

    // Persist the typed answers onto each section so they render after submission
    setMessages(prev => prev.map(msg => {
      if (msg.id !== currentQuestionId) return msg;
      return {
        ...msg,
        selectedOption: 'answered',
        sections: msg.sections?.map((section, idx) => ({
          ...section,
          answer: sectionInputs[idx] ?? '',
        })),
      };
    }));

    setTimeout(async () => {
      try {
        setIsLoading(true);
        const nextQuestion = await fetchNextMessage(responses, allQuestions, responses);
        const clientResponse: Message = {
          id: `client-${Date.now()}`, sender: 'client', text: responses,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        };
        setMessages(prev => [...prev, clientResponse, nextQuestion]);
        setCurrentQuestionId(nextQuestion.id);
        setSectionInputs({});
        await uploadTranscript(actualSessionId);
      } catch (error) { console.error('Failed to submit sections:', error); }
      finally { setIsLoading(false); }
    }, 300);
  };

  const handleBack = () => navigate('/');
  const handleComplete = async () => {
    try {
      setIsLoading(true);
      await uploadTranscript(actualSessionId);
      navigate('/');
    } catch (error) { console.error('Save Error:', error); }
    finally { setIsLoading(false); }
  };

  const currentQuestion = messages.find((m) => m.id === currentQuestionId);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">{projectTitle}</h1>
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
                    <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">AI</span>
                        </div>
                        <span className="text-xs text-gray-400">{message.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-900 leading-relaxed mb-4">{message.text}</p>

                      {/* Multiple Sections */}
                      {message.inputType === 'mixed' && message.sections && (
                        <div className="space-y-6 mt-4 pt-4 border-t border-gray-200">
                          {message.sections.map((section, sectionIdx) => (
                            <div key={sectionIdx} className="space-y-2">
                              <h3 className="text-sm font-semibold text-gray-900">{section.question}</h3>

                              {/* Answered state — show the typed answer inline */}
                              {message.selectedOption && section.answer !== undefined && (
                                <p className="text-sm text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                                  {section.answer}
                                </p>
                              )}

                              {/* Active input — only for current unanswered message */}
                              {message.id === currentQuestionId && !message.selectedOption && (
                                <>
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
                                </>
                              )}
                            </div>
                          ))}

                          {message.id === currentQuestionId && !message.selectedOption && (
                            <button
                              onClick={handleSectionSubmit}
                              disabled={isLoading}
                              className="w-full px-4 py-3 mt-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 font-medium text-sm"
                            >
                              {isLoading ? 'Submitting...' : 'Continue'}
                            </button>
                          )}
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
                          {showOtherInput && message.allowOther && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Please specify:</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={otherInputValue}
                                  onChange={(e) => setOtherInputValue(e.target.value)}
                                  onKeyPress={(e) => { if (e.key === 'Enter') handleOtherSubmit(message.id); }}
                                  placeholder="Type your answer here..."
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                  autoFocus
                                />
                                <button onClick={() => handleOtherSubmit(message.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                  <Send className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Text input */}
                      {(message.inputType === 'text' || !message.inputType) && !message.selectedOption && message.id === currentQuestionId && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Your answer:</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={textInputValue}
                              onChange={(e) => setTextInputValue(e.target.value)}
                              onKeyPress={(e) => { if (e.key === 'Enter') handleTextSubmit(message.id); }}
                              placeholder="Type your answer here..."
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            />
                            <button onClick={() => handleTextSubmit(message.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Selected option display — skip internal markers */}
                      {message.selectedOption && !['restored', 'answered', 'Text'].includes(message.selectedOption) && (
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
            <div className="text-sm text-gray-500">Select an option above, or choose "Other" to type a custom response.</div>
          ) : (
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={textInputValue}
                  onChange={(e) => setTextInputValue(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') handleTextSubmit(currentQuestion?.id ?? ''); }}
                  placeholder="Type your response..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
              <button onClick={() => handleTextSubmit(currentQuestion?.id ?? '')} className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
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
            <span>Your responses are automatically saved. Refresh the page anytime — your progress will be preserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
}