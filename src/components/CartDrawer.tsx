/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { X, ShoppingBag, Plus, Minus, Trash2, Send, CreditCard, Sparkles, ChefHat, AlertTriangle, Coffee, ChevronLeft, ChevronRight } from "lucide-react";
import { CartItem, Customer, Address, Product } from "../types";
import { CheckoutForm } from "./CheckoutForm";
import { optimizeImageUrl, imagePerfProps } from "../lib/imageOptimizer";
import { safeTrack } from "../lib/metaPixel";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onAdd: (product: any, quantity?: number, observation?: string) => void;
  onRemoveOne: (productId: string) => void;
  onRemoveAll: (productId: string) => void;
  customer: Customer;
  onUpdateCustomer: (customer: Customer) => void;
  address: Address;
  onUpdateAddress: (address: Address) => void;
  observation: string;
  onUpdateObservation: (observation: string) => void;
  onSubmitOrder: () => void;
  deliveryFee: number;
  allProducts: Product[];
}

export function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onAdd,
  onRemoveOne,
  onRemoveAll,
  customer,
  onUpdateCustomer,
  address,
  onUpdateAddress,
  observation,
  onUpdateObservation,
  onSubmitOrder,
  deliveryFee,
  allProducts,
}: CartDrawerProps) {
  const [showReinforceModal, setShowReinforceModal] = useState(false);

  const cartBebidasScrollRef = useRef<HTMLDivElement | null>(null);
  const cartSucosScrollRef = useRef<HTMLDivElement | null>(null);
  const cartSobremesasScrollRef = useRef<HTMLDivElement | null>(null);

  const scrollCartList = (scrollRef: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -210 : 210;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isOpen && cartItems.length > 0) {
      safeTrack("InitiateCheckout", {
        num_items: cartItems.reduce((acc, item) => acc + item.quantity, 0),
        value: cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
        currency: "BRL"
      });
    }
  }, [isOpen, cartItems.length]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const total = subtotal + deliveryFee;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  const handleFinalSubmit = () => {
    const hasBeverageOrJuice = cartItems.some(
      (item) => item.product.category === "Bebidas" || item.product.category === "Sucos Naturais"
    );
    const hasDessert = cartItems.some((item) => item.product.category === "Sobremesas");

    if (!hasBeverageOrJuice && !hasDessert) {
      setShowReinforceModal(true);
    } else {
      onSubmitOrder();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel Container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-2xl bg-stone-50 h-full flex flex-col shadow-2xl relative">
          
          {/* Header */}
          <div className="bg-brand-slate text-white px-5 py-4 flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-brand-yellow animate-pulse" />
              <h2 id="cart-drawer-title" className="font-serif text-lg font-bold">Meu Pedido Divinos</h2>
              <span className="bg-brand-red text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)} Itens
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition"
              aria-label="Fechar carrinho"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {cartItems.length === 0 ? (
              <div id="cart-empty-state" className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-red-light flex items-center justify-center text-brand-red mb-2">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-900">Seu carrinho está vazio</h3>
                <p className="text-stone-500 text-sm max-w-xs mx-auto">
                  Retorne ao cardápio e adicione nossas deliciosas opções brasileiras para começar.
                </p>
                <button
                  onClick={onClose}
                  className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2.5 px-6 rounded-xl transition text-xs uppercase tracking-wider"
                >
                  Continuar Escolhendo
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* 1. LIST OF SELECTED DISHES */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-100 shadow-sm space-y-3.5">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2.5 mb-1">
                    Itens Selecionados
                  </h3>
                  
                  <div className="divide-y divide-stone-100">
                    {cartItems.map((item) => {
                      const optimizedThumbUrl = optimizeImageUrl(item.product.image, { width: 100, quality: 70 });
                      return (
                        <div key={item.id} className="py-3.5 flex items-start gap-3.5 group">
                          <img
                            src={optimizedThumbUrl}
                            alt={item.product.name}
                            loading="lazy"
                            {...imagePerfProps}
                            className="w-14 h-14 object-cover rounded-xl shrink-0 border border-stone-100"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-sans text-sm font-bold text-stone-950 truncate leading-tight mb-0.5">
                              {item.product.name}
                            </h4>
                            <span className="text-xs text-stone-500 font-sans line-clamp-1 mb-1">
                              {item.product.category}
                            </span>
                            
                            {item.observation && (
                              <p className="text-xs text-amber-900 bg-amber-50/70 border border-amber-100/50 px-2 py-1 rounded-lg mt-1 mb-2 font-sans">
                                <span className="font-extrabold">Observação:</span> {item.observation}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              {/* Quantity buttons */}
                              <div className="flex items-center bg-stone-50 border border-stone-200/60 rounded-lg p-0.5">
                                <button
                                  type="button"
                                  onClick={() => onRemoveOne(item.id)}
                                  className="w-6 h-6 rounded hover:bg-white text-stone-600 flex items-center justify-center transition active:scale-90 cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold text-stone-900 px-2 min-w-[16px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onAdd(item.product, 1, item.observation)}
                                  className="w-6 h-6 rounded hover:bg-white text-stone-600 flex items-center justify-center transition active:scale-90 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <span className="text-stone-900 font-sans font-extrabold text-sm font-mono">
                                {formatPrice(item.product.price * item.quantity)}
                              </span>
                            </div>
                          </div>

                          {/* Remove trash */}
                          <button
                            type="button"
                            onClick={() => onRemoveAll(item.id)}
                            className="self-center p-1.5 rounded-lg text-stone-400 hover:text-brand-red hover:bg-stone-50 transition cursor-pointer"
                            title="Remover produto do pedido"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 1.5 DEDICATED HORIZONTAL RECOMMENDATIONS FOR BEBIDAS, SUCOS & SOBREMESAS */}
                {cartItems.length > 0 && (() => {
                  const listBebidas = (allProducts || []).filter(p => p.category === "Bebidas" && p.isActive !== false);
                  const listSucos = (allProducts || []).filter(p => p.category === "Sucos Naturais" && p.isActive !== false);
                  const listSobremesas = (allProducts || []).filter(p => p.category === "Sobremesas" && p.isActive !== false);

                  if (listBebidas.length === 0 && listSucos.length === 0 && listSobremesas.length === 0) return null;

                  return (
                    <div className="space-y-4 pt-4 pb-2 border-t border-b border-stone-100">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">🍰</span>
                        <h4 className="text-[11px] font-black uppercase text-stone-700 tracking-wider">
                          Deseja adicionar bebida ou sobremesa?
                        </h4>
                      </div>

                      {/* Section 1: Bebidas */}
                      {listBebidas.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5 px-0.5">
                            🥤 Refrigerantes & Cervejas <span className="text-[9px] text-stone-300 lowercase font-normal">(deslize →)</span>
                          </h5>
                          <div className="relative group/arrows">
                            {/* Left Arrow Button */}
                            <button
                              type="button"
                              onClick={() => scrollCartList(cartBebidasScrollRef, "left")}
                              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-stone-700 hover:text-black border border-stone-200/80 shadow-md p-1.5 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center opacity-85 hover:opacity-100"
                              title="Anterior"
                            >
                              <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>

                            <div 
                              ref={cartBebidasScrollRef}
                              className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-stone-100/60 pr-4 touch-pan-x"
                            >
                              {listBebidas.map((drink) => {
                                const thumbUrl = optimizeImageUrl(drink.image, { width: 80, quality: 70 });
                                return (
                                  <div
                                    key={drink.id}
                                    className="bg-stone-50 border border-stone-200/80 rounded-2xl p-2.5 flex items-center gap-2.5 shrink-0 min-w-[195px] w-[210px] shadow-sm hover:border-stone-300 transition-all font-sans"
                                  >
                                    <img
                                      src={thumbUrl}
                                      alt={drink.name}
                                      className="w-10 h-10 object-cover rounded-lg shadow-sm border border-stone-150 shrink-0"
                                      loading="lazy"
                                    />
                                    <div className="min-w-0 flex-1">
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
                                      onClick={() => onAdd(drink, 1, "")}
                                      className="bg-brand-yellow hover:bg-amber-400 text-stone-950 p-1.5 rounded-lg transition active:scale-95 cursor-pointer shrink-0"
                                      title="Adicionar ao carrinho"
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
                              onClick={() => scrollCartList(cartBebidasScrollRef, "right")}
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
                            🍹 Sucos Naturais Gelados <span className="text-[9px] text-stone-300 lowercase font-normal">(deslize →)</span>
                          </h5>
                          <div className="relative group/arrows">
                            {/* Left Arrow Button */}
                            <button
                              type="button"
                              onClick={() => scrollCartList(cartSucosScrollRef, "left")}
                              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-stone-700 hover:text-black border border-stone-200/80 shadow-md p-1.5 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center opacity-85 hover:opacity-100"
                              title="Anterior"
                            >
                              <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>

                            <div 
                              ref={cartSucosScrollRef}
                              className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-stone-100/60 pr-4 touch-pan-x"
                            >
                              {listSucos.map((drink) => {
                                const thumbUrl = optimizeImageUrl(drink.image, { width: 80, quality: 70 });
                                return (
                                  <div
                                    key={drink.id}
                                    className="bg-stone-50 border border-stone-200/85 rounded-2xl p-2.5 flex items-center gap-2.5 shrink-0 min-w-[195px] w-[210px] shadow-sm hover:border-stone-300 transition-all font-sans"
                                  >
                                    <img
                                      src={thumbUrl}
                                      alt={drink.name}
                                      className="w-10 h-10 object-cover rounded-lg shadow-sm border border-stone-150 shrink-0"
                                      loading="lazy"
                                    />
                                    <div className="min-w-0 flex-1">
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
                                      onClick={() => onAdd(drink, 1, "")}
                                      className="bg-brand-yellow hover:bg-amber-400 text-stone-950 p-1.5 rounded-lg transition active:scale-95 cursor-pointer shrink-0"
                                      title="Adicionar ao carrinho"
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
                              onClick={() => scrollCartList(cartSucosScrollRef, "right")}
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
                            🍰 Sobremesas Deliciosas <span className="text-[9px] text-stone-300 lowercase font-normal">(deslize →)</span>
                          </h5>
                          <div className="relative group/arrows">
                            {/* Left Arrow Button */}
                            <button
                              type="button"
                              onClick={() => scrollCartList(cartSobremesasScrollRef, "left")}
                              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-stone-700 hover:text-black border border-stone-200/80 shadow-md p-1.5 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center opacity-85 hover:opacity-100"
                              title="Anterior"
                            >
                              <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>

                            <div 
                              ref={cartSobremesasScrollRef}
                              className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-stone-100/60 pr-4 touch-pan-x"
                            >
                              {listSobremesas.map((dessert) => {
                                const thumbUrl = optimizeImageUrl(dessert.image, { width: 80, quality: 70 });
                                return (
                                  <div
                                    key={dessert.id}
                                    className="bg-stone-50 border border-stone-200/85 rounded-2xl p-2.5 flex items-center gap-2.5 shrink-0 min-w-[195px] w-[210px] shadow-sm hover:border-stone-300 transition-all font-sans"
                                  >
                                    <img
                                      src={thumbUrl}
                                      alt={dessert.name}
                                      className="w-10 h-10 object-cover rounded-lg shadow-sm border border-stone-150 shrink-0"
                                      loading="lazy"
                                    />
                                    <div className="min-w-0 flex-1">
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
                                      onClick={() => onAdd(dessert, 1, "")}
                                      className="bg-brand-yellow hover:bg-amber-400 text-stone-950 p-1.5 rounded-lg transition active:scale-95 cursor-pointer shrink-0"
                                      title="Adicionar ao carrinho"
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
                              onClick={() => scrollCartList(cartSobremesasScrollRef, "right")}
                              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-stone-700 hover:text-black border border-stone-200/80 shadow-md p-1.5 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center opacity-85 hover:opacity-100"
                              title="Próximo"
                            >
                              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 2. INSTANT ORDER BILL DETAILS */}
                <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm space-y-3 font-sans">
                  <div className="flex justify-between text-xs font-bold text-stone-600 uppercase tracking-wider border-b border-stone-100 pb-2">
                    <span>Resumo da Conta</span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Taxa de Entrega</span>
                    <span className="font-semibold text-stone-900">{formatPrice(deliveryFee)}</span>
                  </div>

                  <div className="flex justify-between items-baseline pt-3.5 border-t border-stone-200/60">
                    <span className="text-sm font-bold text-stone-900 uppercase tracking-wide">Total Geral</span>
                    <span className="text-xl font-sans font-black text-brand-red">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* 3. CHECKOUT ADDDRESS & CONTACT DETAILS */}
                <CheckoutForm
                  customer={customer}
                  onUpdateCustomer={onUpdateCustomer}
                  address={address}
                  onUpdateAddress={onUpdateAddress}
                  observation={observation}
                  onUpdateObservation={onUpdateObservation}
                  onSubmitOrder={handleFinalSubmit}
                />
              </div>
            )}
          </div>

          {/* Footer Action Bar */}
          {cartItems.length > 0 && (
            <div className="bg-white border-t border-stone-200/80 p-4 sm:p-5 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] z-10 font-sans">
              <button
                onClick={handleFinalSubmit}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-700/10 transition active:scale-[0.98] text-sm uppercase tracking-widest"
              >
                <Send className="w-4.5 h-4.5 animate-pulse" />
                Enviar pedido pelo WhatsApp
              </button>
              <p className="text-[10px] text-center text-stone-400 mt-2.5 font-sans">
                Ao clicar, você será redirecionado ao WhatsApp da Divinos Paulista para despachar o almoço.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* SMART CROSS-SELL REINFORCEMENT MODAL */}
      {showReinforceModal && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border-2 border-brand-yellow shadow-2xl animate-spacey">
            
            {/* Modal Header */}
            <div className="bg-brand-slate text-white p-5 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <Coffee className="w-5 h-5 text-brand-yellow" />
                <h3 className="font-serif text-lg font-bold text-white">Sabor Completo Divinos!</h3>
              </div>
              <button 
                onClick={() => setShowReinforceModal(false)}
                className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <p className="font-serif text-base font-extrabold text-stone-900 leading-snug mb-1">
                  Seu almoço está pronto, mas o que acha de uma bebida ou sobremesa para acompanhar?
                </p>
                <p className="text-xs text-stone-600 leading-normal">
                  Notamos que você não escolheu nenhuma bebida (suco natural ou refrigerante) e nenhuma sobremesa para adoçar seu dia. Adicione com 1 clique abaixo ou prossiga sem elas se preferir!
                </p>
              </div>

              {/* Recommendations Row */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Acompanhamentos ideais:</h4>
                <div className="max-h-[300px] overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-stone-50">
                  {(() => {
                    const activeProducts = allProducts || [];
                    const listBebidas = activeProducts.filter(p => p.category === "Bebidas" && p.isActive !== false);
                    const listSucos = activeProducts.filter(p => p.category === "Sucos Naturais" && p.isActive !== false);
                    const listSobremesas = activeProducts.filter(p => p.category === "Sobremesas" && p.isActive !== false);

                    const renderRecommCard = (item: Product) => {
                      const inCart = cartItems.find(c => c.product.id === item.id);
                      const isDessert = item.category === "Sobremesas";
                      return (
                        <div key={item.id} className="bg-stone-50 border border-stone-200/80 rounded-2xl p-2.5 flex items-center justify-between gap-2.5 shadow-sm hover:border-stone-300 transition-all">
                          <div className="flex items-center gap-2 min-w-0">
                            <img 
                              src={optimizeImageUrl(item.image, { width: 80, quality: 75 })} 
                              alt={item.name} 
                              className="w-10 h-10 object-cover rounded-xl border border-stone-200/60 shadow-inner block"
                            />
                            <div className="min-w-0 font-sans">
                              <p className="text-xs font-black text-stone-900 truncate leading-tight">{item.name}</p>
                              <p className="text-[10px] text-stone-500 font-sans mt-0.5">{item.category}</p>
                              <p className="text-[11px] text-emerald-700 font-extrabold mt-1">R$ {item.price.toFixed(2).replace(".", ",")}</p>
                            </div>
                          </div>
                          
                          {inCart ? (
                            <div className="flex items-center bg-white border border-stone-200/80 rounded-lg p-0.5 shrink-0 shadow-sm">
                              <button
                                type="button"
                                onClick={() => onRemoveOne(item.id)}
                                className="w-5 h-5 rounded hover:bg-stone-100 text-stone-600 flex items-center justify-center transition active:scale-90"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="text-[11px] font-extrabold text-stone-900 px-1.5 min-w-[12px] text-center">
                                {inCart.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onAdd(item)}
                                className="w-5 h-5 rounded hover:bg-stone-100 text-stone-600 flex items-center justify-center transition active:scale-90"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onAdd(item)}
                              className={`text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl transition cursor-pointer shrink-0 flex items-center gap-0.5 active:scale-95 ${
                                isDessert 
                                  ? "bg-brand-red text-white hover:bg-brand-red-dark" 
                                  : "bg-brand-yellow text-stone-950 hover:bg-amber-400"
                              }`}
                            >
                              <Plus className="w-3 h-3 stroke-[3]" /> Adicionar
                            </button>
                          )}
                        </div>
                      );
                    };

                    return (
                      <>
                        {/* Refrigerantes (Bebidas) */}
                        {listBebidas.length > 0 && (
                          <div className="space-y-1.5">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 sticky top-0 bg-white py-1 z-10 flex items-center gap-1">
                              <span>🥤</span> Refrigerantes & Bebidas
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {listBebidas.map(renderRecommCard)}
                            </div>
                          </div>
                        )}

                        {/* Sucos Naturais */}
                        {listSucos.length > 0 && (
                          <div className="space-y-1.5">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 sticky top-0 bg-white py-1 z-10 flex items-center gap-1">
                              <span>🍹</span> Sucos Naturais
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {listSucos.map(renderRecommCard)}
                            </div>
                          </div>
                        )}

                        {/* Sobremesas */}
                        {listSobremesas.length > 0 && (
                          <div className="space-y-1.5">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 sticky top-0 bg-white py-1 z-10 flex items-center gap-1">
                              <span>🍰</span> Sobremesas Geladas
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {listSobremesas.map(renderRecommCard)}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="bg-stone-50 border-t border-stone-100 p-5 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowReinforceModal(false);
                  onSubmitOrder();
                }}
                className="w-full sm:flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-950 font-black py-3 px-4 rounded-xl text-[10px] uppercase tracking-widest transition text-center cursor-pointer order-2 sm:order-1"
              >
                Não, enviar assim mesmo
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReinforceModal(false);
                }}
                className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-700/10 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 order-1 sm:order-2"
              >
                Escolher Bebida/Sobremesa
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
