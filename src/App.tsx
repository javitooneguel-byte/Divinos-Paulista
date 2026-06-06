/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useMemo } from "react";
import { 
  ShoppingBag, 
  Search, 
  Sparkles, 
  Check, 
  MapPin, 
  Clock, 
  AlertTriangle,
  HelpCircle,
  X,
  Plus,
  ChefHat,
  UtensilsCrossed,
  Truck,
  Flame,
  MessageSquare
} from "lucide-react";
import { Header } from "./components/Header";
import { PratoDoDia } from "./components/PratoDoDia";
import { CategoryFilters } from "./components/CategoryFilters";
import { ProductCard } from "./components/ProductCard";
import { CartDrawer } from "./components/CartDrawer";
import { AdminPanel } from "./components/AdminPanel";
import { ProductModal } from "./components/ProductModal";
import { RedirectionPage } from "./components/RedirectionPage";
import { MaisPedidosSection } from "./components/MaisPedidosSection";
import { loadAppData } from "./lib/db";
import { Product, CartItem, Customer, Address } from "./types";
import { 
  loadSupabaseSettings, 
  loadSupabaseCategories, 
  loadSupabaseProducts 
} from "./lib/supabase";
import { safeTrack } from "./lib/metaPixel";

export default function App() {
  // Simple Client-Side Router
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  useEffect(() => {
    // Dynamically trigger PageView on any client-side page route or hash changes
    safeTrack("PageView");
  }, [currentPath]);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      
      const hash = window.location.hash;
      if (hash === "#/endereco") {
        setIsCartOpen(true);
        
        // Restore cart from backup if we backed into the checkout stage!
        const backupStr = sessionStorage.getItem("backup_cart_items");
        if (backupStr) {
          try {
            const parsed = JSON.parse(backupStr);
            if (parsed && parsed.length > 0) {
              setCartItems(parsed);
              sessionStorage.removeItem("backup_cart_items"); // Clear backup so it doesn't double-restore
            }
          } catch (e) {
            console.warn("Could not restore backup:", e);
          }
        }
      } else if (hash === "#/carrinho") {
        setIsCartOpen(true);
      } else {
        setIsCartOpen(false);
      }
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    
    // Initialize state on mount
    handleLocationChange();

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  // Load App Data from Storage (configured restaurant parameters and catalog)
  // Retrieve cached app data from localStorage if available, so it loads instantly in under 10ms!
  const [appData, setAppData] = useState<any>(() => {
    try {
      const cached = localStorage.getItem("divinos_paulista_app_data_cache");
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn("Could not load cached menu state:", e);
    }
    return loadAppData();
  });

  // Since we have cached or local fallback data immediately, we only show full page spinner on very first load
  const [isLoadingSupabase, setIsLoadingSupabase] = useState(() => {
    try {
      const cached = localStorage.getItem("divinos_paulista_app_data_cache");
      return !cached;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    async function loadLiveSupabaseData() {
      let settingsRow = null;
      let categoriesRows = null;
      let productsRows = null;
      let fetchFailed = false;

      try {
        // Fire all Supabase loaded requests concurrently in parallel (3x performance improvement!)
        const [settings, categories, products] = await Promise.all([
          loadSupabaseSettings(),
          loadSupabaseCategories(),
          loadSupabaseProducts()
        ]);
        settingsRow = settings;
        categoriesRows = categories;
        productsRows = products;
      } catch (err) {
        console.error("Error loading live Supabase data on public view:", err);
        fetchFailed = true;
      }

      const fallbackData = loadAppData();

      // Check if we retrieved valid Supabase data
      const hasSupabaseData = !fetchFailed && (
        settingsRow || 
        (categoriesRows && categoriesRows.length > 0) || 
        (productsRows && productsRows.length > 0)
      );

      if (hasSupabaseData) {
        const loadedData = {
          restaurant: settingsRow ? {
            companyName: settingsRow.company_name || settingsRow.companyName || "Divinos Paulista",
            logo: settingsRow.logo || "",
            banner: settingsRow.banner || "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=1200&auto=format&fit=crop",
            whatsapp: settingsRow.whatsapp || "5511995946993",
            workingHours: settingsRow.working_hours || settingsRow.workingHours || "Aberto das 10:30h até 00h",
            deliveryFee: parseFloat(settingsRow.delivery_fee !== undefined ? settingsRow.delivery_fee : (settingsRow.deliveryFee !== undefined ? settingsRow.deliveryFee : 9.0)),
            estimatedTime: settingsRow.estimated_time || settingsRow.estimatedTime || "30-45 min",
            mainTitle: settingsRow.main_title || settingsRow.mainTitle || "Almoço brasileiro todos os dias",
            subTitle: settingsRow.sub_title || settingsRow.subTitle || "Almoço Paulista Tradicional"
          } : fallbackData.restaurant,

          pratoDoDia: settingsRow ? {
            name: settingsRow.prato_do_dia_name || settingsRow.pratoDoDiaName || "Prato do Dia",
            description: settingsRow.prato_do_dia_description || settingsRow.pratoDoDiaDescription || "Almoço completo do dia com arroz branco, feijão caseiro, carne do dia, acompanhamento especial e salada simples.",
            price: parseFloat(settingsRow.prato_do_dia_price !== undefined ? settingsRow.prato_do_dia_price : (settingsRow.pratoDoDiaPrice !== undefined ? settingsRow.pratoDoDiaPrice : 24.90)),
            image: settingsRow.prato_do_dia_image || settingsRow.pratoDoDiaImage || "https://images.unsplash.com/photo-1625938146369-adc83368bda7?q=80&w=800&auto=format&fit=crop",
            isActive: settingsRow.prato_do_dia_is_active !== undefined ? settingsRow.prato_do_dia_is_active : (settingsRow.pratoDoDiaIsActive !== undefined ? settingsRow.pratoDoDiaIsActive : true)
          } : fallbackData.pratoDoDia,

          categories: (categoriesRows && categoriesRows.length > 0) ? categoriesRows.map((dbRow: any) => ({
            id: dbRow.id,
            name: dbRow.name,
            isActive: dbRow.is_active !== undefined ? dbRow.is_active : (dbRow.isActive !== undefined ? dbRow.isActive : true)
          })) : [],

          products: (productsRows && productsRows.length > 0) ? productsRows.map((dbRow: any) => ({
            id: dbRow.id,
            name: dbRow.name,
            description: dbRow.description || "",
            price: parseFloat(dbRow.price || 0),
            category: dbRow.category || "",
            image: dbRow.image || "",
            isActive: dbRow.is_active !== undefined ? dbRow.is_active : (dbRow.isActive !== undefined ? dbRow.isActive : true),
            isFeatured: dbRow.is_featured !== undefined ? dbRow.is_featured : (dbRow.isFeatured !== undefined ? dbRow.isFeatured : false),
            selo: dbRow.selo || dbRow.badge || ""
          })) : []
        };

        setAppData(loadedData);
        // Persist fresh data to local SWR cache for the next fast load
        try {
          localStorage.setItem("divinos_paulista_app_data_cache", JSON.stringify(loadedData));
        } catch (e) {
          console.warn("Failed to write to cache:", e);
        }
      } else {
        setAppData(fallbackData);
      }
      setIsLoadingSupabase(false);
    }

    loadLiveSupabaseData();
  }, []);

  // Main Catalog & Interactive states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [typedQuery, setTypedQuery] = useState<string>("");
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  
  // Custom styled alert modal state
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Added product toast notification state
  const [addedNotification, setAddedNotification] = useState<string | null>(null);

  // Cart calculation state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // Product detail modal state
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);

  // Trigger ViewContent when the product modal is opened
  useEffect(() => {
    if (isProductModalOpen && selectedProductForModal) {
      safeTrack("ViewContent", {
        content_name: selectedProductForModal.name,
        content_ids: [selectedProductForModal.id],
        content_type: "product",
        value: selectedProductForModal.price,
        currency: "BRL"
      });
    }
  }, [isProductModalOpen, selectedProductForModal]);

  // Checkout inputs state
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    phone: ""
  });
  const [address, setAddress] = useState<Address>({
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    reference: ""
  });
  const [observation, setObservation] = useState<string>("");

  // Menu list reference for smooth scrolling
  const menuCatalogRef = useRef<HTMLDivElement>(null);
  const maisPedidosRef = useRef<HTMLDivElement>(null);

  // We dynamically build the "Mais Pedidos" items list based purely on the admin's database configurations (isFeatured === true)
  const maisPedidosList = useMemo(() => {
    if (!appData || !appData.products) return [];

    // Filter products marked as isFeatured
    const featuredList = appData.products.filter((p: any) => p.isFeatured === true && p.isActive !== false);
    
    if (featuredList.length > 0) {
      return featuredList;
    }

    // Default fallbacks if NO products have isFeatured: true selected yet (initial state)
    const fallbacks = [
      {
        id: "feijoada-completa",
        name: "Feijoada Completa",
        description: "Feijoada robusta servida com arroz branco, couve fresca refogada, farofa temperada, vinagrete, torresmo crocante e fatias de laranja.",
        price: 39.90,
        category: "Pratos Especiais",
        image: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=1200&auto=format&fit=crop",
        selo: "🔥 Mais pedido"
      },
      {
        id: "costela-cozida-mandioca",
        name: "Costela Cozida com Mandioca",
        description: "Costela bovina cozida lentamente até desfiar ao molho de ervas fresco, servida com mandioca na manteiga, arroz, feijão and farofa.",
        price: 44.90,
        category: "Pratos Especiais",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop",
        selo: "🔥 Mais pedido"
      },
      {
        id: "parmegiana-frango-especial",
        name: "Parmegiana de Frango Especial",
        description: "Filé de frango empanado crocante coberto com molho de tomate artesanal e queijo muçarela derretido, servido com arroz e fritas.",
        price: 39.90,
        category: "Pratos Especiais",
        image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=600&auto=format&fit=crop",
        selo: "⭐ Especial da casa"
      },
      {
        id: "bife-a-cavalo",
        name: "Bife à Cavalo",
        description: "Bife suculento de contra filé grelhado na chapa coroado com dois ovos fritos perfeitos, acompanhado de arroz soltinho, feijão caseiro, batata frita e farofa.",
        price: 38.90,
        category: "Pratos Executivos",
        image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=600&auto=format&fit=crop",
        selo: "🍽️ Bem servido"
      },
      {
        id: "executivo-frango-cozido-batatas",
        name: "Executivo de Frango Cozido com Batatas",
        description: "Peito e sobrecoxa de frango bem cozidos e suculentos com batatas coradas, servidos com arroz branco soltinho, feijão caseiro temperado e farofa de milho.",
        price: 33.90,
        category: "Pratos Executivos",
        image: "https://images.unsplash.com/photo-1594756202469-9ff9799a2e4e?q=80&w=600&auto=format&fit=crop",
        selo: "🍽️ Bem servido"
      }
    ];

    return fallbacks.map(fallback => {
      // Find the product by name or substring to allow for minor spelling updates by the admin
      const matched = appData.products.find((p: any) => 
        p.name.toLowerCase() === fallback.name.toLowerCase() ||
        p.name.toLowerCase().includes(fallback.name.toLowerCase().replace("especial", "").trim())
      );
      if (matched) {
        return {
          ...fallback,
          ...matched,
          // Guarantee it has a premium tag if none is present
          selo: matched.selo || fallback.selo
        };
      }
      return fallback;
    });
  }, [appData]);

  // Intercept Admin Route
  if (currentPath === "/admin" || currentPath.startsWith("/admin") || window.location.hash === "#/admin") {
    return <AdminPanel />;
  }

  // Show nice loader screen and exit early if loading or appData is not ready yet
  if (isLoadingSupabase || !appData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-orange-50/30 flex flex-col items-center justify-center p-4 font-sans antialiased selection:bg-brand-red/10 selection:text-brand-red">
        <div className="flex flex-col items-center max-w-sm w-full text-center space-y-6">
          
          {/* Central Plate Visual with Animations */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Spinning Golden Orbit */}
            <div className="absolute inset-0 border-2 border-dashed border-brand-yellow/60 rounded-full animate-[spin_10s_linear_infinite]"></div>
            
            {/* Pulsing Light Glow */}
            <div className="absolute inset-2 bg-brand-yellow/10 rounded-full blur-xl animate-pulse"></div>
            
            {/* Glowing Ring */}
            <div className="absolute inset-4 bg-gradient-to-tr from-brand-red to-amber-500 rounded-full opacity-10 animate-pulse"></div>
            
            {/* White Plate Container */}
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-xl border border-stone-100/50 transform transition hover:scale-105 active:scale-95 duration-300">
              <div className="flex flex-col items-center justify-center relative">
                <ChefHat className="w-10 h-10 text-brand-red animate-[bounce_2s_infinite]" />
                <UtensilsCrossed className="w-5 h-5 text-brand-yellow absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-md border border-stone-100" />
              </div>
            </div>
          </div>

          {/* Typography & Copy */}
          <div className="space-y-2">
            <h1 className="text-lg font-black text-stone-900 tracking-wider uppercase font-serif">Divinos Paulista</h1>
            <div className="h-0.5 w-12 bg-gradient-to-r from-brand-yellow to-brand-red mx-auto rounded-full"></div>
            
            <p className="text-sm font-extrabold text-stone-850 tracking-tight flex items-center justify-center gap-1.5 mt-3 animate-pulse">
              <Sparkles className="w-4 h-4 text-brand-yellow animate-spin" /> 
              Carregando cardápio...
            </p>
            <p className="text-xs text-stone-500 font-medium leading-relaxed max-w-[280px] mx-auto">
              Buscando ingredientes frescos e preparando as melhores delícias para o seu dia!
            </p>
          </div>

          {/* Steaming Bubbles loading effect */}
          <div className="flex gap-2 justify-center items-center mt-2 bg-stone-200/40 px-4 py-2 rounded-full border border-stone-200/25">
            <span className="w-2.5 h-2.5 bg-brand-red rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2.5 h-2.5 bg-brand-yellow rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2.5 h-2.5 bg-stone-400 rounded-full animate-bounce"></span>
          </div>

        </div>
      </div>
    );
  }

  // Intercept Redirection Page Route
  if (currentPath === "/redirecionamento" || window.location.hash === "#/redirecionamento") {
    return (
      <RedirectionPage 
        logo={appData?.restaurant?.logo} 
        companyName={appData?.restaurant?.companyName} 
      />
    );
  }

  const toastTimeoutRef = useRef<any>(null);
  const triggerAddedToast = (productName: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setAddedNotification(productName);
    toastTimeoutRef.current = setTimeout(() => {
      setAddedNotification(null);
    }, 5000);
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    // Opening the details modal instead of directly adding
    setSelectedProductForModal(product);
    setIsProductModalOpen(true);
  };

  const handleAddToCartDirectly = (product: Product) => {
    safeTrack("AddToCart", {
      content_name: product.name,
      content_ids: [product.id],
      content_type: "product",
      value: product.price,
      currency: "BRL"
    });

    setCartItems((prevItems) => {
      const compositeId = product.id; // direct adds have empty observations by default
      const existing = prevItems.find((item) => item.id === compositeId);
      if (existing) {
        return prevItems.map((item) =>
          item.id === compositeId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { id: compositeId, product, quantity: 1, observation: "" }];
    });

    triggerAddedToast(product.name);
  };

  const handleAddToCartWithDetails = (product: Product, quantity: number, observation: string) => {
    safeTrack("AddToCart", {
      content_name: product.name,
      content_ids: [product.id],
      content_type: "product",
      value: Number((product.price * quantity).toFixed(2)),
      currency: "BRL"
    });

    const obsText = observation.trim();
    const compositeId = product.id + (obsText ? `-${obsText.toLowerCase()}` : "");

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === compositeId);
      if (existing) {
        return prevItems.map((item) =>
          item.id === compositeId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevItems, { id: compositeId, product, quantity, observation: obsText }];
    });

    triggerAddedToast(product.name);
  };

  const handleCartAddAndIncrement = (product: Product, quantity: number = 1, observation?: string) => {
    // High-level utility for cart drawer buttons to safely increment/decrement config items
    const obsText = observation?.trim() || "";
    const compositeId = product.id + (obsText ? `-${obsText.toLowerCase()}` : "");

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === compositeId);
      if (existing) {
        return prevItems.map((item) =>
          item.id === compositeId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevItems, { id: compositeId, product, quantity, observation: obsText }];
    });

    triggerAddedToast(product.name);
  };

  const handleRemoveOneFromCart = (cartItemId: string) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === cartItemId);
      if (existing) {
        if (existing.quantity === 1) {
          return prevItems.filter((item) => item.id !== cartItemId);
        }
        return prevItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prevItems;
    });
  };

  const handleRemoveAllFromCart = (cartItemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== cartItemId));
  };

  // Safe scroll action to Catalog
  const handleScrollToMenu = () => {
    if (menuCatalogRef.current) {
      menuCatalogRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Dynamic products filtering from our custom editable database
  const filteredProducts = appData.products.filter((product) => {
    // 1. Skip deactivated products
    if (product.isActive === false) return false;

    // 2. Skip products of deactivated categories
    const parentCategory = appData.categories.find(c => c.name === product.category);
    if (parentCategory && parentCategory.isActive === false) return false;

    // 3. Matches active category filter button
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    
    // 4. Matches live text search query
    const matchesSearch = product.name.toLowerCase().includes(typedQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(typedQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    // Sort based on category order
    const catIndexA = appData.categories.findIndex(c => c.name === a.category);
    const catIndexB = appData.categories.findIndex(c => c.name === b.category);
    
    const valA = catIndexA === -1 ? 9999 : catIndexA;
    const valB = catIndexB === -1 ? 9999 : catIndexB;
    
    if (valA !== valB) {
      return valA - valB;
    }
    return a.name.localeCompare(b.name, "pt-BR");
  });

  // Highlighted main daily meal
  const pratoDoDiaProduct: Product = {
    id: "prato-do-dia",
    name: appData.pratoDoDia.name,
    description: appData.pratoDoDia.description,
    price: appData.pratoDoDia.price,
    category: "Prato do Dia",
    image: appData.pratoDoDia.image
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  
  // A helper to determine if a product counts as a main dish/plate for free delivery promo
  const isPlateForPromo = (categoryName: string) => {
    const cat = (categoryName || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (cat.includes("bebida") || cat.includes("suco") || cat.includes("sobremesa")) {
      return false;
    }
    return true;
  };

  const platesCount = cartItems.reduce((acc, item) => {
    if (isPlateForPromo(item.product.category)) {
      return acc + item.quantity;
    }
    return acc;
  }, 0);

  const isDeliveryFree = platesCount >= 2;
  const deliveryCost = appData.restaurant.deliveryFee;
  const actualDeliveryCost = isDeliveryFree ? 0 : deliveryCost;
  const cartTotal = cartSubtotal + actualDeliveryCost;

  // Formatting utility
  const formatPriceBrl = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  // Brazilian Phone parser for nice aesthetic formatting
  const formatPhoneNumber = (value: string) => {
    const raw = value.replace(/\D/g, "");
    if (raw.length <= 11) {
      return raw.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    }
    return value;
  };

  // Submit and form validations
  const handleSubmitOrder = () => {
    if (cartItems.length === 0) {
      window.location.hash = "#/carrinho";
      setAlertMessage("Adicione pelo menos um item ao pedido.");
      return;
    }

    const scrollToAndFocus = (id: string, message: string) => {
      setAlertMessage(message);
      setTimeout(() => {
        const input = document.getElementById(id) as HTMLInputElement | null;
        if (input) {
          input.focus();
          input.scrollIntoView({ behavior: "smooth", block: "center" });
          
          // Flash error aesthetic feedback
          input.classList.add("!border-brand-red", "ring-2", "ring-red-100", "bg-red-50/10");
          setTimeout(() => {
            input.classList.remove("!border-brand-red", "ring-2", "ring-red-100", "bg-red-50/10");
          }, 3500);
        }
      }, 350);
    };

    if (!customer.name.trim()) {
      scrollToAndFocus("customer-name", "⚠️ Por favor, informe seu Nome Completo para prosseguir.");
      return;
    }
    if (!customer.phone.trim()) {
      scrollToAndFocus("customer-phone", "⚠️ Por favor, informe seu Telefone / WhatsApp de contato.");
      return;
    }
    if (!address.cep.trim() || address.cep.replace(/\D/g, "").length !== 8) {
      scrollToAndFocus("delivery-cep", "⚠️ Por favor, informe um CEP válido com 8 dígitos.");
      return;
    }
    if (!address.street.trim()) {
      scrollToAndFocus("delivery-street", "⚠️ Por favor, informe a Rua / Logradouro para entrega.");
      return;
    }
    if (!address.number.trim()) {
      scrollToAndFocus("delivery-number", "⚠️ Informe o número do endereço.");
      return;
    }
    if (!address.neighborhood.trim()) {
      scrollToAndFocus("delivery-neighborhood", "⚠️ Por favor, informe o Bairro de destino.");
      return;
    }
    if (!address.city.trim()) {
      scrollToAndFocus("delivery-city", "⚠️ Por favor, informe a Cidade para entrega.");
      return;
    }
    if (!address.state.trim()) {
      scrollToAndFocus("delivery-state", "⚠️ Por favor, informe a UF do Estado.");
      return;
    }

    // Build the WhatsApp message template EXACTLY as described in Brazilian formatting guidelines
    let messageText = `NOVO PEDIDO - ${appData.restaurant.companyName.toUpperCase()}\n\n`;
    
    messageText += `Cliente:\n`;
    messageText += `Nome: ${customer.name.trim()}\n`;
    messageText += `Telefone: ${customer.phone.trim()}\n\n`;

    messageText += `Endereço:\n`;
    messageText += `CEP: ${address.cep.trim()}\n`;
    messageText += `Rua: ${address.street.trim()}\n`;
    messageText += `Número: ${address.number.trim()}\n`;
    if (address.complement.trim()) {
      messageText += `Complemento: ${address.complement.trim()}\n`;
    }
    messageText += `Bairro: ${address.neighborhood.trim()}\n`;
    messageText += `Cidade: ${address.city.trim()}\n`;
    messageText += `Estado: ${address.state.trim()}\n`;
    if (address.reference.trim()) {
      messageText += `Referência: ${address.reference.trim()}\n`;
    }
    messageText += `\n`;

    messageText += `Pedido:\n`;
    messageText += `Itens:\n`;
    cartItems.forEach((item) => {
      const itemPriceStr = item.product.price.toFixed(2).replace(".", ",");
      messageText += `${item.quantity}x ${item.product.name} - R$ ${itemPriceStr}\n`;
      if (item.observation?.trim()) {
        messageText += `Obs: ${item.observation.trim()}\n`;
      }
      messageText += `\n`;
    });
    messageText += `Subtotal: ${formatPriceBrl(cartSubtotal)}\n`;
    if (isDeliveryFree) {
      messageText += `Taxa de entrega: GRÁTIS (Promoção 2+ Pratos!)\n`;
    } else {
      messageText += `Taxa de entrega: ${formatPriceBrl(actualDeliveryCost)}\n`;
    }
    messageText += `Total: ${formatPriceBrl(cartTotal)}\n\n`;

    messageText += `Pagamento:\n`;
    messageText += `Pix\n`;

    const compiledUrl = `https://wa.me/${appData.restaurant.whatsapp}?text=${encodeURIComponent(messageText)}`;
    
    // Generate an order ID for deduplication and matching
    const orderId = "order_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

    // Save full order details to sessionStorage so RedirectionPage can trigger Lead and Purchase safely and with no duplication
    const orderDetails = {
      orderId,
      cartTotal: Number(cartTotal.toFixed(2)),
      totalItems: totalItemsCount,
      cartItems: cartItems.map(item => ({
        id: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      })),
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        city: address.city.trim()
      }
    };
    sessionStorage.setItem("last_order_details", JSON.stringify(orderDetails));

    // Save pending WhatsApp redirect URL to sessionStorage
    sessionStorage.setItem("pending_whatsapp_url", compiledUrl);

    // Save cart items in backup before clearing (for smooth mobile back-button recovery)
    try {
      sessionStorage.setItem("backup_cart_items", JSON.stringify(cartItems));
    } catch (e) {}

    // Clear existing cart items state because order is successfully processed
    setCartItems([]);

    // Update Client Router state and browser address bar dynamically
    history.pushState(null, "", "/redirecionamento");
    setCurrentPath("/redirecionamento");
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 select-none flex flex-col font-sans pb-24 md:pb-8">
      
      {/* 2. Top Info Bar (🚚 Delivery disponível, ⏱️ Entrega em até 30 minutos, 📲 Monte seu pedido online) */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-stone-900 to-[#8b0000] text-brand-yellow font-extrabold text-[11px] sm:text-xs py-2.5 px-4 shadow-md border-b-2 border-brand-yellow/10">
        <div className="max-w-5xl mx-auto flex items-center justify-around gap-2 flex-wrap text-center">
          <span className="flex items-center gap-1">🚚 Delivery disponível</span>
          <span className="h-3 w-px bg-brand-yellow/30 hidden xs:inline" />
          <span className="flex items-center gap-1">⏱️ Entrega em até 30 minutos</span>
          <span className="h-3 w-px bg-brand-yellow/30 hidden md:inline" />
          <span className="flex items-center gap-1">📲 Monte seu pedido online</span>
        </div>
      </div>

      {/* 7. Added Product Toast Notification */}
      {addedNotification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-slide-down">
          <div className="bg-stone-900 border border-brand-yellow/30 text-white rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-emerald-500 text-lg shrink-0">✅</span>
              <div className="min-w-0">
                <p className="text-xs font-black text-white uppercase tracking-wider">Adicionado com sucesso!</p>
                <p className="text-stone-300 font-bold text-xs truncate leading-tight mt-0.5">{addedNotification}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setAddedNotification(null);
                window.location.hash = "#/carrinho";
              }}
              className="bg-brand-red hover:bg-[#a61515] active:scale-95 text-white text-[10px] font-black uppercase tracking-wider py-2.5 px-3 rounded-xl transition shrink-0 cursor-pointer shadow-md"
            >
              Ver meu pedido
            </button>
          </div>
        </div>
      )}

      {/* Visual Header Banner */}
      <Header onScrollToMenu={handleScrollToMenu} restaurant={appData.restaurant} />

      {/* PROMOTIONAL PILL / ALERT */}
      <div className="max-w-5xl mx-auto w-full px-4 mt-6">
        <div className="bg-gradient-to-r from-stone-50 to-amber-50/50 border border-brand-yellow/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-brand-red text-white p-2.5 rounded-xl shadow-md shrink-0">
              <Truck className="w-5 h-5 text-brand-yellow" />
            </div>
            <div>
              <h4 className="text-sm font-black text-stone-900 tracking-tight flex items-center gap-1.5">
                🎉 PROMOÇÃO: Entrega Grátis!
              </h4>
              <p className="text-xs text-stone-605 font-medium mt-0.5">
                Na compra de <span className="text-brand-red font-bold">2 ou mais pratos</span> a entrega é grátis! <span className="text-[10px] text-stone-500 block sm:inline sm:ml-1">(Não conta sobremesa nem bebida)</span>
              </p>
            </div>
          </div>
          
          <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto justify-end">
            {platesCount === 0 ? (
              <span className="text-[10px] font-extrabold bg-stone-100 text-stone-500 border border-stone-200 px-3 py-1.5 rounded-xl uppercase tracking-wider block text-center w-full sm:w-auto">
                Nenhum prato no carrinho
              </span>
            ) : platesCount < 2 ? (
              <span className="text-[10px] font-extrabold bg-amber-500/10 text-amber-800 border border-amber-300/40 px-3 py-1.5 rounded-xl uppercase tracking-wider block text-center w-full sm:w-auto animate-pulse">
                Falta {2 - platesCount} {2 - platesCount === 1 ? 'prato' : 'pratos'} para Frete Grátis!
              </span>
            ) : (
              <span className="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-800 border border-emerald-300/40 px-3 py-1.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-1 w-full sm:w-auto">
                ⭐ FRETE GRÁTIS ATIVADO!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Featured Dish: Prato do Dia (Only if activated by admin) */}
      {appData.pratoDoDia.isActive && (
        <PratoDoDia 
          product={pratoDoDiaProduct} 
          onAdd={handleAddToCart}
          cartQuantity={cartItems.filter((item) => item.product.id === pratoDoDiaProduct.id).reduce((acc, item) => acc + item.quantity, 0)}
        />
      )}

      {/* 1. 🔥 Mais pedidos do Divinos Section */}
      <div ref={maisPedidosRef} className="scroll-mt-16">
        <MaisPedidosSection 
          products={maisPedidosList}
          cartItems={cartItems}
          onAdd={handleAddToCart}
        />
      </div>

      {/* Menu Catalog Anchor Section */}
      <div ref={menuCatalogRef} className="scroll-mt-6 max-w-5xl mx-auto w-full px-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 gap-4 border-b border-stone-200/80">
          <div>
            <span className="text-[10px] uppercase font-bold text-brand-red tracking-widest font-display">
              Cardápio {appData.restaurant.companyName}
            </span>
            <h2 className="font-serif text-2xl font-black text-stone-900 tracking-tight flex items-center gap-1.5 mt-0.5">
              Escolha seu almoço
              <Sparkles className="w-4 h-4 text-brand-yellow fill-current" />
            </h2>
          </div>

          {/* Sizable text search */}
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              value={typedQuery}
              onChange={(e) => setTypedQuery(e.target.value)}
              placeholder="Buscar no cardápio..."
              className="w-full bg-white border border-stone-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-stone-900 focus:outline-none focus:border-brand-red shadow-sm"
            />
            <Search className="absolute left-3 top-3.5 text-stone-400 w-3.5 h-3.5" />
            {typedQuery && (
              <button 
                onClick={() => setTypedQuery("")} 
                className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-900 text-xs"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Horizontal Filters */}
      <CategoryFilters 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
        categories={appData.categories}
      />


      {/* Main Grid Catalog List */}
      <main className="max-w-5xl mx-auto w-full px-4 py-6 flex-1">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-100 shadow-sm max-w-md mx-auto p-8">
            <h3 className="font-serif text-lg font-bold text-stone-900 mb-1">Nenhum prato encontrado</h3>
            <p className="text-stone-500 text-xs mb-4">Não encontramos itens correspondendo aos seus filtros ou termo de busca.</p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setTypedQuery("");
              }}
              className="bg-brand-red text-white py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Resetar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const qtyInCart = cartItems.filter((item) => item.product.id === product.id).reduce((acc, item) => acc + item.quantity, 0);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantityInCart={qtyInCart}
                  onAdd={handleAddToCart}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-stone-900 text-stone-400 py-10 mt-12 border-t border-stone-800">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-white">
            <span className="font-serif font-bold text-lg text-brand-yellow">{appData.restaurant.companyName}</span>
            <span className="text-stone-600">|</span>
            <span className="text-xs tracking-wider uppercase">Sabor de Casa</span>
          </div>
          <p className="text-xs max-w-md mx-auto leading-relaxed">
            Cardápio exclusivamente voltado a almoços executivos, comerciais e pratos típicos brasileiros de alta excelência de segunda a domingo.
          </p>
          <div className="text-[10px] text-stone-600">
            &copy; {new Date().getFullYear()} {appData.restaurant.companyName} Almoço Brasileiro. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      {/* MOBILE STICKY BOTTOM ACTION BAR */}
      {totalItemsCount > 0 ? (
        <div 
          onClick={() => window.location.hash = "#/carrinho"}
          className="fixed bottom-0 left-0 right-0 p-3.5 bg-stone-900 border-t border-brand-yellow/20 shadow-2xl z-40 md:hidden flex items-center justify-between font-sans cursor-pointer animate-slide-up"
        >
          <div className="flex items-center gap-3">
            <div className="relative bg-brand-red text-white p-2.5 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-brand-yellow" />
              <span className="absolute -top-1.5 -right-1.5 bg-brand-yellow text-stone-950 font-black text-[9px] px-1.5 py-0.5 rounded-full leading-none">
                {totalItemsCount}
              </span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">🛒 Meu pedido</span>
              <span className="text-sm font-sans font-black text-brand-yellow">{formatPriceBrl(cartSubtotal)}</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              window.location.hash = "#/carrinho";
            }}
            className="bg-brand-red hover:bg-[#a61515] text-white font-extrabold py-2.5 px-4.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
          >
            Ver Carrinho
          </button>
        </div>
      ) : (
        /* 3. MOBILE FIXED BUTTON: Fazer Pedido Agora (When cart has 0 items) */
        <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden animate-slide-up">
          <button
            onClick={() => {
              if (maisPedidosRef.current) {
                maisPedidosRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            className="w-full bg-brand-red hover:bg-[#a51515] active:scale-95 text-white font-black py-4 px-6 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl cursor-pointer"
          >
            🍽️ Fazer Pedido Agora
          </button>
        </div>
      )}

      {/* DESKTOP FLOAT BUTTON TO OPEN CART */}
      <button
        onClick={() => window.location.hash = "#/carrinho"}
        className="hidden md:flex fixed right-6 bottom-6 bg-brand-red hover:bg-brand-red-dark text-white p-4 rounded-full shadow-2xl transition duration-150 items-center justify-center gap-2 hover:scale-105 active:scale-95 z-40 cursor-pointer group"
      >
        <div className="relative">
          <ShoppingBag className="w-6 h-6 text-brand-yellow" />
          {totalItemsCount > 0 && (
            <span className="absolute -top-3.5 -right-3.5 bg-brand-yellow text-stone-950 font-sans font-black text-[10px] leading-none px-1.5 py-1 rounded-full border border-brand-red shadow-sm animate-pulse">
              {totalItemsCount}
            </span>
          )}
        </div>
        <span className="font-sans font-bold text-xs uppercase tracking-widest max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-300">
          Ver Carrinho
        </span>
      </button>

      {/* FULL SLIDE DRAWER COMPONENT */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => window.location.hash = ""}
        cartItems={cartItems}
        onAdd={handleCartAddAndIncrement}
        onRemoveOne={handleRemoveOneFromCart}
        onRemoveAll={handleRemoveAllFromCart}
        customer={customer}
        onUpdateCustomer={setCustomer}
        address={address}
        onUpdateAddress={setAddress}
        observation={observation}
        onUpdateObservation={setObservation}
        onSubmitOrder={handleSubmitOrder}
        deliveryFee={actualDeliveryCost}
        allProducts={appData?.products || []}
      />

      {/* DETAIL MODAL WITH MULTIPLE QUANTITIES & OBSERVATION OPTIONS */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProductForModal}
        onAdd={handleAddToCartWithDetails}
        allProducts={appData?.products || []}
        onAddBebidaDirectly={handleAddToCartDirectly}
      />

      {/* CUSTOM LUX ALERT MODAL */}
      {alertMessage && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-stone-100 shadow-2xl transform scale-100 transition animate-spacey">
            <div className="flex items-center gap-3 text-brand-red mb-4">
              <AlertTriangle className="w-8 h-8 shrink-0 text-brand-yellow fill-current" />
              <h4 id="alert-title" className="font-serif text-lg font-black text-stone-950">Aviso do Pedido</h4>
            </div>
            <p className="font-sans text-stone-700 text-sm mb-6 leading-relaxed">
              {alertMessage}
            </p>
            <button
              onClick={() => setAlertMessage(null)}
              className="w-full bg-brand-slate hover:bg-stone-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition active:scale-95"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
