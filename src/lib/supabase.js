import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
supabaseUrl,
supabaseAnonKey
);

// Administrative Email from runtime environment
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "javitooneguel@gmail.com";

/**
 * Autentica o administrador utilizando apenas a senha.
 * @param {string} password
 */
export async function loginWithPasswordOnly(password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: password
  });
  if (error) throw error;
  return data;
}

/**
 * Obtém a sessão atual.
 */
export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Desconecta o usuário atual.
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Envia uma imagem para o bucket 'menu-images' no Supabase Storage.
 * Retorna a URL pública do objeto enviado.
 * @param {File} file
 */
export async function uploadImage(file) {
  if (!file) return null;
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('menu-images')
    .upload(fileName, file, {
      cacheControl: '31536000',
      upsert: true
    });
  
  if (error) {
    console.error("Storage upload error details:", error);
    throw error;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('menu-images')
    .getPublicUrl(fileName);
    
  return publicUrl;
}

/**
 * Carrega as configurações do restaurante do Supabase.
 */
export async function loadSupabaseSettings() {
  const { data: rows, error } = await supabase
    .from("restaurant_settings")
    .select("*");
    
  if (error) {
    console.error("Error loading settings from Supabase:", error);
    return null;
  }
  
  if (rows && rows.length > 0) {
    return rows[0];
  }
  return null;
}

/**
 * Salva ou atualiza as configurações do restaurante no Supabase.
 * @param {object} settings
 * @param {string|number|null} existingId
 */
export async function saveSupabaseSettings(settings, existingId = null) {
  const payload = {
    company_name: settings.companyName,
    companyName: settings.companyName,
    logo: settings.logo,
    banner: settings.banner,
    whatsapp: settings.whatsapp,
    working_hours: settings.workingHours,
    workingHours: settings.workingHours,
    delivery_fee: settings.deliveryFee,
    deliveryFee: settings.deliveryFee,
    estimated_time: settings.estimatedTime,
    estimatedTime: settings.estimatedTime,
    main_title: settings.mainTitle,
    mainTitle: settings.mainTitle,
    sub_title: settings.subTitle,
    subTitle: settings.subTitle,
    
    // Prato do Dia properties nested in configurations table
    prato_do_dia_name: settings.pratoDoDiaName,
    pratoDoDiaName: settings.pratoDoDiaName,
    prato_do_dia_description: settings.pratoDoDiaDescription,
    pratoDoDiaDescription: settings.pratoDoDiaDescription,
    prato_do_dia_price: settings.pratoDoDiaPrice,
    pratoDoDiaPrice: settings.pratoDoDiaPrice,
    prato_do_dia_image: settings.pratoDoDiaImage,
    pratoDoDiaImage: settings.pratoDoDiaImage,
    prato_do_dia_is_active: settings.pratoDoDiaIsActive,
    pratoDoDiaIsActive: settings.pratoDoDiaIsActive,
  };
  
  if (existingId) {
    const { data, error } = await supabase
      .from("restaurant_settings")
      .update(payload)
      .eq("id", existingId)
      .select();
    if (error) throw error;
    return data[0];
  } else {
    // Check if a settings row already exists to avoid duplication
    const { data: checkRows } = await supabase.from("restaurant_settings").select("id");
    if (checkRows && checkRows.length > 0) {
      const { data, error } = await supabase
        .from("restaurant_settings")
        .update(payload)
        .eq("id", checkRows[0].id)
        .select();
      if (error) throw error;
      return data[0];
    } else {
      const { data, error } = await supabase
        .from("restaurant_settings")
        .insert([payload])
        .select();
      if (error) throw error;
      return data[0];
    }
  }
}

/**
 * Carrega a lista de categorias do Supabase.
 */
export async function loadSupabaseCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*");
    
  if (error) {
    console.error("Error loading categories:", error);
    throw error;
  }
  return data;
}

/**
 * Carrega a lista de produtos do Supabase.
 */
export async function loadSupabaseProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*");
    
  if (error) {
    console.error("Error loading products:", error);
    throw error;
  }
  return data;
}

/**
 * Cria uma nova categoria no Supabase.
 * @param {object} category
 */
export async function insertSupabaseCategory(category) {
  const payload = {
    name: category.name,
    is_active: category.isActive !== false,
    isActive: category.isActive !== false,
    active: category.isActive !== false,
    sort_order: typeof category.sort_order === 'number' ? category.sort_order : 0
  };
  
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (category.id && uuidRegex.test(category.id)) {
    payload.id = category.id;
  }

  const { data, error } = await supabase
    .from("categories")
    .insert([payload])
    .select();
  if (error) throw error;
  return data[0];
}

/**
 * Atualiza uma categoria no Supabase.
 * @param {string} id
 * @param {string} categoryName
 * @param {boolean} isActive
 */
export async function updateSupabaseCategory(id, categoryName, isActive) {
  const payload = {
    name: categoryName,
    is_active: isActive !== false,
    isActive: isActive !== false,
    active: isActive !== false
  };
  const { data, error } = await supabase
    .from("categories")
    .update(payload)
    .eq("id", id)
    .select();
  if (error) throw error;
  return data[0];
}

/**
 * Exclui uma categoria do Supabase.
 * @param {string} id
 */
export async function deleteSupabaseCategory(id) {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

/**
 * Cadastra um novo produto no Supabase.
 * @param {object} product
 */
export async function insertSupabaseProduct(product) {
  const payload = {
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    image: product.image,
    is_active: product.isActive !== false,
    isActive: product.isActive !== false,
    is_featured: product.isFeatured === true,
    isFeatured: product.isFeatured === true,
    selo: product.selo || "",
    badge: product.selo || ""
  };

  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (product.id && uuidRegex.test(product.id)) {
    payload.id = product.id;
  }

  if (product.category_id) {
    payload.category_id = product.category_id;
  } else if (product.categoryId) {
    payload.category_id = product.categoryId;
  }

  const { data, error } = await supabase
    .from("products")
    .insert([payload])
    .select();
  if (error) throw error;
  return data[0];
}

/**
 * Atualiza um produto no Supabase.
 * @param {string} id
 * @param {object} product
 */
export async function updateSupabaseProduct(id, product) {
  const payload = {
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    image: product.image,
    is_active: product.isActive !== false,
    isActive: product.isActive !== false,
    is_featured: product.isFeatured === true,
    isFeatured: product.isFeatured === true,
    selo: product.selo || "",
    badge: product.selo || ""
  };

  if (product.category_id) {
    payload.category_id = product.category_id;
  } else if (product.categoryId) {
    payload.category_id = product.categoryId;
  }

  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select();
  if (error) throw error;
  return data[0];
}

/**
 * Exclui um produto do Supabase.
 * @param {string} id
 */
export async function deleteSupabaseProduct(id) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
