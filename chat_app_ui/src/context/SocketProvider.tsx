import { backendURL } from "@/appConfig";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

interface SocketProviderProps {
  children?: React.ReactNode;
}

interface MsgItem {
  msg: string;
  createdBy: string;
  createdAt: string;
  _id: string;
}

interface ISocketContext {
  on: (eventName: string, callback: (data: MsgItem ) => void) => void;
  off: (eventName: string, callback: (data: MsgItem ) => void) => void;
  emit: (eventName: string, message?: MsgItem | string) => void;
  socket: Socket | undefined; // Adjusted to account for initial undefined state
}

const SocketContext = createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  return context;
};

const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);

  useEffect(() => {
    const newSocket = io(backendURL);

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Ensure socket is defined before creating the context value
  const contextValue = {
    on: (eventName: string, callback: (data: MsgItem ) => void) => {
      socket?.on(eventName, callback);
    },
    off: (eventName: string, callback: (data: MsgItem ) => void) => {
      socket?.off(eventName, callback);
    },
    emit: (eventName: string, message?: MsgItem | string) => {
      socket?.emit(eventName, message);
    },
    socket, // Provide the socket instance itself for direct access if needed
  };

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
};

export default SocketProvider;
