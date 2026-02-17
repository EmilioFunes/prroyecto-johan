"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
    id: number;
    name: string;
    brand: string;
    price: number;
    imageUrl: string;
    quantity: number;
    selectedSize: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, 'quantity' | 'selectedSize'>, size: number) => void;
    removeFromCart: (id: number, size: number) => void;
    updateQuantity: (id: number, size: number, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart from localStorage', e);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (item: Omit<CartItem, 'quantity' | 'selectedSize'>, size: number) => {
        setItems(prevItems => {
            const existingItem = prevItems.find(i => i.id === item.id && i.selectedSize === size);
            if (existingItem) {
                return prevItems.map(i =>
                    (i.id === item.id && i.selectedSize === size) ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prevItems, { ...item, quantity: 1, selectedSize: size }];
        });
    };

    const removeFromCart = (id: number, size: number) => {
        setItems(prevItems => prevItems.filter(item => !(item.id === id && item.selectedSize === size)));
    };

    const updateQuantity = (id: number, size: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id, size);
            return;
        }
        setItems(prevItems =>
            prevItems.map(item =>
                (item.id === id && item.selectedSize === size) ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
