"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ShoeCard from '@/components/ShoeCard';

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

export default function Home() {
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShoes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/shoes`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setShoes(data);
      } catch (error) {
        console.error("Failed to fetch shoes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShoes();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary/20 selection:text-primary">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-24 space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em] mb-4">
            Nueva Colección 2026
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
            Camina hacia <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">la Grandeza</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed font-medium">
            Experimenta la cumbre de la ingeniería en calzado. Nuestra selección curada combina tecnología de alto rendimiento con una estética de alto contraste.
          </p>
          <div className="pt-8 flex flex-wrap justify-center gap-4">
            <button className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-900/20 active:scale-95">
              Comprar Ahora
            </button>
            <button className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold border border-gray-200 hover:bg-gray-50 transition-all active:scale-95">
              Nuestra Historia
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="relative">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-3xl font-black text-gray-900">Lanzamientos Destacados</h2>
            <div className="h-px flex-1 bg-gray-100"></div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-[2.5rem] h-[450px] animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
              {shoes.map((shoe) => (
                <ShoeCard key={shoe.id} shoe={shoe} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/30">S</div>
              <span className="text-xl font-black text-gray-900 uppercase tracking-tighter">ShoesShop</span>
            </div>
            <div className="flex gap-10 text-sm font-bold text-gray-600 uppercase tracking-widest">
              <Link href="#" className="hover:text-primary transition-colors">Privacidad</Link>
              <Link href="#" className="hover:text-primary transition-colors">Términos</Link>
              <Link href="#" className="hover:text-primary transition-colors">Contacto</Link>
            </div>
            <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">
              © 2026 ShoesShop Artistry.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
