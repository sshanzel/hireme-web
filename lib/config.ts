/**
 * Application configuration
 *
 * API_URL: Base URL for API calls
 * - Development: defaults to '/api' (proxied via next.config.ts rewrites)
 * - Production: set NEXT_PUBLIC_API_URL to your API server (e.g., https://api.hireme.dev)
 *
 * WS_URL: WebSocket server URL
 * - Development: defaults to 'ws://localhost:4000'
 * - Production: set NEXT_PUBLIC_WS_URL to your WebSocket server
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';
