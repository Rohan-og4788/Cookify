import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FilterState {
  q: string;
  ingredients: string[];
  cuisine: string;
  diet: string[];
  maxPrepTime: number;
  difficulty: string;
  setFilter: <K extends keyof Omit<FilterState, "setFilter" | "resetFilters">>(
    key: K,
    value: FilterState[K]
  ) => void;
  resetFilters: () => void;
}

const defaultFilters = {
  q: "",
  ingredients: [] as string[],
  cuisine: "",
  diet: [] as string[],
  maxPrepTime: 180,
  difficulty: "",
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      ...defaultFilters,
      setFilter: (key, value) => set({ [key]: value }),
      resetFilters: () => set(defaultFilters),
    }),
    { name: "recipe-filters", partialize: (s) => ({ maxPrepTime: s.maxPrepTime }) }
  )
);

interface CookingState {
  currentStep: number;
  servings: number;
  checkedIngredients: Set<string>;
  setCurrentStep: (step: number) => void;
  setServings: (servings: number) => void;
  toggleIngredient: (id: string) => void;
  resetCooking: () => void;
}

export const useCookingStore = create<CookingState>((set, get) => ({
  currentStep: 0,
  servings: 4,
  checkedIngredients: new Set(),
  setCurrentStep: (step) => set({ currentStep: step }),
  setServings: (servings) => set({ servings }),
  toggleIngredient: (id) => {
    const checked = new Set(get().checkedIngredients);
    if (checked.has(id)) checked.delete(id);
    else checked.add(id);
    set({ checkedIngredients: checked });
  },
  resetCooking: () =>
    set({ currentStep: 0, checkedIngredients: new Set() }),
}));

interface OfflineState {
  savedRecipeIds: string[];
  addOfflineRecipe: (id: string) => void;
  removeOfflineRecipe: (id: string) => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      savedRecipeIds: [],
      addOfflineRecipe: (id) => {
        const ids = get().savedRecipeIds;
        if (!ids.includes(id)) set({ savedRecipeIds: [...ids, id] });
      },
      removeOfflineRecipe: (id) =>
        set({ savedRecipeIds: get().savedRecipeIds.filter((r) => r !== id) }),
    }),
    { name: "offline-recipes" }
  )
);
