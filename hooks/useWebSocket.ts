import {Story} from '@/contexts/StoryChatContext';
import {useEffect, useRef, useState, useCallback} from 'react';

type MessageType = 'response' | 'error' | 'connected';

interface BaseMessage {
  type: MessageType;
}

interface ResponseData {
  content: string;
  title?: string;
  tags?: string[];
}

interface ResponseMessage extends BaseMessage {
  type: 'response';
  data: ResponseData;
}

interface ErrorMessage extends BaseMessage {
  type: 'error';
  error: string;
}

interface ConnectedMessage extends BaseMessage {
  type: 'connected';
  story: Story;
}

type WebSocketMessage = ResponseMessage | ErrorMessage | ConnectedMessage;

interface UseWebSocketOptions {
  url: string;
  enabled?: boolean;
  onResponse: (message: ResponseMessage) => void;
  onError?: (message: ErrorMessage) => void;
  onConnected?: (message: ConnectedMessage) => void;
  onConnectionError?: () => void;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  send: (data: string) => boolean;
}

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {url, enabled = true} = options;

  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const optionsRef = useRef(options);

  // Keep options ref updated to avoid stale closures
  // eslint-disable-next-line react-hooks/refs
  optionsRef.current = options;

  useEffect(() => {
    if (!enabled) return;

    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = event => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        console.log('WebSocket received:', message);

        switch (message.type) {
          case 'response':
            optionsRef.current.onResponse?.(message);
            break;
          case 'error':
            optionsRef.current.onError?.(message);
            break;
          case 'connected':
            optionsRef.current.onConnected?.(message);
            break;
          default:
            console.warn('Unknown message type:', message);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onclose = event => {
      console.log('WebSocket closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
      setIsConnected(false);
    };

    ws.onerror = error => {
      console.error('WebSocket error:', error);
      optionsRef.current.onConnectionError?.();
    };

    socketRef.current = ws;

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [url, enabled]);

  const send = useCallback((data: string): boolean => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({data, type: 'chat'}));
      return true;
    }
    console.warn('WebSocket not connected');
    return false;
  }, []);

  return {
    isConnected,
    send,
  };
}
