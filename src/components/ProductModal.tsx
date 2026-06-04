/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { X, Plus, Minus, ShoppingBag, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "../types";
import { optimizeImageUrl, imagePerfProps } from "../lib/imageOptimizer";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAdd: (product: Product, quantity: number, observation: string) => void;
  allProducts: Product[];
  onAddBebidaDirectly: (product: Product) => void;
}

export function ProductModal({
  isOpen,
  onClose,
  product,
  onAdd,
  allProducts,
  onAddBebidaDirectly,
}: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const bebidasScrollRef = useRef<HTMLDivElement | null>(null);
  const sucosScrollRef = useRef<HTMLDivElement | null>(null);
  const sobremesasScrollRef = useRef<HTMLDivElement | null>(null);

  // Reset local state when a new product is selected
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setObservation("");
      setFeedbackMessage(null);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleAddProduct = () => {
    onAdd(product, quantity, observation);
    onClose();
  };

  const handleAddBebida = (bebida: Product) => {
    onAddBebidaDirectly(bebida);
    setFeedbackMessage(`Bebida adicionada ao pedido`);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 2000);
  };

  // Filter drinks, juices and desserts separately
  const listBebidas = allProducts.filter(
    (p) => p.category === "Bebidas" && p.isActive !== false
  );
  const listSucos = allProducts.filter(
    (p) => p.category === "Sucos Naturais" && p.isActive !== false
  );
  const listSobremesas = allProducts.filter(
    (p) => p.category === "Sobremesas" && p.isActive !== false
  );

  const scrollList = (scrollRef: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -210 : 210;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const fallbackUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80";
  const optimizedUrl = optimizeImageUrl(product.image, { width: 600, quality: 80 });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden transform transition-all">
        
        {/* Header containing a Close Button at Top */}
        <div className="absolute top-4 right-4 z-30">
          <button
            onClick={onClose}
            className="p-2 bg-black/65 hover:bg-black/85 text-white rounded-full transition shadow-lg shrink-0 cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pb-24 sm:pb-6">
          {/* Image */}
          <div className="relative h-56 sm:h-64 w-full bg-stone-100 shrink-0">
            <img
              src={optimizedUrl || fallbackUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              {...imagePerfProps}
              referrerPolicy="no-referrer"
            />
            {product.selo && (
              <div className="absolute bottom-4 left-4 bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                {product.selo}
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="p-5 sm:p-6 space-y-5">
            <div>
              <span className="text-[10px] uppercase font-bold text-brand-red tracking-widest">
                {product.category}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-black text-stone-950 mt-1 leading-tight">
                {product.name}
              </h3>
              {product.description && (
                <p className="text-stone-600 text-xs sm:text-sm mt-2.5 leading-relaxed font-sans font-medium">
                  {product.description}
                </p>
              )}
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-stone-400 text-xs font-semibold">Preço unitário:</span>
                <span className="text-stone-950 font-black text-lg">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                  }).format(product.price)}
                </span>
              </div>
            </div>

            {/* Note Input Field */}
            <div className="space-y-1.5">
              <label htmlFor="item-observation" className="text-[11px] font-extrabold uppercase text-stone-500 tracking-wider">
                Observação do item
              </label>
              <textarea
                id="item-observation"
                rows={2}
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Ex: sem cebola, feijão separado, ponto da carne, tirar salada..."
                className="w-full bg-stone-50 hover:bg-stone-100/50 focus:bg-white border border-stone-200 focus:border-brand-red rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:ring-0 resize-none transition-all placeholder:text-stone-400 font-sans"
              />
            </div>

            {/* Side-by-side Quantity Indicator */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-stone-700">Escolha a quantidade:</span>
              <div className="flex items-center bg-white border border-stone-200 rounded-xl p-1 shadow-sm">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-8 h-8 rounded-lg hover:bg-stone-50 text-stone-700 flex items-center justify-center transition active:scale-95 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-sans font-black text-stone-950 text-sm px-3.5 min-w-[24px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-8 h-8 rounded-lg hover:bg-stone-50 text-stone-700 flex items-center justify-center transition active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drinks, Juices and Desserts Sections */}
            {(listBebidas.length > 0 || listSucos.length > 0 || listSobremesas.length > 0) && (
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-stone-500 tracking-wider font-sans">
                    Acompanhamentos sugeridos
                  </span>
                  {feedbackMessage && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-lg animate-pulse flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" /> {feedbackMessage}
                    </span>
                  )}
                </div>

                {/* Section 1: Bebidas */}
                {listBebidas.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5 px-0.5">
                      <span>🥤</span> Refrigerantes e Cervejas <span className="text-[9px] text-stone-300 lowercase font-normal">(deslize para o lado →)</span>
                    </h5>
                    <div className="relative group/arrows">
                      {/* Left Arrow Button */}
                      <button
                        type="button"
                        onClick={() => scrollList(bebidasScrollRef, "left")}
                        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-stone-700 hover:text-black border border-stone-200/80 shadow-md p-1.5 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center opacity-85 hover:opacity-100"
                        title="Anterior"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>

                      <div 
                        ref={bebidasScrollRef}
                        className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-stone-100/60 pr-4 touch-pan-x"
                      >
                        {listBebidas.map((drink) => {
                          const drinkThumb = optimizeImageUrl(drink.image, { width: 80, quality: 75 });
                          return (
                            <div
                              key={drink.id}
                              className="bg-stone-50 border border-stone-200/80 rounded-2xl p-2.5 flex items-center gap-2.5 shrink-0 min-w-[195px] w-[210px] shadow-sm hover:border-stone-300 transition-all"
                            >
                              <img
                                src={drinkThumb || fallbackUrl}
                                alt={drink.name}
                                className="w-10 h-10 object-cover rounded-lg shadow-sm border border-stone-150 shrink-0"
                                loading="lazy"
                              />
                              <div className="min-w-0 flex-1 font-sans">
                                <p className="text-[11px] font-bold text-stone-900 truncate leading-tight">
                                  {drink.name}
                                </p>
                                <p className="text-[10px] text-emerald-700 font-extrabold mt-0.5">
                                  {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL"
                                  }).format(drink.price)}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAddBebida(drink)}
                                className="bg-brand-yellow hover:bg-amber-400 text-stone-950 p-1.5 rounded-lg transition active:scale-95 cursor-pointer shrink-0"
                                title="Adicionar ao pedido"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Right Arrow Button */}
                      <button
                        type="button"
                        onClick={() => scrollList(bebidasScrollRef, "right")}
                        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-stone-700 hover:text-black border border-stone-200/80 shadow-md p-1.5 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center opacity-85 hover:opacity-100"
                        title="Próximo"
                      >
                        <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Section 2: Sucos Naturais */}
                {listSucos.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5 px-0.5">
                      <span>🍹</span> Sucos Naturais Gelados <span className="text-[9px] text-stone-300 lowercase font-normal">(deslize para o lado →)</span>
                    </h5>
                    <div className="relative group/arrows">
                      {/* Left Arrow Button */}
                      <button
                        type="button"
                        onClick={() => scrollList(sucosScrollRef, "left")}
                        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-stone-700 hover:text-black border border-stone-200/80 shadow-md p-1.5 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center opacity-85 hover:opacity-100"
                        title="Anterior"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>

                      <div 
                        ref={sucosScrollRef}
                        className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-stone-100/60 pr-4 touch-pan-x font-sans"
                      >
                        {listSucos.map((drink) => {
                          const drinkThumb = optimizeImageUrl(drink.image, { width: 80, quality: 75 });
                          return (
                            <div
                              key={drink.id}
                              className="bg-stone-50 border border-stone-200/80 rounded-2xl p-2.5 flex items-center gap-2.5 shrink-0 min-w-[195px] w-[210px] shadow-sm hover:border-stone-300 transition-all font-sans"
                            >
                              <img
                                src={drinkThumb || fallbackUrl}
                                alt={drink.name}
                                className="w-10 h-10 object-cover rounded-lg shadow-sm border border-stone-150 shrink-0"
                                loading="lazy"
                              />
                              <div className="min-w-0 flex-1 font-sans">
                                <p className="text-[11px] font-bold text-stone-900 truncate leading-tight">
                                  {drink.name}
                                </p>
                                <p className="text-[10px] text-emerald-700 font-extrabold mt-0.5">
                                  {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL"
                                  }).format(drink.price)}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAddBebida(drink)}
                                className="bg-brand-yellow hover:bg-amber-400 text-stone-950 p-1.5 rounded-lg transition active:scale-95 cursor-pointer shrink-0"
                                title="Adicionar ao pedido"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Right Arrow Button */}
                      <button
                        type="button"
                        onClick={() => scrollList(sucosScrollRef, "right")}
                        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-stone-700 hover:text-black border border-stone-200/80 shadow-md p-1.5 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center opacity-85 hover:opacity-100"
                        title="Próximo"
                      >
                        <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Section 3: Sobremesas */}
                {listSobremesas.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h5 className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5 px-0.5">
                      <span>🍰</span> Sobremesas Deliciosas <span className="text-[9px] text-stone-300 lowercase font-normal">(deslize para o lado →)</span>
                    </h5>
                    <div className="relative group/arrows">
                      {/* Left Arrow Button */}
                      <button
                        type="button"
                        onClick={() => scrollList(sobremesasScrollRef, "left")}
                        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-stone-700 hover:text-black border border-stone-200/80 shadow-md p-1.5 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center opacity-85 hover:opacity-100"
                        title="Anterior"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>

                      <div 
                        ref={sobremesasScrollRef}
                        className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-stone-100/60 pr-4 touch-pan-x font-sans"
                      >
                        {listSobremesas.map((dessert) => {
                          const dessertThumb = optimizeImageUrl(dessert.image, { width: 80, quality: 75 });
                          return (
                            <div
                              key={dessert.id}
                              className="bg-stone-50 border border-stone-200/80 rounded-2xl p-2.5 flex items-center gap-2.5 shrink-0 min-w-[195px] w-[210px] shadow-sm hover:border-stone-300 transition-all font-sans"
                            >
                              <img
                                src={dessertThumb || fallbackUrl}
                                alt={dessert.name}
                                className="w-10 h-10 object-cover rounded-lg shadow-sm border border-stone-150 shrink-0"
                                loading="lazy"
                              />
                              <div className="min-w-0 flex-1 font-sans">
                                <p className="text-[11px] font-bold text-stone-900 truncate leading-tight">
                                  {dessert.name}
                                </p>
                                <p className="text-[10px] text-emerald-700 font-extrabold mt-0.5">
                                  {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL"
                                  }).format(dessert.price)}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAddBebida(dessert)}
                                className="bg-brand-yellow hover:bg-amber-400 text-stone-950 p-1.5 rounded-lg transition active:scale-95 cursor-pointer shrink-0"
                                title="Adicionar ao pedido"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Right Arrow Button */}
                      <button
                        type="button"
                        onClick={() => scrollList(sobremesasScrollRef, "right")}
                        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-stone-700 hover:text-black border border-stone-200/80 shadow-md p-1.5 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center opacity-85 hover:opacity-100"
                        title="Próximo"
                      >
                        <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Add button - Fixed at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-stone-100 shadow-xl flex items-center justify-between gap-4 z-20">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-stone-400">Total do Item</span>
            <span className="font-sans font-black text-brand-red text-base leading-tight">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL"
              }).format(product.price * quantity)}
            </span>
          </div>

          <button
            onClick={handleAddProduct}
            className="flex-1 max-w-[210px] bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-brand-red/10 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition transform active:scale-95 cursor-pointer font-sans"
          >
            <ShoppingBag className="w-4 h-4 text-brand-yellow shrink-0" />
            Adicionar ao pedido
          </button>
        </div>

      </div>
    </div>
  );
}
