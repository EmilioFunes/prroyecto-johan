"use client";

import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import { useState } from 'react';

interface CartProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ShoppingCart({ isOpen, onClose }: CartProps) {
    const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleCheckout = () => {
        setIsCheckingOut(true);
        // Simulate processing
        setTimeout(() => {
            clearCart();
            setIsCheckingOut(false);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                onClose();
            }, 3000);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity duration-500" onClick={onClose} />

            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-[0_0_100px_rgba(0,0,0,0.2)] flex flex-col animate-in slide-in-from-right duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
                <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-white">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Bag</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                            {items.length} {items.length === 1 ? 'Item' : 'Items'} Ready to Ship
                        </p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-gray-50 text-gray-900 hover:bg-gray-900 hover:text-white rounded-2xl transition-all border border-gray-100">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                    {showSuccess ? (
                        <div className="text-center py-32 animate-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 ring-1 ring-green-100">
                                <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-widest">¡Compra Completada!</h3>
                            <p className="text-gray-500 text-sm font-bold mt-2">Tu pedido está en camino.</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-32">
                            <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ring-1 ring-gray-100">
                                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-black text-gray-300 uppercase tracking-widest">Cart Isolated</h3>
                            <p className="text-gray-400 text-xs font-bold mt-2 uppercase tracking-tight">Add some heat to your collection</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={`${item.id}-${item.selectedSize}`} className="flex gap-6 group">
                                <div className="relative h-24 w-24 flex-shrink-0 bg-gray-50 rounded-3xl overflow-hidden shadow-inner border border-gray-100">
                                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover transition-transform group-hover:scale-110 duration-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-base font-black text-gray-900 truncate uppercase tracking-tight">{item.name}</h3>
                                        <button
                                            onClick={() => removeFromCart(item.id, item.selectedSize)}
                                            className="text-gray-300 hover:text-red-600 transition-colors p-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">{item.brand} • US {item.selectedSize}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-1 shadow-inner">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white text-gray-900 hover:bg-gray-900 hover:text-white rounded-lg transition-all shadow-sm"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                </svg>
                                            </button>
                                            <span className="w-6 text-center text-xs font-black text-gray-900">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white text-gray-900 hover:bg-gray-900 hover:text-white rounded-lg transition-all shadow-sm"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </button>
                                        </div>
                                        <span className="text-base font-black text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-8 border-t border-gray-100 bg-white space-y-6">
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Subtotal</span>
                        <span className="text-3xl font-black text-gray-900 tracking-tighter">${totalPrice.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={items.length === 0 || isCheckingOut}
                        className="w-full bg-gray-900 text-white py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-gray-900/30 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                    >
                        {isCheckingOut ? 'Processing...' : 'Secure Checkout'}
                        {!isCheckingOut && (
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4 4H3" />
                            </svg>
                        )}
                    </button>
                    {items.length > 0 && (
                        <button onClick={clearCart} className="w-full text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-red-600 transition-colors">
                            Purge All Items
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
