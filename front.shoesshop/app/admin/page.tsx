"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Shoe {
    id: number;
    name: string;
    brand: string;
    price: number;
    size: number;
    description: string;
    imageUrl: string;
}

interface User {
    id: number;
    username: string;
    passwordHash: string;
    role: string;
}

export default function AdminDashboard() {
    return (
        <ProtectedRoute>
            <AdminContent />
        </ProtectedRoute>
    );
}

function AdminContent() {
    const { logout } = useAuth();
    const [shoes, setShoes] = useState<Shoe[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState<'products' | 'users'>('products');
    const [showUserForm, setShowUserForm] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'Guest' });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const [editingId, setEditingId] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        price: '',
        size: '',
        description: '',
        imageUrl: ''
    });

    useEffect(() => {
        fetchShoes();
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchShoes = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/shoes`);
            if (res.ok) {
                const data = await res.json();
                setShoes(data);
            }
        } catch (error) {
            console.error("Error fetching shoes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (shoe: Shoe) => {
        setFormData({
            name: shoe.name,
            brand: shoe.brand,
            price: shoe.price.toString(),
            size: shoe.size.toString(),
            description: shoe.description,
            imageUrl: shoe.imageUrl
        });
        setEditingId(shoe.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setFormData({ name: '', brand: '', price: '', size: '', description: '', imageUrl: '' });
        setEditingId(null);
    };

    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const token = localStorage.getItem('token');
        if (!token) {
            alert("No security token found. Please log in again.");
            return;
        }

        console.log("Token for upload:", token);
        setUploading(true);
        const fileFormData = new FormData();
        fileFormData.append('file', file);

        try {
            const res = await fetch(`${API_BASE_URL}/upload/image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: fileFormData
            });

            if (res.ok) {
                const data = await res.json();
                setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }));
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(errorData.message || `Upload failed: ${res.statusText}`);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Connection error during upload.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Access denied. Token missing.");
            return;
        }

        // Basic validation
        const price = parseFloat(formData.price);
        const size = parseFloat(formData.size);

        if (isNaN(price) || isNaN(size)) {
            alert("Please enter valid numeric values for price and size.");
            return;
        }

        try {
            const shoeData = {
                id: editingId || 0,
                name: formData.name,
                brand: formData.brand,
                price: price,
                size: size,
                description: formData.description,
                imageUrl: formData.imageUrl
            };

            const url = editingId
                ? `${API_BASE_URL}/shoes/${editingId}`
                : `${API_BASE_URL}/shoes`;

            const method = editingId ? 'PUT' : 'POST';

            console.log("Submitting shoe info with token:", token);
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(shoeData)
            });

            if (res.ok) {
                // For POST, we might get the new object back
                const savedShoe = method === 'POST' ? await res.json() : null;

                if (method === 'POST' && savedShoe) {
                    setShoes(prev => [savedShoe, ...prev]);
                } else {
                    // Refetch or update locally
                    fetchShoes();
                }

                alert(editingId ? 'Product updated successfully' : 'Product released successfully');
                handleCancelEdit();
            } else {
                const errorText = await res.text();
                alert(`Error: ${res.status} - ${errorText || 'Failed to save product'}`);
            }
        } catch (error) {
            console.error("Error saving shoe:", error);
            alert("Network error while saving the product.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to permanently delete this item?')) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        console.log("Deleting shoe with token:", token);
        try {
            const res = await fetch(`${API_BASE_URL}/shoes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                setShoes(prev => prev.filter(s => s.id !== id));
                if (editingId === id) handleCancelEdit();
            } else {
                alert(`Delete failed: ${res.statusText}`);
            }
        } catch (error) {
            console.error("Error deleting shoe:", error);
            alert("Network error during deletion.");
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: newUser.username,
                    passwordHash: newUser.password, // Existing logic uses plain pass as hash
                    role: newUser.role
                })
            });

            if (res.ok) {
                const createdUser = await res.json();
                setUsers(prev => [...prev, createdUser]);
                setNewUser({ username: '', password: '', role: 'Guest' });
                setShowUserForm(false);
                alert('Usuario creado con éxito');
            } else {
                const error = await res.text();
                alert(`Error al crear usuario: ${error}`);
            }
        } catch (error) {
            console.error("Error creating user:", error);
        }
    };

    const handleUpdateUserRole = async (user: User, newRole: string) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...user, role: newRole })
            });

            if (res.ok) {
                setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                alert('Rol de usuario actualizado');
            } else {
                alert('No se pudo actualizar el rol');
            }
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== id));
            } else {
                alert('No se pudo eliminar el usuario');
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-900 font-bold uppercase tracking-widest text-sm">Cargando inventario...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50/50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Panel de Administración</h1>
                    <div className="flex gap-4 mt-4">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'products' ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Productos
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Usuarios
                        </button>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="group flex items-center gap-2 bg-red-50 text-red-700 px-6 py-3 rounded-2xl font-bold hover:bg-red-700 hover:text-white transition-all border border-red-200 shadow-sm active:scale-95"
                >
                    <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar Sesión
                </button>
            </div>

            {activeTab === 'products' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Add/Edit Product Form */}
                    <div className="lg:col-span-4">
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-24 ring-1 ring-black/[0.02]">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-gray-900">{editingId ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h2>
                                {editingId && (
                                    <button onClick={handleCancelEdit} className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors uppercase tracking-widest">Cancelar</button>
                                )}
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Nombre del Zapato</label>
                                    <input name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all placeholder:text-gray-500 text-gray-900" placeholder="Ej. Air Max Cloud" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Marca</label>
                                    <input name="brand" value={formData.brand} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all placeholder:text-gray-500 text-gray-900" placeholder="Ej. Nike, Adidas..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Precio ($)</label>
                                        <input name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all text-gray-900" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Talla (US)</label>
                                        <input name="size" type="number" step="0.5" value={formData.size} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all text-gray-900" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Visual del Producto</label>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-center w-full">
                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <svg className="w-8 h-8 mb-3 text-gray-500" fill="none" viewBox="0 0 20 16" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 000-6h-.025A5.56 5.56 0 0016 6.5 5.5 5.5 0 005.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 000 8h2.167M10 15V6m0 0L8 8m2-2l2 2" />
                                                    </svg>
                                                    <p className="text-xs text-gray-700 font-bold uppercase tracking-tight">Subir imagen HD</p>
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                        {uploading && <p className="text-xs text-primary font-black animate-pulse text-center">ENCRIPTANDO Y SUBIENDO...</p>}
                                        <div className="relative">
                                            <input
                                                name="imageUrl"
                                                value={formData.imageUrl}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all text-gray-800"
                                                placeholder="O pega el enlace de la imagen..."
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Descripción</label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} required className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all text-gray-900" placeholder="¿Cómo describirías esta obra maestra?" />
                                </div>
                                <button type="submit" className={`w-full text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl active:scale-[0.98] ${editingId ? 'bg-green-600 hover:bg-green-700 shadow-green-600/30' : 'bg-primary hover:bg-primary-dark shadow-primary/30'}`}>
                                    {editingId ? 'Actualizar Producto' : 'Lanzar Producto'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Product List */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-black text-gray-900">Estado del Inventario <span className="text-gray-600 font-medium ml-2">({shoes.length})</span></h2>
                        </div>
                        {shoes.map(shoe => (
                            <div key={shoe.id} className={`group bg-white p-6 rounded-3xl shadow-sm border flex flex-col sm:flex-row items-center gap-6 transition-all hover:shadow-xl hover:-translate-y-1 ${editingId === shoe.id ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-gray-100'}`}>
                                <div className="relative h-32 w-32 flex-shrink-0 bg-gray-100 rounded-2xl overflow-hidden shadow-inner">
                                    <Image src={shoe.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff"} alt={shoe.name} fill className="object-cover transition-transform group-hover:scale-110 duration-500" />
                                </div>
                                <div className="flex-1 min-w-0 text-center sm:text-left">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                        <h3 className="text-xl font-black text-gray-900 truncate uppercase tracking-tight">{shoe.name}</h3>
                                        <span className="inline-block text-lg font-black text-green-700 bg-green-50 px-3 py-1 rounded-xl border border-green-100">
                                            ${shoe.price.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-3">
                                        <span className="text-xs font-black text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10 uppercase">{shoe.brand}</span>
                                        <span className="text-xs font-black text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg uppercase">Talla {shoe.size} US</span>
                                    </div>
                                    <p className="text-sm text-gray-700 font-medium line-clamp-1">{shoe.description}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleEdit(shoe)}
                                        className="p-3 bg-blue-50 text-blue-700 hover:bg-primary hover:text-white rounded-2xl transition-all shadow-sm border border-blue-100 active:scale-90"
                                        title="Editar Producto"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(shoe.id)}
                                        className="p-3 bg-red-50 text-red-700 hover:bg-red-700 hover:text-white rounded-2xl transition-all shadow-sm border border-red-100 active:scale-90"
                                        title="Eliminar Producto"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">Gestión de Usuarios</h2>
                            <p className="text-gray-600 font-medium">Administra los roles y el acceso a la plataforma.</p>
                        </div>
                        <button
                            onClick={() => setShowUserForm(!showUserForm)}
                            className="bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg active:scale-95 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {showUserForm ? 'Cancelar' : 'Nuevo Usuario'}
                        </button>
                    </div>

                    {showUserForm && (
                        <div className="p-8 bg-gray-50 border-b border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
                            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                                <div>
                                    <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Usuario</label>
                                    <input
                                        required
                                        value={newUser.username}
                                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none text-gray-900"
                                        placeholder="Username"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Contraseña</label>
                                    <input
                                        required
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none text-gray-900"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Rol</label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none text-gray-900"
                                    >
                                        <option value="Guest">Guest</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                                >
                                    Guardar Usuario
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-4 text-xs font-black text-gray-900 uppercase tracking-widest">ID</th>
                                    <th className="px-8 py-4 text-xs font-black text-gray-900 uppercase tracking-widest">Username</th>
                                    <th className="px-8 py-4 text-xs font-black text-gray-900 uppercase tracking-widest">Rol</th>
                                    <th className="px-8 py-4 text-xs font-black text-gray-900 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6 text-sm font-bold text-gray-500">#{user.id}</td>
                                        <td className="px-8 py-6 text-sm font-black text-gray-900">{user.username}</td>
                                        <td className="px-8 py-6">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleUpdateUserRole(user, e.target.value)}
                                                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-primary focus:border-primary block p-2.5 outline-none"
                                            >
                                                <option value="Guest">Guest</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                disabled={user.username === 'admin'}
                                                className="p-3 bg-red-50 text-red-700 hover:bg-red-700 hover:text-white rounded-2xl transition-all shadow-sm border border-red-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
