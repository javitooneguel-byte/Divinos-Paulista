/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { X, ShoppingBag, Plus, Minus, Trash2, Send, CreditCard, Sparkles, ChefHat, AlertTriangle, Coffee } from "lucide-react";
import { CartItem, Customer, Address, Product } from "../types";
import { CheckoutForm } from "./CheckoutForm";
import { optimizeImageUrl, imagePerfProps } from "../lib/imageOptimizer";
import { safeTrack } from "../lib/metaPixel";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onAdd: (product: any) => void;
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
                        <div key={item.product.id} className="py-3.5 flex items-start gap-3.5 group">
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
                            <span className="text-xs text-stone-500 font-sans line-clamp-1 mb-2">
                              {item.product.category}
                            </span>
                            
                            <div className="flex items-center justify-between">
                              {/* Quantity buttons */}
                              <div className="flex items-center bg-stone-50 border border-stone-200/60 rounded-lg p-0.5">
                                <button
                                  type="button"
                                  onClick={() => onRemoveOne(item.product.id)}
                                  className="w-6 h-6 rounded hover:bg-white text-stone-600 flex items-center justify-center transition active:scale-90"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold text-stone-900 px-2 min-w-[16px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onAdd(item.product)}
                                  className="w-6 h-6 rounded hover:bg-white text-stone-600 flex items-center justify-center transition active:scale-90"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <span className="text-stone-900 font-sans font-extrabold text-sm">
                                {formatPrice(item.product.price * item.quantity)}
                              </span>
                            </div>
                          </div>

                          {/* Remove trash */}
                          <button
                            type="button"
                            onClick={() => onRemoveAll(item.product.id)}
                            className="self-center p-1.5 rounded-lg text-stone-400 hover:text-brand-red hover:bg-stone-50 transition"
                            title="Remover produto do pedido"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 1.5 CONTEXTUAL UPSELL RECOMMENDATIONS BASED ON USER SELECTIONS */}
                {cartItems.length > 0 && (() => {
                  const hasJuice = cartItems.some(item => item.product.category === "Sucos Naturais");
                  const hasDessert = cartItems.some(item => item.product.category === "Sobremesas");

                  // If user has not added any natural juices, show juices!
                  if (!hasJuice) {
                    const juices = (allProducts || []).filter(p => p.category === "Sucos Naturais" && p.isActive !== false).slice(0, 3);
                    if (juices.length > 0) {
                      return (
                        <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-2xl space-y-3 shadow-inner">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🍹</span>
                            <h4 className="text-xs font-black uppercase text-amber-905 tracking-wider">
                              Que tal um Suco natural preparado na hora para acompanhar o almoço?
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {juices.map(juice => (
                              <div key={juice.id} className="bg-white border border-amber-100 rounded-xl p-2.5 flex sm:flex-col items-center justify-between sm:justify-center gap-2 text-center shadow-sm hover:border-brand-yellow/65 transition-all">
                                <div className="flex sm:flex-col items-center gap-2 text-left sm:text-center w-3/4 sm:w-auto">
                                  <img 
                                    src={optimizeImageUrl(juice.image, { width: 100, quality: 70 })} 
                                    alt={juice.name} 
                                    className="w-10 h-10 object-cover rounded-lg shadow-sm block"
                                    loading="lazy"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-bold text-stone-900 text-[11px] leading-tight line-clamp-2">{juice.name}</p>
                                    <p className="text-[10px] text-amber-700 font-extrabold mt-0.5">R$ {juice.price.toFixed(2).replace(".", ",")}</p>
                                  </div>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => onAdd(juice)}
                                  className="bg-brand-yellow hover:bg-amber-400 text-stone-950 font-black text-[10px] px-2.5 py-1.5 rounded-lg transition uppercase tracking-wide flex items-center gap-1 active:scale-95 cursor-pointer shrink-0"
                                >
                                  <Plus className="w-3 h-3 stroke-[3]" /> Adicionar
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  }

                  // If user has added a juice, but hasn't added any dessert!
                  if (hasJuice && !hasDessert) {
                    const desserts = (allProducts || []).filter(p => p.category === "Sobremesas" && p.isActive !== false).slice(0, 3);
                    if (desserts.length > 0) {
                      return (
                        <div className="bg-rose-50/60 border border-rose-200 p-4 rounded-2xl space-y-3 shadow-inner">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🍰</span>
                            <h4 className="text-xs font-black uppercase text-rose-950 tracking-wider">
                              E para fechar com chave de ouro... Que tal uma sobremesa gelada?
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {desserts.map(dessert => (
                              <div key={dessert.id} className="bg-white border border-rose-100 rounded-xl p-2.5 flex sm:flex-col items-center justify-between sm:justify-center gap-2 text-center shadow-sm hover:border-brand-red/40 transition-all">
                                <div className="flex sm:flex-col items-center gap-2 text-left sm:text-center w-3/4 sm:w-auto">
                                  <img 
                                    src={optimizeImageUrl(dessert.image, { width: 100, quality: 70 })} 
                                    alt={dessert.name} 
                                    className="w-10 h-10 object-cover rounded-lg shadow-sm block"
                                    loading="lazy"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-bold text-stone-900 text-[11px] leading-tight line-clamp-2">{dessert.name}</p>
                                    <p className="text-[10px] text-rose-700 font-extrabold mt-0.5">R$ {dessert.price.toFixed(2).replace(".", ",")}</p>
                                  </div>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => onAdd(dessert)}
                                  className="bg-brand-red hover:bg-brand-red-dark text-white font-black text-[10px] px-2.5 py-1.5 rounded-lg transition uppercase tracking-wide flex items-center gap-1 active:scale-95 cursor-pointer shrink-0"
                                >
                                  <Plus className="w-3 h-3 stroke-[3]" /> Adicionar
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  }

                  return null;
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
