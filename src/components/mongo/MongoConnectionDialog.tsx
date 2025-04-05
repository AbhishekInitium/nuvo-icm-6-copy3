
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMongo } from '@/contexts/MongoContext';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/api/client';

export function MongoConnectionDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { mongoUri, setMongoUri, setIsConnected } = useMongo();
  const [uri, setUri] = useState(mongoUri);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const handleConnect = async () => {
    if (!uri || uri.trim() === '') {
      toast({
        title: "MongoDB URI Required",
        description: "Please enter a valid MongoDB URI to connect",
        variant: "destructive",
      });
      return;
    }
    
    setIsConnecting(true);
    
    try {
      // Test connection by making a basic request with the MongoDB URI
      const result = await apiClient.get('/health/check', {
        headers: {
          'x-mongo-uri': uri
        }
      });
      
      if (result.status === 200) {
        setMongoUri(uri);
        setIsConnected(true);
        toast({
          title: "Connected to MongoDB",
          description: "Successfully connected to your MongoDB instance",
        });
        onClose();
      }
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to MongoDB with the provided URI",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect to MongoDB</DialogTitle>
          <DialogDescription>
            Enter your MongoDB connection URI to begin using the application
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mongo-uri" className="text-right">
              MongoDB URI
            </Label>
            <Input
              id="mongo-uri"
              className="col-span-3"
              placeholder="mongodb://username:password@host:port/database"
              value={uri}
              onChange={(e) => setUri(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? "Connecting..." : "Connect"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
