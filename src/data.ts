/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from "./types";

export const PRODUCTS: Product[] = [
  // PRATO DO DIA
  {
    id: "prato-do-dia",
    name: "Prato do Dia",
    description: "Almoço completo do dia com arroz branco, feijão caseiro, carne do dia, acompanhamento especial e salada simples com alface, tomate e cebola.",
    price: 24.90,
    category: "Prato do Dia",
    image: "https://images.unsplash.com/photo-1625938146369-adc83368bda7?q=80&w=800&auto=format&fit=crop"
  },

  // PRATOS COMERCIAIS
  {
    id: "bife-acebolado-comercial",
    name: "Bife Acebolado Comercial",
    description: "Bife acebolado grelhado na chapa, servido com arroz branco, feijão caseiro, batata frita e salada simples com alface, tomate e cebola. Serve bem uma pessoa.",
    price: 29.90,
    category: "Pratos Comerciais",
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "frango-grelhado-comercial",
    name: "Frango Grelhado Comercial",
    description: "Filé de peito de frango grelhado na chapa, servido com arroz branco, feijão caseiro, batata frita e salada simples com alface, tomate e cebola. Serve bem uma pessoa.",
    price: 27.90,
    category: "Pratos Comerciais",
    image: "https://images.unsplash.com/photo-1305411750570-5b23ee402e1c?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "linguica-toscana-comercial",
    name: "Linguiça Toscana Comercial",
    description: "Linguiça toscana inteira, grelhada e acebolada, servida com arroz branco, feijão caseiro, farofa e salada simples com alface, tomate e cebola. Serve bem uma pessoa.",
    price: 27.90,
    category: "Pratos Comerciais",
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "calabresa-acebolada-comercial",
    name: "Calabresa Acebolada Comercial",
    description: "Calabresa acebolada na chapa, servida com arroz branco, feijão caseiro, batata frita e salada simples com alface, tomate e cebola. Serve bem uma pessoa.",
    price: 26.90,
    category: "Pratos Comerciais",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "ovo-com-linguica-comercial",
    name: "Ovo com Linguiça Comercial",
    description: "Ovo frito com linguiça toscana, servido com arroz branco, feijão caseiro, farofa e salada simples com alface, tomate e cebola. Prato simples, saboroso e bem servido.",
    price: 24.90,
    category: "Pratos Comerciais",
    image: "https://images.unsplash.com/photo-1582980072120-e2ef616ea4ff?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "frango-a-milanesa-comercial",
    name: "Frango à Milanesa Comercial",
    description: "Filé de frango empanado, servido com arroz branco, feijão caseiro, batata frita e salada simples com alface, tomate e cebola. Serve bem uma pessoa.",
    price: 29.90,
    category: "Pratos Comerciais",
    image: "https://images.unsplash.com/photo-1562608284-c5247fd16e45?q=80&w=600&auto=format&fit=crop"
  },

  // PRATOS EXECUTIVOS
  {
    id: "executivo-bife-acebolado-fritas",
    name: "Executivo de Bife Acebolado com Fritas",
    description: "Bife acebolado grelhado na chapa, servido com arroz branco, feijão caseiro, batata frita, farofa e salada simples com alface, tomate e cebola. Serve bem uma pessoa.",
    price: 34.90,
    category: "Pratos Executivos",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "executivo-frango-milanesa",
    name: "Executivo de Frango à Milanesa",
    description: "Filé de frango empanado e crocante, servido com arroz branco, feijão caseiro, batata frita, farofa e salada simples com alface, tomate e cebola. Serve bem uma pessoa.",
    price: 34.90,
    category: "Pratos Executivos",
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "executivo-contra-file",
    name: "Executivo de Contra Filé",
    description: "Contra filé acebolado na chapa, servido com arroz branco, feijão caseiro, batata frita, farofa e salada simples com alface, tomate e cebola. Serve bem uma pessoa.",
    price: 39.90,
    category: "Pratos Executivos",
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "executivo-bife-milanesa",
    name: "Executivo de Bife à Milanesa",
    description: "Bife empanado e frito, servido com arroz branco, feijão caseiro, batata frita, farofa e salada simples com alface, tomate e cebola. Serve bem uma pessoa.",
    price: 37.90,
    category: "Pratos Executivos",
    image: "https://images.unsplash.com/photo-1598515214211-89d3e73ae83b?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "executivo-file-frango-grelhado",
    name: "Executivo de Filé de Frango Grelhado",
    description: "Filé de peito de frango grelhado, servido com arroz branco, feijão caseiro, batata frita, farofa e salada simples com alface, tomate e cebola. Opção leve e bem servida.",
    price: 34.90,
    category: "Pratos Executivos",
    image: "https://images.unsplash.com/photo-1598511725623-96b90101741a?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "executivo-peixe-frito",
    name: "Executivo de Peixe Frito",
    description: "Filé de peixe frito, servido com arroz branco, feijão caseiro, batata frita, vinagrete, farofa e salada simples. Serve bem uma pessoa.",
    price: 39.90,
    category: "Pratos Executivos",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "executivo-carne-panela",
    name: "Executivo de Carne de Panela",
    description: "Carne de panela ao molho caseiro, servida com arroz branco, feijão caseiro, legumes cozidos, farofa e salada simples. Prato caseiro, bem temperado e reforçado.",
    price: 36.90,
    category: "Pratos Executivos",
    image: "https://images.unsplash.com/photo-1547928576-a4a3323d8b62?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "executivo-bisteca-chapa",
    name: "Executivo de Bisteca na Chapa",
    description: "Bisteca suína grelhada na chapa, servida com arroz branco, feijão caseiro, batata frita, farofa e salada simples com alface, tomate e cebola. Serve bem uma pessoa.",
    price: 35.90,
    category: "Pratos Executivos",
    image: "https://images.unsplash.com/photo-1602489114757-3f339b1b6016?q=80&w=600&auto=format&fit=crop"
  },

  // PRATOS ESPECIAIS
  {
    id: "parmegiana-frango-especial",
    name: "Parmegiana de Frango Especial",
    description: "Filé de frango empanado com molho de tomate e queijo derretido, servido com arroz branco, feijão caseiro, batata frita e salada simples. Prato especial bem servido.",
    price: 39.90,
    category: "Pratos Especiais",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "parmegiana-carne-especial",
    name: "Parmegiana de Carne Especial",
    description: "Bife empanado com molho de tomate e queijo derretido, servido com arroz branco, feijão caseiro, batata frita e salada simples. Prato especial bem servido.",
    price: 44.90,
    category: "Pratos Especiais",
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "feijoada-completa",
    name: "Feijoada Completa",
    description: "Feijoada servida com arroz branco, couve refogada, farofa, vinagrete, torresmo e laranja. Prato brasileiro tradicional e bem servido.",
    price: 39.90,
    category: "Pratos Especiais",
    image: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "baiao-de-dois-especial",
    name: "Baião de Dois Especial",
    description: "Baião de dois com carne seca, calabresa, bacon, queijo coalho e tempero caseiro. Prato brasileiro saboroso e reforçado.",
    price: 36.90,
    category: "Pratos Especiais",
    image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "costela-cozida-mandioca",
    name: "Costela Cozida com Mandioca",
    description: "Costela cozida ao molho da casa, servida com mandioca macia, arroz branco, feijão caseiro, farofa e salada simples. Prato especial bem servido.",
    price: 44.90,
    category: "Pratos Especiais",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "feijao-tropeiro-especial",
    name: "Feijão Tropeiro Especial",
    description: "Feijão tropeiro com arroz branco, couve, ovo, linguiça, bacon, torresmo e salada simples. Prato brasileiro completo e saboroso.",
    price: 36.90,
    category: "Pratos Especiais",
    image: "https://images.unsplash.com/photo-1625938146369-adc83368bda7?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "frango-com-quiabo",
    name: "Frango com Quiabo",
    description: "Frango cozido com quiabo, servido com arroz branco, feijão caseiro, angu ou farofa e salada simples. Comida caseira brasileira.",
    price: 34.90,
    category: "Pratos Especiais",
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "strogonoff-de-frango",
    name: "Strogonoff de Frango",
    description: "Strogonoff de frango cremoso, servido com arroz branco, batata palha e salada simples. Prato especial cremoso e bem servido.",
    price: 34.90,
    category: "Pratos Especiais",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=600&auto=format&fit=crop"
  },

  // BEBIDAS
  {
    id: "coca-cola-2l",
    name: "Coca-Cola 2 Litros",
    description: "Refrigerante Coca-Cola original, garrafa de 2 litros gelada.",
    price: 15.00,
    category: "Bebidas",
    image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "guarana-antarctica-2l",
    name: "Guaraná Antarctica 2 Litros",
    description: "Refrigerante Guaraná Antarctica original, garrafa de 2 litros gelada.",
    price: 15.00,
    category: "Bebidas",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "coca-cola-lata",
    name: "Coca-Cola Lata",
    description: "Refrigerante Coca-Cola original gelado em lata de 350ml.",
    price: 7.00,
    category: "Bebidas",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "guarana-antarctica-lata",
    name: "Guaraná Antarctica Lata",
    description: "Refrigerante Guaraná Antarctica original gelado em lata de 350ml.",
    price: 7.00,
    category: "Bebidas",
    image: "https://images.unsplash.com/photo-1527960655-2674472faea5?q=80&w=600&auto=format&fit=crop"
  },

  // SUCOS NATURAIS
  {
    id: "suco-laranja",
    name: "Suco Natural de Laranja",
    description: "Suco 100% natural de laranja espremida, preparado na hora bem gelado.",
    price: 7.00,
    category: "Sucos Naturais",
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "suco-limao",
    name: "Suco Natural de Limão",
    description: "Suco de limão siciliano espremido na hora, refrescante e gelado.",
    price: 7.00,
    category: "Sucos Naturais",
    image: "https://images.unsplash.com/photo-1543536448-d209d2d13a1c?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "suco-goiaba",
    name: "Suco Natural de Goiaba",
    description: "Suco natural de goiaba vermelha, cremoso e preparado na hora.",
    price: 7.00,
    category: "Sucos Naturais",
    image: "https://images.unsplash.com/photo-1531315630201-bb15abeb1653?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "suco-melancia",
    name: "Suco Natural de Melancia",
    description: "Suco natural de melancia doce, refrescante e preparado na hora sem conservantes.",
    price: 7.00,
    category: "Sucos Naturais",
    image: "https://images.unsplash.com/photo-1589733901241-5e5148685df5?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "suco-abacaxi",
    name: "Suco Natural de Abacaxi",
    description: "Suco natural de abacaxi com pedaços frescos, super refrescante e preparado na hora.",
    price: 7.00,
    category: "Sucos Naturais",
    image: "https://images.unsplash.com/photo-1550507992-eb63ffee0847?q=80&w=600&auto=format&fit=crop"
  },

  // SOBREMESAS
  {
    id: "pudim",
    name: "Pudim Caseiro",
    description: "Pudim de leite condensado caseiro individual, extremamente cremoso com calda de caramelo brilhante e gelado.",
    price: 7.90,
    category: "Sobremesas",
    image: "https://images.unsplash.com/photo-1528975604071-b4daaf306793?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "mousse-maracuja",
    name: "Mousse de Maracujá",
    description: "Mousse de maracujá aerada e cremosa com sementes e calda azedinha em porção individual.",
    price: 6.90,
    category: "Sobremesas",
    image: "https://images.unsplash.com/photo-1623961990059-28355e229a87?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "bolo-gelado",
    name: "Bolo Gelado",
    description: "Deliciosa fatia de bolo gelado caseiro embrulhado no papel alumínio, super molhadinho com calda de coco.",
    price: 8.90,
    category: "Sobremesas",
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop"
  }
];

export const CATEGORIES: { id: string; name: string }[] = [
  { id: "all", name: "Todos" },
  { id: "Prato do Dia", name: "Prato do Dia" },
  { id: "Pratos Comerciais", name: "Pratos Comerciais" },
  { id: "Pratos Executivos", name: "Pratos Executivos" },
  { id: "Pratos Especiais", name: "Pratos Especiais" },
  { id: "Bebidas", name: "Bebidas" },
  { id: "Sucos Naturais", name: "Sucos Naturais" },
  { id: "Sobremesas", name: "Sobremesas" }
];
