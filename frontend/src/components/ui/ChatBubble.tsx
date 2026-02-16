interface ChatBubbleProps {
  sender: string;
  text: string;
  timestamp: string;
}

export function ChatBubble({ sender, text, timestamp }: ChatBubbleProps) {
  const isAI = sender === 'ai';

  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-2xl ${isAI ? 'mr-auto' : 'ml-auto'}`}>
        <div
          className={`rounded-lg px-4 py-3 ${
            isAI
              ? 'bg-white border border-gray-200 text-gray-900'
              : 'bg-indigo-600 text-white'
          }`}
        >
          {isAI ? (
            <div 
              className="text-sm leading-relaxed prose prose-indigo prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: text }} 
            />
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
          )}
        </div>


        <div className={`flex items-center gap-2 mt-1 px-2 ${isAI ? '' : 'justify-end'}`}>
          <span className="text-xs text-gray-400">{timestamp}</span>
        </div>
      </div>
    </div>
  );
}
