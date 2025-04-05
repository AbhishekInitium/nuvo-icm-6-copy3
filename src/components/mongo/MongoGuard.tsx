
import React, { useEffect, useState } from 'react';
import { useMongo } from '@/contexts/MongoContext';
import { MongoConnectionDialog } from './MongoConnectionDialog';
import { setMongoDbUri } from '@/api/client';

interface MongoGuardProps {
  children: React.ReactNode;
}

export const MongoGuard: React.FC<MongoGuardProps> = ({ children }) => {
  const { mongoUri, isConnected } = useMongo();
  const [showDialog, setShowDialog] = useState(!isConnected);

  useEffect(() => {
    // Apply the MongoDB URI to the API client
    if (mongoUri) {
      setMongoDbUri(mongoUri);
    }

    // If no URI is available or not connected, show the dialog
    setShowDialog(!isConnected || !mongoUri);
  }, [mongoUri, isConnected]);

  return (
    <>
      {/* Render children only if we have a MongoDB URI and are connected */}
      {isConnected && mongoUri ? children : null}
      
      {/* Show connection dialog if needed */}
      <MongoConnectionDialog
        isOpen={showDialog}
        onClose={() => {
          // Don't allow closing without a connection
          if (isConnected) {
            setShowDialog(false);
          }
        }}
      />
    </>
  );
};
