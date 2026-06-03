import { AppDataStore } from "../types";
import { DEFAULT_APP_DATA } from "../defaultData";

const STORAGE_KEY = "divinosPaulistaData_v1";

export function loadAppData(): AppDataStore {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.restaurant && Array.isArray(parsed.products) && Array.isArray(parsed.categories)) {
        // Handle migration fields if necessary
        return {
          restaurant: { ...DEFAULT_APP_DATA.restaurant, ...parsed.restaurant },
          categories: parsed.categories,
          products: parsed.products,
          pratoDoDia: parsed.pratoDoDia || DEFAULT_APP_DATA.pratoDoDia
        };
      }
    } catch (e) {
      console.error("Failed to load local data, using defaults:", e);
    }
  }
  return JSON.parse(JSON.stringify(DEFAULT_APP_DATA));
}

export function saveAppData(data: AppDataStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetAppDataToDefault(): void {
  localStorage.removeItem(STORAGE_KEY);
}
