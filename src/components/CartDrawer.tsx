/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, ShoppingBag, Plus, Minus, Trash2, Send, CreditCard } from "lucide-react";
import { CartItem, Customer, Address } from "../types";
import { CheckoutForm } from "./CheckoutForm";

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
}: CartDrawerProps) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const total = subtotal + deliveryFee;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
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
                    {cartItems.map((item) => (
                      <div key={item.product.id} className="py-3.5 flex items-start gap-3.5 group">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
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
                    ))}
                  </div>
                </div>

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
                  onSubmitOrder={onSubmitOrder}
                />
              </div>
            )}
          </div>

          {/* Footer Action Bar */}
          {cartItems.length > 0 && (
            <div className="bg-white border-t border-stone-200/80 p-4 sm:p-5 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] z-10 font-sans">
              <button
                onClick={onSubmitOrder}
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
    </div>
  );
}
