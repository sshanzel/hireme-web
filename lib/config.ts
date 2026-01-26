/**
 * Application configuration
 *
 * API_URL: Base URL for API calls
 * - Always '/api' - requests are proxied through Next.js to the backend
 * - Backend URL is configured via API_URL env var in next.config.ts
 *
 * WS_URL: WebSocket server URL (direct connection, not proxied)
 * - Development: defaults to 'ws://localhost:4000'
 * - Production: set NEXT_PUBLIC_WS_URL to your WebSocket server (e.g., wss://api.hireme.dev)
 */

export const API_URL = '/api';

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';
