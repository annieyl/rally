import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { createClient } from '@supabase/supabase-js';
import ReactMarkdown from 'react-markdown';
import { Card } from './ui/Card';
import { PrimaryButton } from './ui/PrimaryButton';
import { SecondaryButton } from './ui/SecondaryButton';
import { ArrowLeft, Sparkles, Loader2, AlertCircle } from 'lucide-react';

type TranscriptMessage = {
  role: 'bot' | 'user';
  message: string;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

export function TranscriptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTranscript() {
      if (!supabase) {
        setError('Supabase is not configured. Check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: downloadError } = await supabase.storage
          .from('transcripts')
          .download(`transcripts/${id}.json`);

        if (downloadError) throw new Error(downloadError.message);

        const messages: TranscriptMessage[] = JSON.parse(await data.text());
        setTranscript(messages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transcript.');
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchTranscript();
  }, [id]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-4 mb-3">
          <SecondaryButton onClick={() => navigate('/transcripts')}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </SecondaryButton>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              Session #{id}
            </h1>
            <p className="text-sm text-gray-500">Full Transcript</p>
          </div>
          <PrimaryButton onClick={() => navigate(`/transcript/${id}/summary`)}>
            <Sparkles className="w-5 h-5" />
            View AI Summary
          </PrimaryButton>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-8 bg-[#F8F9FB]">
        <div className="max-w-4xl mx-auto">

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-24 gap-3 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading transcript...</span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Failed to load transcript</p>
                <p className="text-sm mt-1 text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Transcript */}
          {!loading && !error && transcript.length > 0 && (
            <Card>
              <div className="space-y-6">
                {transcript.map((msg, index) => {
                  const isBot = msg.role === 'bot';
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${isBot ? 'text-indigo-600' : 'text-gray-900'}`}>
                          {isBot ? 'AI' : 'Client'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 leading-relaxed pl-4 border-l-2 border-gray-200">
                        {isBot ? (
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                              ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                              ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            }}
                          >
                            {msg.message}
                          </ReactMarkdown>
                        ) : (
                          <p>{msg.message}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Empty */}
          {!loading && !error && transcript.length === 0 && (
            <div className="text-center py-24 text-gray-400 text-sm">
              No messages found for session #{id}.
            </div>
          )}

        </div>
      </div>
    </div>
  );
}