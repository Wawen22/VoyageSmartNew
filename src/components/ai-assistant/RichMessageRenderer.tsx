
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

  // Regex to match any [[TYPE:ID]] pattern
  const parts = content.split(/(\[\[.*?:.*?\]\])/g);

  return (
    <div className="space-y-3 w-full max-w-full overflow-hidden">
      {parts.map((part, index) => {
        const match = part.match(/^\[\[(.*?):(.*?)]]$/);

        if (match) {
          const [, type, id] = match;
          
          // Strategy: Look up the ID in all lists to find the correct entity
          // This makes it robust even if AI uses "sightseeing" instead of "activity" as type
          
          const accommodation = contextData.accommodations.find(a => a.id === id);
          if (accommodation) {
            return (
              <ChatAccommodationCard 
                key={index}
                data={accommodation}
                onClick={() => handleNavigate(`/accommodations?trip=${tripId}`)}
              />
            );
          }

          const transport = contextData.transports.find(t => t.id === id);
          if (transport) {
            return (
              <ChatTransportCard 
                key={index}
                data={transport}
                onClick={() => handleNavigate(`/transports?trip=${tripId}`)}
              />
            );
          }

          const expense = contextData.expenses.find(e => e.id === id);
          if (expense) {
            return (
              <ChatExpenseCard 
                key={index}
                data={expense}
                onClick={() => handleNavigate(`/expenses?trip=${tripId}`)}
              />
            );
          }

          const activity = contextData.activities.find(a => a.id === id);
          if (activity) {
            return (
              <ChatActivityCard 
                key={index}
                data={activity}
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

