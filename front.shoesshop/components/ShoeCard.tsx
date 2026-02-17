import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

interface Shoe {
    id: number;
    name: string;
    brand: string;
    price: number;
    imageUrl: string;
    size: number;
    description: string;
}

export default function ShoeCard({ shoe }: { shoe: Shoe }) {
    const { addToCart } = useCart();
    const [selectedSize, setSelectedSize] = useState<number | ''>('');

    // Generate some sizes around the base size
    const availableSizes = [shoe.size - 1, shoe.size - 0.5, shoe.size, shoe.size + 0.5, shoe.size + 1].filter(s => s > 0);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (selectedSize === '') {
            alert('Please select a size first');
            return;
        }

        addToCart(shoe, Number(selectedSize));
    };

    return (
        <div className="group relative flex flex-col h-full bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2">
            <Link href={`/shoes/${shoe.id}`} className="absolute inset-0 z-10" aria-label={`View details for ${shoe.name}`} />

            <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-50">
                <Image
                    src={shoe.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80"}
                    alt={shoe.name}
                    fill
                    priority={shoe.id <= 3}
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute top-6 right-6 z-20">
                    <span className="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-black bg-white text-gray-900 shadow-xl ring-1 ring-black/5">
                        ${shoe.price.toFixed(2)}
                    </span>
                </div>
                {/* Overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <div className="flex flex-col flex-1 p-8">
                <div className="mb-4">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">
                        {shoe.brand}
                    </p>
                    <h3 className="text-2xl font-black text-gray-900 leading-tight group-hover:text-primary transition-colors">
                        {shoe.name}
                    </h3>
                </div>

                <p className="text-sm text-gray-600 font-medium leading-relaxed mb-6 flex-1 line-clamp-2">
                    {shoe.description}
                </p>

                <div className="mt-auto space-y-6 pt-6 border-t border-gray-50">
                    <div className="flex items-center justify-between gap-4 relative z-30">
                        <div className="flex-1">
                            <label className="sr-only">Select Size</label>
                            <div className="relative">
                                <select
                                    value={selectedSize}
                                    onChange={(e) => setSelectedSize(Number(e.target.value))}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all cursor-pointer appearance-none uppercase tracking-widest"
                                >
                                    <option value="" disabled>Size</option>
                                    {availableSizes.map(s => (
                                        <option key={s} value={s}>US {s}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            className={`flex-[1.5] py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 text-center shadow-lg active:scale-95 ${selectedSize === ''
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-100'
                                : 'bg-gray-900 text-white hover:bg-primary shadow-gray-900/10 hover:shadow-primary/30'
                                }`}
                        >
                            Add To Bag
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
