/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
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
  UtensilsCrossed
} from "lucide-react";
import { Header } from "./components/Header";
import { PratoDoDia } from "./components/PratoDoDia";
import { CategoryFilters } from "./components/CategoryFilters";
import { ProductCard } from "./components/ProductCard";
import { CartDrawer } from "./components/CartDrawer";
import { AdminPanel } from "./components/AdminPanel";
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
    };
    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  // Intercept Admin Route
  if (currentPath === "/admin" || currentPath.startsWith("/admin") || window.location.hash === "#/admin") {
    return <AdminPanel />;
  }

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

  // Cart calculation state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

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

  // Cart operations
  const handleAddToCart = (product: Product) => {
    // Safely trigger Meta Pixel AddToCart event with structured meta details
    safeTrack("AddToCart", {
      content_name: product.name,
      content_category: product.category,
      value: product.price,
      currency: "BRL",
      content_ids: [product.id],
      content_type: "product"
    });

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.product.id === product.id);
      if (existing) {
        return prevItems.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { product, quantity: 1 }];
    });
  };

  const handleRemoveOneFromCart = (productId: string) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.product.id === productId);
      if (existing) {
        if (existing.quantity === 1) {
          return prevItems.filter((item) => item.product.id !== productId);
        }
        return prevItems.map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prevItems;
    });
  };

  const handleRemoveAllFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
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
  const deliveryCost = appData.restaurant.deliveryFee;
  const cartTotal = cartSubtotal + deliveryCost;

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
      setAlertMessage("Adicione pelo menos um item ao pedido.");
      return;
    }
    if (!customer.name.trim()) {
      setAlertMessage("Preencha seu nome para continuar.");
      return;
    }
    if (!customer.phone.trim()) {
      setAlertMessage("Preencha seu telefone para continuar.");
      return;
    }
    if (
      !address.cep.trim() ||
      !address.street.trim() ||
      !address.number.trim() ||
      !address.neighborhood.trim() ||
      !address.city.trim() ||
      !address.state.trim()
    ) {
      setAlertMessage("Preencha o endereço de entrega para continuar.");
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
      const itemSub = item.product.price * item.quantity;
      messageText += `- ${item.quantity}x ${item.product.name} - R$ ${item.product.price.toFixed(2).replace(".", ",")} (Unit) / Total: R$ ${itemSub.toFixed(2).replace(".", ",")}\n`;
    });
    messageText += `\n`;
    messageText += `Subtotal: ${formatPriceBrl(cartSubtotal)}\n`;
    messageText += `Taxa de entrega: ${formatPriceBrl(deliveryCost)}\n`;
    messageText += `Total: ${formatPriceBrl(cartTotal)}\n\n`;

    messageText += `Pagamento:\n`;
    messageText += `Pix\n\n`;

    if (observation.trim()) {
      messageText += `Observação: ${observation.trim()}\n`;
    } else {
      messageText += `Observação: Nenhuma\n`;
    }

    const compiledUrl = `https://wa.me/${appData.restaurant.whatsapp}?text=${encodeURIComponent(messageText)}`;
    
    // Trigger Meta Pixel Lead event for the finalized order going to WhatsApp
    safeTrack("Lead", {
      value: cartTotal,
      currency: "BRL",
      content_name: `Pedido de ${customer.name.trim()}`,
      num_items: totalItemsCount
    });

    // Open WhatsApp in a safe manner
    window.open(compiledUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 select-none flex flex-col font-sans pb-24 md:pb-8">
      
      {/* Visual Header Banner */}
      <Header onScrollToMenu={handleScrollToMenu} restaurant={appData.restaurant} />

      {/* Featured Dish: Prato do Dia (Only if activated by admin) */}
      {appData.pratoDoDia.isActive && (
        <PratoDoDia 
          product={pratoDoDiaProduct} 
          onAdd={handleAddToCart}
          cartQuantity={cartItems.find((item) => item.product.id === pratoDoDiaProduct.id)?.quantity || 0}
        />
      )}

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
              const qtyInCart = cartItems.find((item) => item.product.id === product.id)?.quantity || 0;
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantityInCart={qtyInCart}
                  onAdd={handleAddToCart}
                  onRemoveOne={handleRemoveOneFromCart}
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
      {totalItemsCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-stone-200 shadow-lg z-40 md:hidden flex items-center justify-between font-sans">
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-bold text-stone-400">Seu Pedido ({totalItemsCount})</span>
            <span className="text-base font-sans font-black text-brand-red">{formatPriceBrl(cartSubtotal)}</span>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transform active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            Ver Carrinho
          </button>
        </div>
      )}

      {/* DESKTOP FLOAT BUTTON TO OPEN CART */}
      <button
        onClick={() => setIsCartOpen(true)}
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
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onAdd={handleAddToCart}
        onRemoveOne={handleRemoveOneFromCart}
        onRemoveAll={handleRemoveAllFromCart}
        customer={customer}
        onUpdateCustomer={setCustomer}
        address={address}
        onUpdateAddress={setAddress}
        observation={observation}
        onUpdateObservation={setObservation}
        onSubmitOrder={handleSubmitOrder}
        deliveryFee={deliveryCost}
        allProducts={appData?.products || []}
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
