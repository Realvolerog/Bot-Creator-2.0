
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  onQuickReply: (replyText: string) => void;
  isLoading: boolean;
  theme: 'light' | 'dark';
  onOpenVectorStorage?: () => void;
  onOpenEditor?: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  onQuickReply, 
  isLoading, 
  theme,
  onOpenVectorStorage,
  onOpenEditor
}) => {
  const { sender, text } = message;

  let mainText = text;
  let buttons: string[] = [];
  const popups: { text: string; url: string; width: string; height: string }[] = [];

  // Type guard to ensure `text` is a string before using string methods.
  if (typeof text === 'string') {
    // 1. More robust support for ProTalk Native Syntax: ##INLINE:[...][...]##
    // The `s` flag allows `.` to match newlines. The `g` flag finds all occurrences.
    const inlineRegex = /##INLINE:((?:\[.*?\])+)##/gs;
    const allMatches = Array.from(text.matchAll(inlineRegex));

    if (allMatches.length > 0) {
      mainText = String(mainText).replace(inlineRegex, '').trim(); // Clean the text of all tags

      allMatches.forEach(match => {
        const rawContent = match[1]; // This is one or more bracket groups, e.g., "[Btn1;Btn2][Btn3]"
        const buttonGroups = rawContent.match(/\[(.*?)\]/g); // Find all individual [...] groups

        if (buttonGroups) {
          buttonGroups.forEach(group => {
            const cleanGroup = group.slice(1, -1); // Faster way to remove brackets
            const groupButtons = cleanGroup.split(';').map(b => b.trim()).filter(Boolean);
            buttons.push(...groupButtons);
          });
        }
      });
    } 
    // 2. Support for Assistant Syntax: [Btn1|Btn2] at end of string (Fallback)
    else {
        // Regex to find [Button1|Button2|...] at the end of the string
        const buttonRegex = /\[([^\[\]]+)\]\s*$/;
        const match = text.match(buttonRegex);
        // Check if match found, it's a bot message, and contains pipes
        if (match && sender === 'bot' && match[1].includes('|')) {
           mainText = text.substring(0, match.index).trim();
           buttons = match[1].split('|').map(btn => btn.trim());
        }
    }
    
    // 3. New support for popup buttons
    const popupRegex = /##POPUP:\[([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\]##/g;
    const popupMatches = Array.from(text.matchAll(popupRegex));
    if (popupMatches.length > 0) {
        mainText = String(mainText).replace(popupRegex, '').trim();
        popupMatches.forEach(match => {
            popups.push({
                text: match[1],
                url: match[2],
                width: match[3],
                height: match[4],
            });
        });
    }
  }
  
  const bubbleClasses = {
    user: 'bg-[#2a62ff] text-white self-end rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl',
    bot: 'bg-gray-200 dark:bg-[#36404a] text-gray-800 dark:text-gray-200 self-start rounded-tr-2xl rounded-tl-2xl rounded-br-2xl',
    system: 'bg-gray-100 dark:bg-[#36404a]/50 text-yellow-600 dark:text-yellow-400 self-center text-xs italic border border-dashed border-gray-300 dark:border-[#424e5a]'
  };

  const wrapperClasses = {
      user: 'flex justify-end',
      bot: 'flex justify-start flex-col items-start', // Allow buttons to stack below
      system: 'flex justify-center w-full' // Ensure system messages can take full width if needed
  };

  // If the text is a React Node (not a string), render it directly without Markdown wrapper/styles
  const isReactNode = typeof mainText !== 'string';

  // Helper to strip button commands for display (e.g. "Button(cmd:/start)" -> "Button")
  const getButtonLabel = (btnText: string) => {
      return btnText.split('(')[0]; // Simple split to hide technical commands like (url:...) or (cmd:...)
  };

  const handlePopupClick = (popup: { url: string; width: string; height: string; text: string; }) => {
    const { url, width, height, text: popupText } = popup;
    const lowerUrl = url.toLowerCase();
    const lowerText = popupText.toLowerCase();

    // Перехватываем открытие векторного хранилища в центральном блоке
    if (lowerUrl.includes('protalk-vector-storage') || lowerUrl.includes('vector-storage') || lowerText.includes('векторн')) {
      if (onOpenVectorStorage) {
        onOpenVectorStorage();
        return;
      }
    }

    // Перехватываем открытие редактора бота в центральном блоке
    if (lowerUrl.includes('protalk-bot-editor') || lowerText.includes('редактор')) {
      if (onOpenEditor) {
        onOpenEditor();
        return;
      }
    }

    const themeParams = `theme=${theme}&dark=${theme === 'dark' ? 1 : 0}`;
    const finalUrl = url.includes('?') ? `${url}&${themeParams}` : `${url}?${themeParams}`;
    const features = `width=${width},height=${height},popup=yes,scrollbars=yes,resizable=yes`;
    window.open(finalUrl, '_blank', features);
  };

  return (
    <div className={wrapperClasses[sender]}>
        {isReactNode ? (
            <div className="w-full max-w-xl lg:max-w-2xl">
                {mainText}
            </div>
        ) : (
            <div className={`prose dark:prose-invert max-w-xl lg:max-w-2xl px-5 py-3 shadow-md ${bubbleClasses[sender]}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{String(mainText)}</ReactMarkdown>
            </div>
        )}
        
        {buttons.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 max-w-xl lg:max-w-2xl">
                {buttons.map((buttonText, index) => {
                    const lowerBtn = buttonText.toLowerCase();
                    const isVectorBtn = lowerBtn.includes('open_vector_storage') || lowerBtn.includes('векторн') || lowerBtn.includes('загрузка знаний в векторном виде');
                    return (
                        <button
                            key={index}
                            onClick={() => {
                                if (isVectorBtn && onOpenVectorStorage) {
                                    onOpenVectorStorage();
                                    return;
                                }
                                onQuickReply(buttonText);
                            }}
                            disabled={isLoading}
                            className="px-4 py-1.5 text-sm font-medium text-blue-800 dark:text-gray-200 bg-blue-100 dark:bg-[#424e5a] rounded-lg hover:bg-blue-200 dark:hover:bg-[#36404a] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-[#2a62ff] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {getButtonLabel(buttonText)}
                        </button>
                    );
                })}
            </div>
        )}
        
        {popups.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 max-w-xl lg:max-w-2xl">
                {popups.map((popup, index) => (
                    <button
                        key={index}
                        onClick={() => handlePopupClick(popup)}
                        disabled={isLoading}
                        className="px-4 py-1.5 text-sm font-medium text-purple-800 dark:text-purple-200 bg-purple-100 dark:bg-[#424e5a] rounded-lg hover:bg-purple-200 dark:hover:bg-[#36404a] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {popup.text}
                    </button>
                ))}
            </div>
        )}
    </div>
  );
};

export default MessageBubble;