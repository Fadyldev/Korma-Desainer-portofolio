import React, { createContext, useContext, useState, useEffect } from 'react';

interface ContentContextType {
  content: Record<string, string>;
  isLoading: boolean;
  refreshContent: () => Promise<void>;
  getText: (key: string, fallback?: string) => string;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshContent = async () => {
    try {
      const res = await fetch('/api/content');
      if (res.ok) {
        const data = await res.json();
        setContent(data);
      }
    } catch (err) {
      console.error('Failed to load website content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshContent();
  }, []);

  const getText = (key: string, fallback: string = ''): string => {
    return content[key] !== undefined ? content[key] : fallback;
  };

  return (
    <ContentContext.Provider value={{ content, isLoading, refreshContent, getText }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
