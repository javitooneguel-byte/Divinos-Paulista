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
 * Normalizes user data for Meta Advanced Matching
 */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  // If it doesn't start with 55 and looks like a Brazilian phone (10 or 11 digits), prepend 55
  if (digits.length >= 10 && !digits.startsWith("55")) {
    return "55" + digits;
  }
  return digits;
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function normalizeCity(city: string): string {
  return city.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Initializes/Updates Meta Pixel with Advanced Matching
 */
export function initAdvancedMatching(userData: { name?: string; phone?: string; city?: string }): void {
  if (typeof window === "undefined") return;
  
  try {
    if (typeof window.fbq === "function") {
      const matchingData: Record<string, string> = {};
      
      if (userData.phone) {
        const ph = normalizePhone(userData.phone);
        if (ph) matchingData.ph = ph;
      }
      if (userData.name) {
        const fn = normalizeName(userData.name);
        if (fn) matchingData.fn = fn;
      }
      if (userData.city) {
        const ct = normalizeCity(userData.city);
        if (ct) matchingData.ct = ct;
      }
      
      if (Object.keys(matchingData).length > 0) {
        // Re-initialize with the matching data
        window.fbq('init', '986629454114423', matchingData);
        console.log("[Meta Pixel] Initialized with Advanced Matching:", matchingData);
      }
    }
  } catch (err) {
    console.error("[Meta Pixel] Error initializing Advanced Matching:", err);
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

