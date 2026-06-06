import { AppDataStore } from "./types";
import { PRODUCTS } from "./data";

export const DEFAULT_APP_DATA: AppDataStore = {
  restaurant: {
    companyName: "Divinos Paulista",
    logo: "", // Empty means text fallback/badge "DP"
    banner: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=1200&auto=format&fit=crop",
    whatsapp: "5511995946993",
    workingHours: "Aberto das 10:30h até 00h",
    deliveryFee: 9.0,
    estimatedTime: "30-45 min",
    mainTitle: "Almoço brasileiro todos os dias",
    subTitle: "Almoço Paulista Tradicional"
  },
  categories: [
    { id: "Pratos Comerciais", name: "Pratos Comerciais", isActive: true },
    { id: "Pratos Executivos", name: "Pratos Executivos", isActive: true },
    { id: "Pratos Especiais", name: "Pratos Especiais", isActive: true },
    { id: "Bebidas", name: "Bebidas", isActive: true },
    { id: "Sucos Naturais", name: "Sucos Naturais", isActive: true },
    { id: "Sobremesas", name: "Sobremesas", isActive: true }
  ],
  products: PRODUCTS.filter((p) => p.id !== "prato-do-dia").map((p) => ({
    ...p,
    isActive: true,
    isFeatured: ["feijoada-completa", "costela-cozida-mandioca", "parmegiana-frango-especial"].includes(p.id)
  })),
  pratoDoDia: {
    name: "Prato do Dia",
    description: "Almoço completo do dia com arroz branco, feijão caseiro, carne do dia, acompanhamento especial e salada simples com alface, tomate e cebola.",
    price: 24.90,
    image: "https://images.unsplash.com/photo-1625938146369-adc83368bda7?q=80&w=800&auto=format&fit=crop",
    isActive: true
  }
};
