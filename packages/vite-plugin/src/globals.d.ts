import { TransformResult } from 'vite'

declare module 'vite' {
  interface ViteDevServer {
    _pendingRequests: Map<string, Promise<TransformResult | null>>
  }
}
