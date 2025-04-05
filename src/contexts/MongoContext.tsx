
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface MongoContextProps {
  mongoUri: string;
  setMongoUri: (uri: string) => void;
  isConnected: boolean;
  setIsConnected: (status: boolean) => void;
}

const MongoContext = createContext<MongoContextProps | undefined>(undefined);

export function MongoProvider({ children }: { children: ReactNode }) {
  // Get from localStorage if available to persist across page reloads
  const storedUri = localStorage.getItem('mongodb_uri') || '';
  const [mongoUri, setMongoDbUri] = useState<string>(storedUri);
  const [isConnected, setConnected] = useState<boolean>(!!storedUri);

  const setMongoUri = (uri: string) => {
    setMongoDbUri(uri);
    localStorage.setItem('mongodb_uri', uri);
  };

  const setIsConnected = (status: boolean) => {
    setConnected(status);
  };

  return (
    <MongoContext.Provider value={{ mongoUri, setMongoUri, isConnected, setIsConnected }}>
      {children}
    </MongoContext.Provider>
  );
}

export function useMongo() {
  const context = useContext(MongoContext);
  if (context === undefined) {
    throw new Error('useMongo must be used within a MongoProvider');
  }
  return context;
}
