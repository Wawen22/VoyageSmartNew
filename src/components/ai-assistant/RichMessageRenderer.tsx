
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';
import { 
  ChatAccommodationCard, 
  ChatTransportCard, 
  ChatExpenseCard, 
  ChatActivityCard 
} from "./ChatEntityCards";

interface RichMessageRendererProps {
  content: string;
  contextData: {
    activities: any[];
    expenses: any[];
    accommodations: any[];
    transports: any[];
    ideas: any[];
  };
  tripId: string;
  onLinkClick?: () => void;
}

export function RichMessageRenderer({ content, contextData, tripId, onLinkClick }: RichMessageRendererProps) {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    onLinkClick?.();
  };

  // Regex to match [[TYPE:ID]] patterns
  const parts = content.split(/(\[\[(?:accommodation|transport|activity|expense):.*?\]\])/g);

  return (
    <div className="space-y-3 w-full max-w-full overflow-hidden">
      {parts.map((part, index) => {
        const match = part.match(/^\[\[(accommodation|transport|activity|expense):(.*?)]]$/);

        if (match) {
          const [, type, id] = match;
          
          if (type === 'accommodation') {
            const item = contextData.accommodations.find(a => a.id === id);
            if (!item) return null;
            return (
              <ChatAccommodationCard 
                key={index}
                data={item}
                onClick={() => handleNavigate(`/accommodations?trip=${tripId}`)}
              />
            );
          }

          if (type === 'transport') {
            const item = contextData.transports.find(t => t.id === id);
            if (!item) return null;
            return (
              <ChatTransportCard 
                key={index}
                data={item}
                onClick={() => handleNavigate(`/transports?trip=${tripId}`)}
              />
            );
          }

          if (type === 'expense') {
            const item = contextData.expenses.find(e => e.id === id);
            if (!item) return null;
            return (
              <ChatExpenseCard 
                key={index}
                data={item}
                onClick={() => handleNavigate(`/expenses?trip=${tripId}`)}
              />
            );
          }

          if (type === 'activity') {
            const item = contextData.activities.find(a => a.id === id);
            if (!item) return null;
            return (
              <ChatActivityCard 
                key={index}
                data={item}
                onClick={() => handleNavigate(`/itinerary?trip=${tripId}`)}
              />
            );
          }
          
          return null;
        }

        // Standard Markdown Text
        if (!part.trim()) return null;
        
        return (
          <div key={index} className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-100 dark:prose-pre:bg-slate-900 break-words">
             <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  ul: ({node, ...props}) => <ul className="list-disc ml-4 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal ml-4 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="mb-0" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                  a: ({node, ...props}) => <a className="text-indigo-600 dark:text-indigo-400 underline cursor-pointer" target="_blank" rel="noopener noreferrer" {...props} />,
                  code: ({node, ...props}) => <code className="bg-muted px-1 py-0.5 rounded text-xs break-all" {...props} />,
                }}
              >
                {part}
              </ReactMarkdown>
          </div>
        );
      })}
    </div>
  );
}

