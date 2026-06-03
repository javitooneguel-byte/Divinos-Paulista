import React, { useState, useEffect } from "react";
import { 
  Building, 
  UtensilsCrossed, 
  Tags, 
  ShoppingBag, 
  Truck, 
  Save, 
  RotateCcw, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Check, 
  X,
  Eye,
  EyeOff,
  Star,
  ChefHat,
  Sparkles,
  Lock,
  AlertTriangle
} from "lucide-react";
import { AppDataStore, Product, CategoryConfig, PratoDoDiaConfig, RestaurantConfig } from "../types";
import { loadAppData, saveAppData, resetAppDataToDefault } from "../lib/db";
import { 
  supabase,
  loginWithPasswordOnly, 
  getCurrentSession, 
  logout, 
  uploadImage, 
  loadSupabaseSettings, 
  saveSupabaseSettings, 
  loadSupabaseCategories, 
  loadSupabaseProducts, 
  insertSupabaseCategory, 
  updateSupabaseCategory, 
  deleteSupabaseCategory, 
  insertSupabaseProduct, 
  updateSupabaseProduct, 
  deleteSupabaseProduct 
} from "../lib/supabase";

const mapSettingsFromDb = (dbRow: any): RestaurantConfig => {
  return {
    companyName: dbRow.company_name || dbRow.companyName || "Divinos Paulista",
    logo: dbRow.logo || "",
    banner: dbRow.banner || "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=1200&auto=format&fit=crop",
    whatsapp: dbRow.whatsapp || "5511995946993",
    workingHours: dbRow.working_hours || dbRow.workingHours || "Aberto das 10:30h até 00h",
    deliveryFee: parseFloat(dbRow.delivery_fee !== undefined ? dbRow.delivery_fee : (dbRow.deliveryFee !== undefined ? dbRow.deliveryFee : 9.0)),
    estimatedTime: dbRow.estimated_time || dbRow.estimatedTime || "30-45 min",
    mainTitle: dbRow.main_title || dbRow.mainTitle || "Almoço brasileiro todos os dias",
    subTitle: dbRow.sub_title || dbRow.subTitle || "Almoço Paulista Tradicional"
  };
};

const mapPratoDoDiaFromDb = (dbRow: any): PratoDoDiaConfig => {
  return {
    name: dbRow.prato_do_dia_name || dbRow.pratoDoDiaName || "Prato do Dia",
    description: dbRow.prato_do_dia_description || dbRow.pratoDoDiaDescription || "Almoço completo do dia com arroz branco, feijão caseiro, carne do dia, acompanhamento especial e salada simples.",
    price: parseFloat(dbRow.prato_do_dia_price !== undefined ? dbRow.prato_do_dia_price : (dbRow.pratoDoDiaPrice !== undefined ? dbRow.pratoDoDiaPrice : 24.90)),
    image: dbRow.prato_do_dia_image || dbRow.pratoDoDiaImage || "https://images.unsplash.com/photo-1625938146369-adc83368bda7?q=80&w=800&auto=format&fit=crop",
    isActive: dbRow.prato_do_dia_is_active !== undefined ? dbRow.prato_do_dia_is_active : (dbRow.pratoDoDiaIsActive !== undefined ? dbRow.pratoDoDiaIsActive : true)
  };
};

const mapCategoryFromDb = (dbRow: any): CategoryConfig => {
  return {
    id: dbRow.id,
    name: dbRow.name,
    isActive: dbRow.is_active !== undefined ? dbRow.is_active : (dbRow.isActive !== undefined ? dbRow.isActive : true)
  };
};

const mapProductFromDb = (dbRow: any): Product => {
  return {
    id: dbRow.id,
    name: dbRow.name,
    description: dbRow.description || "",
    price: parseFloat(dbRow.price || 0),
    category: dbRow.category || "",
    image: dbRow.image || "",
    isActive: dbRow.is_active !== undefined ? dbRow.is_active : (dbRow.isActive !== undefined ? dbRow.isActive : true),
    isFeatured: dbRow.is_featured !== undefined ? dbRow.is_featured : (dbRow.isFeatured !== undefined ? dbRow.isFeatured : false),
    selo: dbRow.selo || dbRow.badge || ""
  };
};

