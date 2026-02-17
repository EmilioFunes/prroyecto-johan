"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { API_BASE_URL } from '@/lib/api';

interface Shoe {
    id: number;
    name: string;
    brand: string;
    price: number;
    imageUrl: string;
    size: number;
    description: string;
}

export default function ShoeDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [shoe, setShoe] = useState<Shoe | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchShoe = async () => {
            try {
                // In a real app, you'd fetch specific ID from backend
                // Since this is a demo and backend returns all, we might fetch all and filter
                // But better to implement GetById on backend. I added GetShoes but strictly it returns all.
                // Wait, I should implement GetById on backend.
                // Assuming backend has GetById or similar. The ShoesController has GetShoes but not GetShoe(id).
                // Optimized to use the dedicated GetShoe endpoint
                const res = await fetch(`${API_BASE_URL}/shoes/${id}`);
                if (!res.ok) throw new Error('Failed to load shoe details');
                const data: Shoe = await res.json();
                setShoe(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchShoe();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!shoe) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
            Product not found.
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <button onClick={() => router.back()} className="mb-8 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                    ← Back to collection
                </button>

                <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
                    {/* Image Gallery */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-gray-100 shadow-md">
                        <Image
                            src={shoe.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff"}
                            alt={shoe.name}
                            fill
                            className="object-cover object-center"
                            priority
                        />
                    </div>

                    {/* Product Info */}
                    <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-medium text-blue-600 uppercase tracking-widest">
                                {shoe.brand}
                            </h2>
                            <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                                <span className="text-gray-400 text-xs ml-2">(48 reviews)</span>
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">{shoe.name}</h1>

                        <div className="mt-3">
                            <p className="text-3xl tracking-tight text-gray-900 mb-6">${shoe.price.toFixed(2)}</p>
                        </div>

                        <div className="mt-6">
                            <h3 className="sr-only">Description</h3>
                            <div className="text-base text-gray-500 space-y-6 leading-relaxed">
                                {shoe.description}
                                <p>Designed for those who demand excellence in every step. This premium implementation features state-of-the-art materials and a silhouette that defines modern footwear.</p>
                            </div>
                        </div>

                        <div className="mt-10 border-t border-gray-200 pt-10">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-sm font-medium text-gray-900">Select Size</span>
                                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">Size guide</a>
                            </div>

                            <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 lg:grid-cols-4">
                                {[7, 8, 8.5, 9, 9.5, 10, 10.5, 11].map((size) => (
                                    <button
                                        key={size}
                                        className={`group relative flex items-center justify-center rounded-xl border py-3 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none sm:flex-1 cursor-pointer transition-all ${Math.abs(shoe.size - size) < 0.1 ? 'ring-2 ring-blue-500 border-transparent bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-900 shadow-sm'}`}
                                    >
                                        <span>{size}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-10 flex w-full gap-4">
                            <button
                                type="submit"
                                className="flex-1 flex items-center justify-center rounded-xl border border-transparent bg-gray-900 px-8 py-4 text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all shadow-xl shadow-gray-900/20 active:scale-[0.99]"
                            >
                                Add to bag
                            </button>
                            <button
                                type="button"
                                className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-400 hover:bg-gray-50 hover:text-gray-500 transition-colors"
                            >
                                <span className="sr-only">Favorites</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
