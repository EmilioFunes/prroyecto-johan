"use strict";
"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import ShoppingCart from './ShoppingCart';

export default function Navbar() {
    const router = useRouter();
    const { isLoggedIn, isAdmin, user, logout } = useAuth();
    const { totalItems } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(false);

    const handleLogout = () => {
        logout();
    };

    return (
        <>
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
                                S
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                                ShoesShop
                            </span>
                        </div>

                        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold">
                            <Link href="/" className="text-gray-900 hover:text-primary transition-colors">Novedades</Link>
                            <Link href="/" className="text-gray-700 hover:text-primary transition-colors">Hombre</Link>
                            <Link href="/" className="text-gray-700 hover:text-primary transition-colors">Mujer</Link>
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary-dark px-4 py-2 rounded-xl border border-primary/30 flex items-center gap-2 transition-all shadow-sm ring-1 ring-primary/20"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Panel de Control
                                </Link>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-2xl border border-gray-100 shadow-inner">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-xs font-bold text-gray-900">{isLoggedIn ? user.username : 'Modo Invitado'}</span>
                                    <span className={`text-[10px] uppercase tracking-widest font-bold ${isLoggedIn ? 'text-green-700' : 'text-gray-500'}`}>
                                        {isLoggedIn ? (isAdmin ? 'Administrador' : 'Usuario Verificado') : 'Acceso Público'}
                                    </span>
                                </div>
                                {isLoggedIn ? (
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                        title="Cerrar sesión"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors border border-transparent hover:border-primary/20"
                                        title="Iniciar sesión"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </Link>
                                )}
                            </div>
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-black transition-all hover:shadow-xl active:scale-95 flex items-center gap-2 relative ring-1 ring-white/10"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span>Carrito ({totalItems})</span>
                                {totalItems > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full text-[10px] flex items-center justify-center font-black animate-bounce ring-2 ring-white">
                                        {totalItems}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}