export function AdminPanel() {
  // Password session gate
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Load data store
  const [data, setData] = useState<AppDataStore>(() => loadAppData());
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  
  // Tab control
  const [activeTab, setActiveTab] = useState<"restaurant" | "pratoDoDia" | "categories" | "products" | "delivery">("restaurant");
  
  // Feedback alerts
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Detailed import error state
  const [importDetailedError, setImportDetailedError] = useState<{
    operation: string;
    message: string;
    code: string;
    tableName: string;
    payload: any;
  } | null>(null);

  // Categories editing state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");

  // Products state
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Custom Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  } | null>(null);

  const triggerConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText = "Excluir",
    cancelText = "Cancelar"
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(null);
      }
    });
  };
  
  // Product form inputs
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState(0);
  const [prodCategory, setProdCategory] = useState("");
  const [prodImage, setProdImage] = useState("");
  const [prodIsActive, setProdIsActive] = useState(true);
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodSelo, setProdSelo] = useState("");

  // Auto-clear toasts
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Check auth session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const session = await getCurrentSession();
        if (session) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        setIsCheckingSession(false);
      }
    }
    checkSession();
  }, []);

  // Reload everything from Supabase
  const reloadAllSupabaseData = async () => {
    try {
      setIsSyncing(true);
      const [settingsRow, categoriesRows, productsRows] = await Promise.all([
        loadSupabaseSettings(),
        loadSupabaseCategories(),
        loadSupabaseProducts()
      ]);
      
      const loadedData: AppDataStore = { ...data };
      
      if (settingsRow) {
        loadedData.restaurant = mapSettingsFromDb(settingsRow);
        loadedData.pratoDoDia = mapPratoDoDiaFromDb(settingsRow);
      }
      
      if (categoriesRows && categoriesRows.length > 0) {
        loadedData.categories = categoriesRows.map(mapCategoryFromDb);
      } else if (categoriesRows) {
        loadedData.categories = [];
      }
      
      if (productsRows && productsRows.length > 0) {
        loadedData.products = productsRows.map(mapProductFromDb);
      } else if (productsRows) {
        loadedData.products = [];
      }
      
      setData(loadedData);
      setHasFetched(true);
    } catch (err) {
      console.error("Error loading data from Supabase:", err);
      showToast("Erro ao carregar dados do Supabase", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync data from Supabase when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      reloadAllSupabaseData();
    }
  }, [isAuthenticated]);

  // Image Upload handler replacing Base64 Reader
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      try {
        setIsSyncing(true);
        showToast("Enviando foto para o Supabase...", "success");
        const publicUrl = await uploadImage(file);
        if (publicUrl) {
          callback(publicUrl);
          showToast("Foto enviada com sucesso!", "success");
        } else {
          showToast("Erro ao obter URL pública.", "error");
        }
      } catch (err) {
        console.error("Upload error:", err);
        showToast("Falha ao subir imagem para o Supabase.", "error");
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  // 1. Save all edited settings changes to Supabase
  const handleSaveChanges = async () => {
    try {
      setIsSyncing(true);
      const payload = {
        companyName: data.restaurant.companyName,
        logo: data.restaurant.logo,
        banner: data.restaurant.banner,
        whatsapp: data.restaurant.whatsapp,
        workingHours: data.restaurant.workingHours,
        deliveryFee: data.restaurant.deliveryFee,
        estimatedTime: data.restaurant.estimatedTime,
        mainTitle: data.restaurant.mainTitle,
        subTitle: data.restaurant.subTitle,
        
        pratoDoDiaName: data.pratoDoDia.name,
        pratoDoDiaDescription: data.pratoDoDia.description,
        pratoDoDiaPrice: data.pratoDoDia.price,
        pratoDoDiaImage: data.pratoDoDia.image,
        pratoDoDiaIsActive: data.pratoDoDia.isActive
      };
      
      await saveSupabaseSettings(payload);
      showToast("Configurações salvas no Supabase!", "success");
    } catch (error) {
      console.error("Save error:", error);
      showToast("Erro ao salvar configurações no Supabase.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  // 2. Restore defaults on Supabase
  const handleRestoreDefaults = () => {
    triggerConfirm(
      "Restaurar Padrões",
      "Deseja realmente restaurar os dados originais no Supabase? Todas as edições e produtos atuais serão perdidos permanentemente.",
      async () => {
        try {
          setIsSyncing(true);
          showToast("Restaurando fábrica...", "success");
          
          // Load default constants
          const { DEFAULT_APP_DATA } = await import("../defaultData");
          
          // Delete all products and categories
          const currentProds = await loadSupabaseProducts();
          for (const p of currentProds) {
            await deleteSupabaseProduct(p.id);
          }
          
          const currentCats = await loadSupabaseCategories();
          for (const c of currentCats) {
            await deleteSupabaseCategory(c.id);
          }
          
          // Insert default categories and track generated UUIDs
          const categoryMap: { [name: string]: string } = {};
          for (const cat of DEFAULT_APP_DATA.categories) {
            const inserted = await insertSupabaseCategory({
              name: cat.name,
              isActive: cat.isActive
            });
            if (inserted && inserted.id) {
              categoryMap[cat.name] = inserted.id;
            }
          }
          
          // Insert default products with mapped category UUIDs
          for (const prod of DEFAULT_APP_DATA.products) {
            const catId = categoryMap[prod.category] || null;
            await insertSupabaseProduct({
              name: prod.name,
              description: prod.description,
              price: prod.price,
              category: prod.category,
              category_id: catId,
              image: prod.image,
              isActive: prod.isActive !== false,
              isFeatured: prod.isFeatured === true,
              selo: prod.selo || ""
            });
          }
          
          // Save default settings
          await saveSupabaseSettings({
            companyName: DEFAULT_APP_DATA.restaurant.companyName,
            logo: DEFAULT_APP_DATA.restaurant.logo,
            banner: DEFAULT_APP_DATA.restaurant.banner,
            whatsapp: DEFAULT_APP_DATA.restaurant.whatsapp,
            workingHours: DEFAULT_APP_DATA.restaurant.workingHours,
            deliveryFee: DEFAULT_APP_DATA.restaurant.deliveryFee,
            estimatedTime: DEFAULT_APP_DATA.restaurant.estimatedTime,
            mainTitle: DEFAULT_APP_DATA.restaurant.mainTitle,
            subTitle: DEFAULT_APP_DATA.restaurant.subTitle,
            
            pratoDoDiaName: DEFAULT_APP_DATA.pratoDoDia.name,
            pratoDoDiaDescription: DEFAULT_APP_DATA.pratoDoDia.description,
            pratoDoDiaPrice: DEFAULT_APP_DATA.pratoDoDia.price,
            pratoDoDiaImage: DEFAULT_APP_DATA.pratoDoDia.image,
            pratoDoDiaIsActive: DEFAULT_APP_DATA.pratoDoDia.isActive
          });
          
          showToast("Tudo restaurado para o padrão de fábrica!", "success");
          await reloadAllSupabaseData();
          
          // Reset forms
          setIsProductFormOpen(false);
          setEditingProduct(null);
          setEditingCategoryId(null);
        } catch (err) {
          console.error(err);
          showToast("Erro ao restaurar configurações no Supabase.", "error");
        } finally {
          setIsSyncing(false);
        }
      },
      "Restaurar",
      "Cancelar"
    );
  };

  // Importar Cardápio Inicial handler
  const handleImportInitialData = async () => {
    setImportDetailedError(null);
    try {
      setIsSyncing(true);
      showToast("Importando cardápio inicial...", "success");
      
      const { DEFAULT_APP_DATA } = await import("../defaultData");
      
      // Clear before clean insert
      const curCats = await loadSupabaseCategories().catch(() => []);
      for (const c of curCats) {
        await deleteSupabaseCategory(c.id).catch(() => {});
      }
      
      const curProds = await loadSupabaseProducts().catch(() => []);
      for (const p of curProds) {
        await deleteSupabaseProduct(p.id).catch(() => {});
      }
      
      // Import categories and track returned UUIDs
      const categoryMap: { [name: string]: string } = {};
      let currentCategoryPayload: any = null;
      try {
        for (const cat of DEFAULT_APP_DATA.categories) {
          currentCategoryPayload = {
            name: cat.name,
            isActive: cat.isActive
          };
          const inserted = await insertSupabaseCategory(currentCategoryPayload);
          if (inserted && inserted.id) {
            categoryMap[cat.name] = inserted.id;
          }
        }
      } catch (err: any) {
        const errorDetails = {
          operation: "categories.insert",
          message: err?.message || err?.error_description || String(err),
          code: err?.code || err?.status || "N/A",
          tableName: "categories",
          payload: currentCategoryPayload
        };
        console.error("❌ [Import Error] Erro ao inserir categorias no Supabase:", errorDetails);
        setImportDetailedError(errorDetails);
        showToast("Erro ao importar categorias no Supabase.", "error");
        return;
      }
      
      // Import products with mapped category UUIDs
      let currentProductPayload: any = null;
      try {
        for (const prod of DEFAULT_APP_DATA.products) {
          const catId = categoryMap[prod.category] || null;
          currentProductPayload = {
            name: prod.name,
            description: prod.description,
            price: prod.price,
            category: prod.category,
            category_id: catId,
            image: prod.image,
            isActive: prod.isActive !== false,
            isFeatured: prod.isFeatured === true,
            selo: prod.selo || ""
          };
          await insertSupabaseProduct(currentProductPayload);
        }
      } catch (err: any) {
        const errorDetails = {
          operation: "products.insert",
          message: err?.message || err?.error_description || String(err),
          code: err?.code || err?.status || "N/A",
          tableName: "products",
          payload: currentProductPayload
        };
        console.error("❌ [Import Error] Erro ao inserir produtos no Supabase:", errorDetails);
        setImportDetailedError(errorDetails);
        showToast("Erro ao importar produtos no Supabase.", "error");
        return;
      }
      
      // Also save default settings
      let settingsPayload: any = null;
      try {
        settingsPayload = {
          companyName: DEFAULT_APP_DATA.restaurant.companyName,
          logo: DEFAULT_APP_DATA.restaurant.logo,
          banner: DEFAULT_APP_DATA.restaurant.banner,
          whatsapp: DEFAULT_APP_DATA.restaurant.whatsapp,
          workingHours: DEFAULT_APP_DATA.restaurant.workingHours,
          deliveryFee: DEFAULT_APP_DATA.restaurant.deliveryFee,
          estimatedTime: DEFAULT_APP_DATA.restaurant.estimatedTime,
          mainTitle: DEFAULT_APP_DATA.restaurant.mainTitle,
          subTitle: DEFAULT_APP_DATA.restaurant.subTitle,
          
          pratoDoDiaName: DEFAULT_APP_DATA.pratoDoDia.name,
          pratoDoDiaDescription: DEFAULT_APP_DATA.pratoDoDia.description,
          pratoDoDiaPrice: DEFAULT_APP_DATA.pratoDoDia.price,
          pratoDoDiaImage: DEFAULT_APP_DATA.pratoDoDia.image,
          pratoDoDiaIsActive: DEFAULT_APP_DATA.pratoDoDia.isActive
        };
        await saveSupabaseSettings(settingsPayload);
      } catch (err: any) {
        const errorDetails = {
          operation: "restaurant_settings.update",
          message: err?.message || err?.error_description || String(err),
          code: err?.code || err?.status || "N/A",
          tableName: "restaurant_settings",
          payload: settingsPayload
        };
        console.error("❌ [Import Error] Erro ao salvar configurações no Supabase:", errorDetails);
        setImportDetailedError(errorDetails);
        showToast("Erro ao atualizar configurações no Supabase.", "error");
        return;
      }
      
      showToast("Cardápio inicial importado com sucesso!", "success");
      await reloadAllSupabaseData();
    } catch (err: any) {
      console.error("❌ [Import Error] Erro inesperado na importação:", err);
      const errorDetails = {
        operation: "unknown",
        message: err?.message || err?.error_description || String(err),
        code: err?.code || err?.status || "N/A",
        tableName: "unknown",
        payload: null
      };
      setImportDetailedError(errorDetails);
      showToast("Erro no processo de importação do cardápio.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Category Handlers ---
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      showToast("Digite o nome da categoria.", "error");
      return;
    }
    const cleanName = newCategoryName.trim();
    // Check duplication
    if (data.categories.some(c => c.name.toLowerCase() === cleanName.toLowerCase())) {
      showToast("Esta categoria já existe.", "error");
      return;
    }

    try {
      setIsSyncing(true);
      const inserted = await insertSupabaseCategory({
        name: cleanName,
        isActive: true
      });
      
      const newCat: CategoryConfig = {
        id: (inserted && inserted.id) ? inserted.id : cleanName,
        name: cleanName,
        isActive: true
      };
      
      setData(prev => ({
        ...prev,
        categories: [...prev.categories, newCat]
      }));
      setNewCategoryName("");
      showToast("Categoria criada!", "success");
    } catch (err) {
      console.error(err);
      showToast("Erro ao criar categoria no Supabase.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStartEditCategory = (cat: CategoryConfig) => {
    setEditingCategoryId(cat.id);
    setEditingCategoryName(cat.name);
  };

  const handleSaveCategoryName = async (id: string) => {
    if (!editingCategoryName.trim()) {
      showToast("O nome não pode ser vazio.", "error");
      return;
    }
    
    const cat = data.categories.find(c => c.id === id);
    if (!cat) return;

    try {
      setIsSyncing(true);
      await updateSupabaseCategory(id, editingCategoryName.trim(), cat.isActive);
      
      setData(prev => {
        const updatedCategories = prev.categories.map(c => {
          if (c.id === id) {
            return { ...c, name: editingCategoryName.trim() };
          }
          return c;
        });
        
        // Update categories in corresponding products too
        const oldCategory = prev.categories.find(c => c.id === id)?.name;
        const updatedProducts = prev.products.map(p => {
          if (oldCategory && p.category === oldCategory) {
            const upd = { ...p, category: editingCategoryName.trim() };
            updateSupabaseProduct(p.id, upd).catch(console.error);
            return upd;
          }
          return p;
        });

        return {
          ...prev,
          categories: updatedCategories,
          products: updatedProducts
        };
      });

      setEditingCategoryId(null);
      showToast("Categoria renomeada com sucesso!", "success");
    } catch (err) {
      console.error(err);
      showToast("Erro ao renomear categoria no Supabase.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleCategoryActive = async (id: string) => {
    const cat = data.categories.find(c => c.id === id);
    if (!cat) return;

    try {
      setIsSyncing(true);
      await updateSupabaseCategory(id, cat.name, !cat.isActive);
      
      setData(prev => ({
        ...prev,
        categories: prev.categories.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c)
      }));
      showToast("Status da categoria alterado!", "success");
    } catch (err) {
      console.error(err);
      showToast("Erro ao alternar status no Supabase.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    triggerConfirm(
      "Excluir Categoria",
      `Tem certeza que deseja excluir permanentemente a categoria "${name}"? Os produtos cadastrados nela continuarão existindo e ficarão sem categoria vinculada.`,
      async () => {
        try {
          setIsSyncing(true);
          await deleteSupabaseCategory(id);
          
          setData(prev => ({
            ...prev,
            categories: prev.categories.filter(c => c.id !== id),
            // Move products of this category to empty category
            products: prev.products.map(p => {
              if (p.category === name) {
                const upd = { ...p, category: "" };
                updateSupabaseProduct(p.id, upd).catch(console.error);
                return upd;
              }
              return p;
            })
          }));
          showToast("Categoria excluída com sucesso.", "success");
        } catch (err) {
          console.error(err);
          showToast("Erro ao excluir categoria do Supabase.", "error");
        } finally {
          setIsSyncing(false);
        }
      },
      "Excluir",
      "Cancelar"
    );
  };

  // --- Product Handlers ---
  const handleOpenNewProductForm = () => {
    setEditingProduct(null);
    setProdName("");
    setProdDesc("");
    setProdPrice(0);
    setProdCategory(data.categories[0]?.name || "");
    setProdImage("");
    setProdIsActive(true);
    setProdIsFeatured(false);
    setProdSelo("");
    setIsProductFormOpen(true);
  };

  const handleOpenEditProductForm = (product: Product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdDesc(product.description);
    setProdPrice(product.price);
    setProdCategory(product.category);
    setProdImage(product.image || "");
    setProdIsActive(product.isActive !== false);
    setProdIsFeatured(product.isFeatured === true);
    setProdSelo(product.selo || "");
    setIsProductFormOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!prodName.trim()) {
      showToast("Nome do produto é obrigatório.", "error");
      return;
    }
    if (prodPrice <= 0) {
      showToast("Defina um preço válido para o prato.", "error");
      return;
    }

    try {
      setIsSyncing(true);
      
      const matchingCat = data.categories.find(c => c.name === prodCategory || c.id === prodCategory);
      const catId = matchingCat ? matchingCat.id : null;
      const catName = matchingCat ? matchingCat.name : prodCategory;

      if (editingProduct) {
        // Edit mode
        const updatedProd: Product & { category_id?: string | null } = {
          ...editingProduct,
          name: prodName.trim(),
          description: prodDesc.trim(),
          price: prodPrice,
          category: catName,
          category_id: catId,
          image: prodImage,
          isActive: prodIsActive,
          isFeatured: prodIsFeatured,
          selo: prodSelo.trim()
        };
        
        await updateSupabaseProduct(editingProduct.id, updatedProd);
        
        setData(prev => ({
          ...prev,
          products: prev.products.map(p => p.id === editingProduct.id ? updatedProd : p)
        }));
        showToast("Produto atualizado com sucesso!", "success");
      } else {
        // Create mode
        const newProd: Product & { category_id?: string | null } = {
          id: "prod-" + Date.now(),
          name: prodName.trim(),
          description: prodDesc.trim(),
          price: prodPrice,
          category: catName,
          category_id: catId,
          image: prodImage || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop",
          isActive: prodIsActive,
          isFeatured: prodIsFeatured,
          selo: prodSelo.trim()
        };
        
        await insertSupabaseProduct(newProd);
        
        setData(prev => ({
          ...prev,
          products: [newProd, ...prev.products]
        }));
        showToast("Novo produto registrado!", "success");
      }

      setIsProductFormOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
      showToast("Erro ao salvar produto no Supabase.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteProduct = (id: string, name: string) => {
    triggerConfirm(
      "Excluir Prato",
      `Deseja realmente excluir permanentemente o item "${name}" do cardápio? Esta ação não pode ser desfeita.`,
      async () => {
        try {
          setIsSyncing(true);
          await deleteSupabaseProduct(id);
          
          setData(prev => ({
            ...prev,
            products: prev.products.filter(p => p.id !== id)
          }));
          showToast("Produto excluído com sucesso do menu.", "success");
        } catch (err) {
          console.error(err);
          showToast("Erro ao excluir produto no Supabase.", "error");
        } finally {
          setIsSyncing(false);
        }
      },
      "Excluir",
      "Cancelar"
    );
  };

  const handleToggleProductActive = async (id: string) => {
    const prod = data.products.find(p => p.id === id);
    if (!prod) return;
    const newActiveState = prod.isActive === false ? true : false;
    
    try {
      setIsSyncing(true);
      const updatedProd = { ...prod, isActive: newActiveState };
      await updateSupabaseProduct(id, updatedProd);
      
      setData(prev => ({
        ...prev,
        products: prev.products.map(p => p.id === id ? updatedProd : p)
      }));
      showToast("Status atualizado com sucesso!", "success");
    } catch (err) {
      console.error(err);
      showToast("Erro ao atualizar status do produto.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSyncing(true);
      setAuthError("");
      // @ts-ignore
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || "javitooneguel@gmail.com";
      console.log("[Auth] Iniciando autenticação no Supabase...");
      console.log("[Auth] E-mail de destino da autenticação:", adminEmail);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: passwordInput
      });

      if (error) {
        console.error("[Auth] Erro retornado pela API do Supabase:", error);
        throw error;
      }

      console.log("[Auth] Autenticação bem-sucedida! Sessão iniciada para:", adminEmail, data);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error("[Auth] Falha no login do Administrador:", error);
      let errorMessage = error?.message || error?.error_description || "Senha incorreta ou erro de conexão.";
      
      if (errorMessage.includes("Forbidden use of secret API key in browser")) {
        errorMessage = "Chave Secreta Inválida no Navegador: Foi configurada a chave 'service_role' em vez da chave pública 'anon public key' do Supabase no campo VITE_SUPABASE_ANON_KEY das configurações do AI Studio. Substitua-a para corrigir.";
      }
      
      setAuthError(errorMessage);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 flex flex-col items-center justify-center p-4 font-sans select-none border-t-8 border-brand-yellow">
        <div className="flex flex-col items-center max-w-sm w-full text-center space-y-6">
          
          {/* Animated Safe Plate */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Rotating Golden dashed circle */}
            <div className="absolute inset-0 border border-dashed border-brand-yellow/40 rounded-full animate-[spin_12s_linear_infinite]"></div>
            
            {/* Glow backdrop */}
            <div className="absolute inset-3 bg-brand-yellow/5 rounded-full blur-xl animate-pulse"></div>
            
            {/* Locked Circle */}
            <div className="absolute inset-4 bg-stone-800 rounded-full flex items-center justify-center border border-stone-700 shadow-xl">
              <Lock className="w-8 h-8 text-brand-yellow animate-pulse" />
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-1.5">
            <h3 className="text-stone-200 text-sm font-extrabold uppercase tracking-widest">Painel Administrativo</h3>
            <p className="text-xs text-stone-500 font-medium">Verificando chaves de segurança da sua sessão...</p>
          </div>

          {/* Loading bar progress */}
          <div className="w-32 h-1 bg-stone-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-yellow animate-[loading_1.5s_infinite_ease-in-out] w-1/2 rounded-full"></div>
          </div>
          
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-900 border-t-8 border-brand-yellow flex items-center justify-center p-4 font-sans animate-fade-in">
        <div className="bg-white p-8 rounded-3xl max-w-sm w-full border border-stone-200 shadow-2xl text-center space-y-6">
          <div className="mx-auto bg-brand-red text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-md transform -rotate-3 border-2 border-brand-yellow">
            <span className="font-serif font-black text-xl text-brand-yellow">DP</span>
          </div>
          
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">Painel Operacional</h2>
            <p className="text-xs text-stone-500">Insira a senha de administrador para prosseguir</p>
          </div>

          <form onSubmit={handleVerifyPassword} className="space-y-4">
            <div className="space-y-1">
              <input
                type="password"
                id="admin-password-field"
                placeholder="Ex: ••••••"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (authError) setAuthError("");
                }}
                className="w-full bg-stone-50 text-center text-lg font-black tracking-widest border border-stone-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                autoFocus
              />
              {authError && (
                <p className="text-xs font-bold text-brand-red mt-1">{authError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-brand-red hover:bg-[#8b0000] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-md"
            >
              Entrar
            </button>
          </form>

          <div className="border-t border-stone-100 pt-4">
            <button
              onClick={() => {
                window.location.href = "/";
              }}
              className="text-xs font-bold text-stone-500 hover:text-stone-900 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar ao Cardápio Público
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasFetched) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-orange-50/30 flex flex-col items-center justify-center p-4 font-sans antialiased text-center">
        <div className="flex flex-col items-center max-w-sm w-full space-y-6">
          
          {/* Central Plate Visual with Animations */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Spinning Golden Orbit */}
            <div className="absolute inset-0 border-2 border-dashed border-brand-yellow/60 rounded-full animate-[spin_10s_linear_infinite]"></div>
            
            {/* Pulsing Light Glow */}
            <div className="absolute inset-2 bg-brand-yellow/10 rounded-full blur-xl animate-pulse"></div>
            
            {/* Glowing Ring */}
            <div className="absolute inset-4 bg-gradient-to-tr from-brand-red to-amber-500 rounded-full opacity-10 animate-pulse"></div>
            
            {/* White Plate Container */}
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-xl border border-stone-100/50 transform transition duration-300">
              <div className="flex flex-col items-center justify-center relative">
                <ChefHat className="w-10 h-10 text-brand-red animate-[bounce_2s_infinite]" />
                <UtensilsCrossed className="w-5 h-5 text-brand-yellow absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-md border border-stone-100" />
              </div>
            </div>
          </div>

          {/* Typography & Copy */}
          <div className="space-y-2">
            <h1 className="text-lg font-black text-stone-900 tracking-wider uppercase font-serif">Painel Administrativo</h1>
            <div className="h-0.5 w-12 bg-gradient-to-r from-brand-yellow to-brand-red mx-auto rounded-full"></div>
            
            <p className="text-xs font-extrabold text-stone-800 tracking-tight flex items-center justify-center gap-1.5 mt-3 animate-pulse">
              <Sparkles className="w-4 h-4 text-brand-yellow animate-spin" /> 
              Carregando dados...
            </p>
            <p className="text-xs text-stone-500 font-medium leading-relaxed max-w-[280px] mx-auto">
              Organizando e buscando as configurações gerais, categorias e cardápio de hoje. Just a moment!
            </p>
          </div>

          {/* Cooking Bubbles */}
          <div className="flex gap-2 justify-center items-center mt-2 bg-stone-200/40 px-4 py-2 rounded-full border border-stone-200/25">
            <span className="w-2.5 h-2.5 bg-brand-red rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2.5 h-2.5 bg-brand-yellow rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2.5 h-2.5 bg-stone-400 rounded-full animate-bounce"></span>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans">
      
      {/* Toast Alert Banner */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-2.5 max-w-sm animate-spacey ${
          toast.type === "success" 
            ? "bg-stone-900 border-l-4 border-emerald-500 text-white" 
            : "bg-red-950 border-l-4 border-red-500 text-white"
        }`}>
          <div className="flex-1 text-sm font-semibold">{toast.message}</div>
          <button onClick={() => setToast(null)} className="text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Top Header Navigation */}
      <header className="bg-stone-900 text-white py-4 px-6 shadow-md border-b-4 border-brand-yellow sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-brand-yellow w-10 h-10 rounded-xl flex items-center justify-center font-black text-stone-900 shadow">
              AD
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight m-0 flex items-center gap-2">
                Painel Administrativo 
                <span className="text-[10px] bg-brand-red text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold shadow-sm">
                  Divinos Paulista
                </span>
              </h1>
              <p className="text-xs text-stone-400 font-sans tracking-tight">Gerenciamento completo em tempo real</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                window.location.href = "/";
              }}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border border-stone-700/60"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Sair / Voltar ao Site
            </button>

            <button
              onClick={handleRestoreDefaults}
              className="px-4 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-red-100 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border border-red-900/40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Padrão
            </button>

            <button
              onClick={handleSaveChanges}
              className="px-5 py-2.5 bg-brand-yellow hover:bg-yellow-500 text-stone-950 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-lg shadow-brand-yellow/10"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>
        </div>
      </header>

      {/* Main layout grid */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left pane: Abas vertical switch tabs on desktop, horizontal scroll on mobile */}
        <nav className="md:col-span-3 flex md:flex-col overflow-x-auto md:overflow-visible gap-1.5 p-1 bg-stone-200/60 rounded-xl max-h-min scrollbar-none">
          <button
            onClick={() => setActiveTab("restaurant")}
            className={`w-full text-left px-4 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
              activeTab === "restaurant"
                ? "bg-white text-stone-950 shadow border-l-4 border-brand-yellow"
                : "text-stone-600 hover:bg-white/40 hover:text-stone-900"
            }`}
          >
            <Building className="w-4 h-4" />
            1. Restaurante
          </button>

          <button
            onClick={() => setActiveTab("pratoDoDia")}
            className={`w-full text-left px-4 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
              activeTab === "pratoDoDia"
                ? "bg-white text-stone-950 shadow border-l-4 border-brand-yellow"
                : "text-stone-600 hover:bg-white/40 hover:text-stone-900"
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            2. Prato do Dia
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`w-full text-left px-4 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
              activeTab === "categories"
                ? "bg-white text-stone-950 shadow border-l-4 border-brand-yellow"
                : "text-stone-600 hover:bg-white/40 hover:text-stone-900"
            }`}
          >
            <Tags className="w-4 h-4" />
            3. Categorias
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`w-full text-left px-4 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
              activeTab === "products"
                ? "bg-white text-stone-950 shadow border-l-4 border-brand-yellow"
                : "text-stone-600 hover:bg-white/40 hover:text-stone-900"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            4. Produtos
          </button>

          <button
            onClick={() => setActiveTab("delivery")}
            className={`w-full text-left px-4 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
              activeTab === "delivery"
                ? "bg-white text-stone-950 shadow border-l-4 border-brand-yellow"
                : "text-stone-600 hover:bg-white/40 hover:text-stone-900"
            }`}
          >
            <Truck className="w-4 h-4" />
            5. Entrega
          </button>
        </nav>

        {/* Right pane: Active Aba Settings Content */}
        <main className="md:col-span-9 bg-white rounded-2xl outline outline-stone-200/50 p-5 sm:p-8 shadow-card flex flex-col gap-6">
          
          {/* Error banner: Supabase Importation Error */}
          {importDetailedError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-2xl flex flex-col gap-3.5 animate-spacey shadow-sm">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-red-900 uppercase tracking-wide">
                    ⚠️ Falha na Operação: {importDetailedError.operation}
                  </h4>
                  <p className="text-xs text-red-700 font-medium">
                    Ocorreu um erro ao comunicar-se com o banco de dados do Supabase durante a importação do cardápio.
                  </p>
                </div>
                <button 
                  onClick={() => setImportDetailedError(null)} 
                  className="text-red-400 hover:text-red-750 hover:bg-red-100 p-1.5 rounded-lg transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white rounded-xl p-4.5 space-y-3.5 border border-red-100 text-stone-800 font-sans text-xs">
                <div>
                  <span className="font-black text-red-800 uppercase tracking-wider text-[10px] block mb-0.5">Mensagem do Erro</span>
                  <p className="font-mono bg-red-50/50 p-2.5 rounded-lg text-red-950 border border-red-100/50 break-all leading-normal select-all">
                    {importDetailedError.message}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <span className="font-black text-stone-500 uppercase tracking-wider text-[10px] block mb-0.5">Código do Erro</span>
                    <span className="font-mono bg-stone-50 px-2 py-1 rounded text-stone-700 border border-stone-200">
                      {importDetailedError.code}
                    </span>
                  </div>
                  <div>
                    <span className="font-black text-stone-500 uppercase tracking-wider text-[10px] block mb-0.5">Nome da Tabela</span>
                    <span className="font-mono bg-stone-50 px-2 py-1 rounded text-stone-700 border border-stone-200">
                      {importDetailedError.tableName}
                    </span>
                  </div>
                </div>

                {importDetailedError.payload && (
                  <div>
                    <span className="font-black text-stone-500 uppercase tracking-wider text-[10px] block mb-0.5">Payload Enviado</span>
                    <pre className="p-2.5 bg-stone-900 text-stone-100 rounded-lg overflow-x-auto text-[11px] font-mono leading-relaxed max-h-48 shadow-inner select-all">
                      {JSON.stringify(importDetailedError.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Warning banner: Database is empty */}
          {hasFetched && (data.categories.length === 0 || data.products.length === 0) && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-spacey">
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-stone-900">Seu cardápio online está vazio!</h4>
                <p className="text-xs text-stone-600">Não encontramos categorias ou produtos cadastrados no Supabase. Comece de forma simples importando o cardápio de fábrica.</p>
              </div>
              <button
                onClick={handleImportInitialData}
                disabled={isSyncing}
                className="bg-stone-900 hover:bg-stone-850 text-white hover:text-brand-yellow font-black px-4.5 py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer flex-shrink-0 shadow-sm"
              >
                <Plus className="w-4 h-4 text-brand-yellow" />
                Importar cardápio inicial
              </button>
            </div>
          )}
          
          {/* ABA 1: RESTAURANTE */}
          {activeTab === "restaurant" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-stone-900 font-serif mb-0.5">Configurações do Restaurante</h2>
                <p className="text-xs text-stone-500">Mude as informações básicas de exibição do site principal.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3">
                {/* Nome da Empresa */}
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700">Nome da Empresa</label>
                  <input
                    type="text"
                    value={data.restaurant.companyName}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      restaurant: { ...prev.restaurant, companyName: e.target.value }
                    }))}
                    placeholder="Ex: Divinos Paulista"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-brand-yellow"
                  />
                </div>

                {/* WhatsApp de Pedidos */}
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700">WhatsApp Oficial (Apenas números + DDD)</label>
                  <input
                    type="text"
                    value={data.restaurant.whatsapp}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      restaurant: { ...prev.restaurant, whatsapp: e.target.value.replace(/\D/g, "") }
                    }))}
                    placeholder="Ex: 5511995946993"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-brand-yellow"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Insira com o código do país (55) seguido do DDD e número completo.</p>
                </div>

                {/* Horário de Funcionamento */}
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700">Horário de Funcionamento</label>
                  <input
                    type="text"
                    value={data.restaurant.workingHours}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      restaurant: { ...prev.restaurant, workingHours: e.target.value }
                    }))}
                    placeholder="Ex: Aberto das 10:30h até 00h"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-brand-yellow"
                  />
                </div>

                {/* Estimated Delivery time */}
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700">Tempo Estimado de Entrega</label>
                  <input
                    type="text"
                    value={data.restaurant.estimatedTime || ""}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      restaurant: { ...prev.restaurant, estimatedTime: e.target.value }
                    }))}
                    placeholder="Ex: 30-45 min"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-brand-yellow"
                  />
                </div>

                {/* Chamada Principal (Heading) */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700">Chamada Principal do Site</label>
                  <input
                    type="text"
                    value={data.restaurant.mainTitle}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      restaurant: { ...prev.restaurant, mainTitle: e.target.value }
                    }))}
                    placeholder="Ex: Almoço brasileiro todos os dias"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-brand-yellow"
                  />
                </div>

                {/* Chamada Secundária (Pitch) */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700">Chamada Secundária (Subtexto)</label>
                  <input
                    type="text"
                    value={data.restaurant.subTitle}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      restaurant: { ...prev.restaurant, subTitle: e.target.value }
                    }))}
                    placeholder="Ex: Almoço Paulista Tradicional"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-brand-yellow"
                  />
                </div>
              </div>

              {/* Logo and Banner Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-stone-100">
                {/* LOGO */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700 block">Logo do Restaurante</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-stone-900 border border-stone-200 rounded-2xl flex items-center justify-center overflow-hidden">
                      {data.restaurant.logo ? (
                        <img src={data.restaurant.logo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-serif font-black text-xl text-brand-yellow">DP</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="flex flex-col items-center justify-center border border-dashed border-stone-300 hover:border-brand-yellow bg-stone-50 hover:bg-stone-100 px-4 py-3 rounded-xl cursor-pointer transition-all">
                        <Upload className="w-4 h-4 text-stone-400 mb-1" />
                        <span className="text-[11px] font-bold text-stone-600">Subir nova foto logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, (base64) => {
                            setData(prev => ({
                              ...prev,
                              restaurant: { ...prev.restaurant, logo: base64 }
                            }));
                            showToast("Logo atualizado localmente!", "success");
                          })}
                        />
                      </label>
                      {data.restaurant.logo && (
                        <button
                          onClick={() => setData(prev => ({ ...prev, restaurant: { ...prev.restaurant, logo: "" } }))}
                          className="text-[10px] text-red-650 hover:underline mt-1 font-semibold block"
                        >
                          Remover logo (voltar para DP)
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* BANNER / CAPA */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700 block">Capa / Banner Principal</label>
                  <div className="space-y-3">
                    <div className="w-full h-24 bg-stone-100 rounded-xl overflow-hidden border border-stone-200 relative">
                      <img src={data.restaurant.banner} alt="Banner" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/10" />
                    </div>
                    <div>
                      <label className="flex flex-col items-center justify-center border border-dashed border-stone-300 hover:border-brand-yellow bg-stone-50 hover:bg-stone-100 px-4 py-3 rounded-xl cursor-pointer transition-all">
                        <Upload className="w-4 h-4 text-stone-400 mb-1" />
                        <span className="text-[11px] font-bold text-stone-600">Subir banner principal</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, (base64) => {
                            setData(prev => ({
                              ...prev,
                              restaurant: { ...prev.restaurant, banner: base64 }
                            }));
                            showToast("Capa atualizada localmente!", "success");
                          })}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: PRATO DO DIA */}
          {activeTab === "pratoDoDia" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-stone-900 font-serif mb-0.5">Editar Prato do Dia</h2>
                  <p className="text-xs text-stone-500">A oferta especial destacada na parte superior do cardápio.</p>
                </div>
                
                {/* Active Switch */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-600">Destaque Ativado:</span>
                  <button
                    onClick={() => setData(prev => ({
                      ...prev,
                      pratoDoDia: { ...prev.pratoDoDia, isActive: !prev.pratoDoDia.isActive }
                    }))}
                    className={`w-12 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      data.pratoDoDia.isActive ? "bg-emerald-600" : "bg-stone-300"
                    }`}
                  >
                    <div className={`bg-white w-5.5 h-5.5 rounded-full transition-transform duration-200 shadow ${
                      data.pratoDoDia.isActive ? "translate-x-5.5" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              </div>

              {/* Quick load from catalog */}
              <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/55 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-yellow fill-current animate-pulse" />
                    Vincular com um do Cardápio
                  </span>
                  <p className="text-[11px] text-stone-500 leading-normal">
                    Selecione um prato existente para carregar instantaneamente seus dados (nome, descrição, preço e imagem).
                  </p>
                </div>
                <div className="w-full md:w-80 font-sans">
                  <select
                    value={data.products.find(p => p.name.trim().toLowerCase() === data.pratoDoDia.name.trim().toLowerCase())?.id || ""}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      if (!selectedId) return;
                      const prod = data.products.find(p => p.id === selectedId);
                      if (prod) {
                        setData(prev => ({
                          ...prev,
                          pratoDoDia: {
                            ...prev.pratoDoDia,
                            name: prod.name,
                            price: prod.price,
                            description: prod.description || "",
                            image: prod.image || prev.pratoDoDia.image,
                            isActive: true
                          }
                        }));
                        showToast(`"${prod.name}" carregado como Prato do Dia!`, "success");
                      }
                    }}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-yellow font-medium"
                  >
                    <option value="">-- Escolher do Cardápio --</option>
                    {data.products.map(prod => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} (R$ {prod.price.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-3">
                {/* Image section */}
                <div className="md:col-span-4 space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700 block">Foto do Especial</label>
                  <div className="w-full h-44 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 relative group">
                    <img src={data.pratoDoDia.image} alt="Prato do Dia" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <label className="flex flex-col items-center justify-center border border-dashed border-stone-300 hover:border-brand-yellow bg-stone-50 hover:bg-stone-100 px-3 py-2.5 rounded-xl cursor-pointer transition-all">
                      <Upload className="w-3.5 h-3.5 text-stone-400 mb-1" />
                      <span className="text-[10px] font-bold text-stone-600">Mudar foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, (base64) => {
                          setData(prev => ({
                            ...prev,
                            pratoDoDia: { ...prev.pratoDoDia, image: base64 }
                          }));
                          showToast("Foto do especial do dia foi alterada!", "success");
                        })}
                      />
                    </label>
                  </div>
                </div>

                {/* Text section */}
                <div className="md:col-span-8 space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-wider text-stone-700">Nome do Almoço Especial</label>
                    <input
                      type="text"
                      value={data.pratoDoDia.name}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        pratoDoDia: { ...prev.pratoDoDia, name: e.target.value }
                      }))}
                      placeholder="Ex: Prato do Dia Festivo"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-brand-yellow"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-wider text-stone-700">Preço Especial (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={data.pratoDoDia.price}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        pratoDoDia: { ...prev.pratoDoDia, price: parseFloat(e.target.value) || 0 }
                      }))}
                      placeholder="24.90"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-brand-yellow"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-wider text-stone-700">Ingredientes / Descrição Simplificada</label>
                    <textarea
                      rows={4}
                      value={data.pratoDoDia.description}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        pratoDoDia: { ...prev.pratoDoDia, description: e.target.value }
                      }))}
                      placeholder="Descrição detalhada..."
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-brand-yellow"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: CATEGORIAS */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-stone-900 font-serif mb-0.5">Gerenciar Categorias</h2>
                <p className="text-xs text-stone-500">Crie, renomeie, oculte ou apague categorias estruturais do menu.</p>
              </div>

              {/* Add category box */}
              <div className="bg-stone-50 border border-stone-200 p-4.5 rounded-2xl flex flex-col sm:flex-row items-end gap-3">
                <div className="flex-1 space-y-1 w-full">
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700 block">Criar Nova Categoria</label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Ex: Porções, Massas, Pizzas..."
                    className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-yellow"
                  />
                </div>
                <button
                  onClick={handleAddCategory}
                  className="bg-brand-red hover:bg-brand-red-dark text-white font-extrabold px-5 py-3 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1 w-full sm:w-auto justify-center cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Criar Categoria
                </button>
              </div>

              {/* Categories list */}
              <div className="border border-stone-150 rounded-2xl overflow-hidden divide-y divide-stone-100">
                <div className="bg-stone-50 px-4.5 py-3 grid grid-cols-12 text-[10px] font-black uppercase text-stone-500 tracking-wider">
                  <div className="col-span-6 pl-1">Nome da Categoria</div>
                  <div className="col-span-3 text-center">Status</div>
                  <div className="col-span-3 text-right pr-2">Ações</div>
                </div>

                {data.categories.length === 0 ? (
                  <div className="text-center py-10 text-stone-400 text-xs font-medium">Nenhuma categoria criada.</div>
                ) : (
                  data.categories.map((cat) => {
                    const isEditing = editingCategoryId === cat.id;
                    return (
                      <div key={cat.id} className="px-4.5 py-3.5 grid grid-cols-12 items-center gap-2 hover:bg-stone-50/40 transition">
                        {/* Name field */}
                        <div className="col-span-6 flex items-center gap-2">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 w-full">
                              <input
                                type="text"
                                value={editingCategoryName}
                                onChange={(e) => setEditingCategoryName(e.target.value)}
                                className="bg-white border-2 border-brand-yellow rounded-lg px-2.5 py-1 text-xs font-bold text-stone-900 focus:outline-none w-full"
                              />
                              <button
                                onClick={() => handleSaveCategoryName(cat.id)}
                                className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 cursor-pointer"
                                title="Salvar"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingCategoryId(null)}
                                className="p-1.5 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200"
                                title="Cancelar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-stone-900 tracking-tight pl-1">
                              {cat.name}
                            </span>
                          )}
                        </div>

                        {/* Status Toggle toggle */}
                        <div className="col-span-3 flex justify-center">
                          <button
                            onClick={() => handleToggleCategoryActive(cat.id)}
                            className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1 transition-colors ${
                              cat.isActive !== false
                                ? "bg-emerald-100 text-emerald-850 hover:bg-emerald-200"
                                : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                            }`}
                          >
                            {cat.isActive !== false ? (
                              <>
                                <Eye className="w-3 h-3" /> ATIVO
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" /> OCULTO
                              </>
                            )}
                          </button>
                        </div>

                        {/* Edit Actions */}
                        <div className="col-span-3 flex justify-end gap-1.5 pr-1">
                          {!isEditing && (
                            <button
                              onClick={() => handleStartEditCategory(cat)}
                              className="p-1.5 text-stone-500 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition"
                              title="Editar Nome"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1.5 text-stone-400 hover:text-brand-red hover:bg-stone-100 rounded-lg transition"
                            title="Deletar Categoria"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ABA 4: PRODUTOS */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-stone-900 font-serif mb-0.5">Gerenciar Pratos do Cardápio</h2>
                  <p className="text-xs text-stone-500">Adicione, edite preços, mude fotos ou destaque itens do seu buffet.</p>
                </div>

                <button
                  onClick={handleOpenNewProductForm}
                  className="bg-brand-red hover:bg-brand-red-dark text-white font-extrabold px-4.5 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-brand-yellow" />
                  Novo Produto
                </button>
              </div>

              {/* Product Form Modal wrapper if opened */}
              {isProductFormOpen && (
                <div className="bg-stone-55 border-2 border-brand-yellow p-5 sm:p-6 rounded-2xl space-y-4 animate-spacey relative">
                  <div className="flex items-center justify-between border-b border-stone-150 pb-2.5">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#8b0000] flex items-center gap-1.5">
                      ⭐ {editingProduct ? "Editar Produto Existente" : "Cadastrar Novo Prato no Menu"}
                    </h3>
                    <button
                      onClick={() => setIsProductFormOpen(false)}
                      className="p-1 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700">Nome do Prato / Bebida</label>
                      <input
                        type="text"
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        placeholder="Ex: Contra Filé à Parmegiana"
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-yellow"
                      />
                    </div>

                    {/* Category Selector */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700">Selecione a Categoria</label>
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-yellow"
                      >
                        {data.categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Price */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700">Preço Regular (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={prodPrice}
                        onChange={(e) => setProdPrice(parseFloat(e.target.value) || 0)}
                        placeholder="29.90"
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-yellow"
                      />
                    </div>

                    {/* Image File select upload Base64 */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-750 block">Upar Foto do Prato</label>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 flex-shrink-0">
                          {prodImage ? (
                            <img src={prodImage} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-stone-200 flex items-center justify-center text-[9px] text-stone-400 font-bold">SEM</div>
                          )}
                        </div>
                        <label className="flex-1 flex items-center justify-center border border-dashed border-stone-300 hover:border-brand-yellow bg-white px-3 py-1.5 rounded-lg cursor-pointer transition text-[11px] font-semibold text-stone-600 text-center">
                          <Upload className="w-3.5 h-3.5 text-stone-400 mr-1.5" />
                          Escolher arquivo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, (base64) => {
                              setProdImage(base64);
                              showToast("Foto processada!", "success");
                            })}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-stone-700">Descrição dos Acompanhamentos / Ingredientes</label>
                      <textarea
                        rows={2}
                        value={prodDesc}
                        onChange={(e) => setProdDesc(e.target.value)}
                        placeholder="Ex: Servido com arroz de alho frito, fritas sequinhas, feijoada rica e farofa."
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-yellow"
                      />
                    </div>

                    {/* Selo (Badge) */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-stone-700">Etiqueta Especial / Selo (Badge) opcional</label>
                      <input
                        type="text"
                        value={prodSelo}
                        onChange={(e) => setProdSelo(e.target.value)}
                        placeholder="Ex: Mais Vendido, Novidade, Orgânico, Picante"
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-yellow"
                      />
                    </div>

                    {/* Toggles */}
                    <div className="sm:col-span-2 flex flex-wrap gap-4 pt-1.5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={prodIsActive}
                          onChange={(e) => setProdIsActive(e.target.checked)}
                          className="rounded text-brand-red border-stone-300 focus:ring-brand-yellow w-4 h-4"
                        />
                        <span className="text-xs font-bold text-stone-700 uppercase">Item Ativo (Visível)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={prodIsFeatured}
                          onChange={(e) => setProdIsFeatured(e.target.checked)}
                          className="rounded text-brand-red border-stone-300 focus:ring-brand-yellow w-4 h-4"
                        />
                        <span className="text-xs font-bold text-stone-700 uppercase flex items-center gap-0.5">
                          ⭐ Marcar Destaque
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-stone-150">
                    <button
                      onClick={() => setIsProductFormOpen(false)}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold uppercase transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveProduct}
                      className="px-5 py-2 bg-[#8b0000] hover:bg-red-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition"
                    >
                      {editingProduct ? "Atualizar" : "Como Adicionar"}
                    </button>
                  </div>
                </div>
              )}

              {/* Product Listing Table */}
              <div className="border border-stone-150 rounded-2xl overflow-hidden divide-y divide-stone-100">
                <div className="bg-stone-50 px-4 py-3 grid grid-cols-12 text-[10px] font-black uppercase text-stone-500 tracking-wider">
                  <div className="col-span-2 pl-1">Foto</div>
                  <div className="col-span-5">Prato / Categoria</div>
                  <div className="col-span-2">Preço</div>
                  <div className="col-span-3 text-right pr-2">Ações</div>
                </div>

                {data.products.length === 0 ? (
                  <div className="text-center py-10 text-stone-400 text-xs font-medium">Nenhum produto cadastrado no cardápio.</div>
                ) : (
                  data.products.map((p) => {
                    const isProductPratoDoDia = data.pratoDoDia.isActive && data.pratoDoDia.name.trim().toLowerCase() === p.name.trim().toLowerCase();
                    return (
                      <div key={p.id} className={`px-4 py-3.5 grid grid-cols-12 items-center gap-2 hover:bg-stone-50/40 transition ${isProductPratoDoDia ? "bg-amber-50/20 border-l-4 border-brand-yellow" : ""}`}>
                        {/* Photo column */}
                        <div className="col-span-2 pl-1">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 relative shadow-sm">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            {p.isFeatured && (
                              <div className="absolute top-0.5 right-0.5 bg-brand-yellow text-slate-950 p-0.5 rounded-full">
                                <Star className="w-2.5 h-2.5 fill-current" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Info column */}
                        <div className="col-span-5 space-y-0.5">
                          <h4 className="text-xs font-extrabold text-stone-900 tracking-tight leading-tight flex flex-wrap items-center gap-1.5">
                            {p.name}
                            {p.isActive === false && (
                              <span className="text-[8px] bg-red-100 text-stone-850 px-1.5 py-0.5 rounded uppercase font-extrabold">Oculto</span>
                            )}
                            {isProductPratoDoDia && (
                              <span className="text-[8px] bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-black uppercase flex items-center gap-0.5">
                                <ChefHat className="w-2 h-2 text-brand-red fill-current" /> Especial do Dia
                              </span>
                            )}
                          </h4>
                          <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">{p.category}</span>
                        </div>

                        {/* Price column */}
                        <div className="col-span-2">
                          <span className="text-xs font-extrabold text-stone-900">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.price)}
                          </span>
                        </div>

                        {/* Actions column */}
                        <div className="col-span-3 flex justify-end gap-1.5 pr-1">
                          <button
                            onClick={() => {
                              setData(prev => ({
                                ...prev,
                                pratoDoDia: {
                                  ...prev.pratoDoDia,
                                  name: p.name,
                                  price: p.price,
                                  description: p.description || "",
                                  image: p.image,
                                  isActive: true
                                }
                              }));
                              showToast(`"${p.name}" foi selecionado como o Especial do Dia!`, "success");
                            }}
                            className={`p-1.5 rounded-lg border transition ${
                              isProductPratoDoDia
                                ? "bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200"
                                : "bg-stone-50 border-stone-200 text-stone-400 hover:text-[#8b0000] hover:bg-amber-50"
                            }`}
                            title={isProductPratoDoDia ? "Este é o Prato do Dia ativo" : "Tornar este o Prato do Dia"}
                          >
                            <ChefHat className={`w-3.5 h-3.5 ${isProductPratoDoDia ? "fill-brand-yellow text-brand-red" : ""}`} />
                          </button>

                          <button
                            onClick={() => handleToggleProductActive(p.id)}
                            className={`p-1.5 rounded-lg border transition ${
                              p.isActive !== false
                                ? "bg-emerald-50 border-emerald-100 text-emerald-800 hover:bg-emerald-100"
                                : "bg-stone-50 border-stone-200 text-stone-400 hover:bg-stone-100"
                            }`}
                            title={p.isActive !== false ? "Desativar Item" : "Reativar Item"}
                          >
                            {p.isActive !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          
                          <button
                            onClick={() => handleOpenEditProductForm(p)}
                            className="p-1.5 border border-stone-200 text-stone-500 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition"
                            title="Editar Atributos"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 border border-stone-200 text-stone-400 hover:text-brand-red hover:bg-stone-100 rounded-lg transition"
                            title="Deletar Prato"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ABA 5: ENTREGA */}
          {activeTab === "delivery" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-stone-900 font-serif mb-0.5">Custos e Prazos de Entrega</h2>
                <p className="text-xs text-stone-500">Ajuste o valor fixo cobrado no checkout por pedido e prazos médios de rota.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3">
                {/* Taxa de Entrega (R$) */}
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700">Taxa de Entrega Fixa (R$)</label>
                  <input
                    type="number"
                    step="0.10"
                    value={data.restaurant.deliveryFee}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      restaurant: { ...prev.restaurant, deliveryFee: parseFloat(e.target.value) || 0 }
                    }))}
                    placeholder="9.00"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-brand-yellow"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Este valor será automaticamente somado ao subtotal do carrinho no checkout.</p>
                </div>

                {/* Tempo Estimado */}
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700">Tempo Estimado Médio</label>
                  <input
                    type="text"
                    value={data.restaurant.estimatedTime || ""}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      restaurant: { ...prev.restaurant, estimatedTime: e.target.value }
                    }))}
                    placeholder="Ex: 30-45 min"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-brand-yellow"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Aparece na descrição principal e ajuda a alinhar expectativas dos clientes.</p>
                </div>
              </div>
            </div>
          )}

          {/* Persistent Save Floating Advice banner inside the panel */}
          <div className="mt-8 pt-5 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans bg-amber-50/50 p-4 rounded-xl border border-amber-100">
            <div>
              <p className="text-[11px] font-extrabold text-[#700202] uppercase tracking-wider">⚠️ Atenção para salvamento</p>
              <p className="text-[10px] text-stone-600">As edições feitas acima são temporárias. Você precisa clicar em <b>Salvar Alterações</b> para aplicar.</p>
            </div>
            
            <button
              onClick={handleSaveChanges}
              className="bg-[#8b0000] hover:bg-stone-900 text-white font-black py-2 px-5 rounded-lg text-xs uppercase tracking-wider transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Save className="w-3.5 h-3.5 text-brand-yellow" />
              Salvar Tudo
            </button>
          </div>

        </main>
      </div>

      {/* Admin footer */}
      <footer className="bg-stone-900/90 text-stone-500 py-6 text-center text-xs mt-auto border-t border-stone-800">
        <p>© 2026 Divinos Paulista - Painel Seguro Criptografado Localmente.</p>
      </footer>

      {/* Custom Confirmation Modal Dialog replacing window.confirm */}
      {confirmDialog && confirmDialog.isOpen && (
        <div id="custom-confirm-modal" className="fixed inset-0 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 text-left font-sans">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-brand-yellow relative animate-spacey">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 border border-brand-yellow">
                <AlertTriangle className="w-5 h-5 text-[#8b0000]" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-xs font-black text-[#8b0000] uppercase tracking-wider">
                  {confirmDialog.title}
                </h3>
                <p className="text-[11px] text-stone-500 leading-normal">
                  {confirmDialog.message}
                </p>
              </div>
            </div>
            
            <div className="mt-5 flex justify-end gap-2 border-t border-stone-100 pt-4">
              <button
                id="confirm-cancel-btn"
                onClick={() => setConfirmDialog(null)}
                className="px-3.5 py-2 border border-stone-200 text-stone-500 rounded-xl text-[10px] uppercase font-black tracking-wider hover:bg-stone-50 transition cursor-pointer"
              >
                {confirmDialog.cancelText}
              </button>
              <button
                id="confirm-submit-btn"
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 bg-brand-red hover:bg-[#700202] text-white rounded-xl text-[10px] uppercase font-black tracking-wider transition shadow-sm cursor-pointer"
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
