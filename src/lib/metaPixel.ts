/**
 * Safe utility to trigger Meta Pixel events without causing application crashes.
 */

// Declare the global fbq function for TypeScript compatibility
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

/**
 * Safe wrapper for fbq calls to ensure no crashes occur even if blocked by ad-blockers inside user browsers.
 */
export function safeTrack(event: string, params?: Record<string, any>): void {
  if (typeof window === "undefined") return;

  try {
    if (typeof window.fbq === "function") {
      if (params) {
        window.fbq('track', event, params);
      } else {
        window.fbq('track', event);
      }
      console.log(`[Meta Pixel] Tracked event "${event}" with parameters:`, params);
    } else {
      console.warn(`[Meta Pixel] fbq function not found on window. Event "${event}" was not recorded.`);
    }
  } catch (err) {
    console.error(`[Meta Pixel] Error tracking event "${event}":`, err);
  }
}
