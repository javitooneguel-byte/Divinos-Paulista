/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isActive?: boolean;
  isFeatured?: boolean;
  selo?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  reference: string;
}

export interface Customer {
  name: string;
  phone: string;
}

export interface RestaurantConfig {
  companyName: string;
  logo: string;
  banner: string;
  whatsapp: string;
  workingHours: string;
  deliveryFee: number;
  estimatedTime: string;
  mainTitle: string;
  subTitle: string;
}

export interface CategoryConfig {
  id: string;
  name: string;
  isActive: boolean;
}

export interface PratoDoDiaConfig {
  name: string;
  description: string;
  price: number;
  image: string;
  isActive: boolean;
}

export interface AppDataStore {
  restaurant: RestaurantConfig;
  categories: CategoryConfig[];
  products: Product[];
  pratoDoDia: PratoDoDiaConfig;
}

