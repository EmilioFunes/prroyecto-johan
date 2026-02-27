"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api';

export default function LoginPage() {
    const { login } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (isRegistering) {
                const res = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || 'Error al registrar el usuario');
                }

                setSuccess('¡Cuenta creada correctamente! Ahora puedes ingresar.');
                setIsRegistering(false);
                setPassword('');
            } else {
                const res = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        throw new Error('Usuario o contraseña incorrectos');
                    }
                    throw new Error('Algo salió mal');
                }

                const data = await res.json();
                login(data.token);

                const payload = JSON.parse(atob(data.token.split('.')[1]));
                const rawRole = payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
                const isAdmin = ['Administrator', 'Admin', 'admin'].includes(rawRole);

                if (isAdmin) {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="w-full max-w-md space-y-10 bg-white p-12 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 ring-1 ring-black/[0.01]">
                <div className="text-center">
                    <div className="inline-flex h-16 w-16 bg-primary/5 rounded-3xl items-center justify-center mb-6 ring-1 ring-primary/10">
                        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-4.44-5.071c.604-2.153 1.117-4.425 1.117-6.5C6 4.607 8.686 2 12 2s6 2.607 6 6c0 2.075-.513 4.347-1.117 6.5m-4.44 5.071c1.744-2.772 2.753-5.954 2.753-9.571m-10.07 10.071c.734-.734 1.824-1.126 2.863-.883m7.544 0c1.039-.243 2.129.149 2.863.883m-10.707-10c1.744 2.772 2.753 5.954 2.753 9.571m-1.117-10.142A2 2 0 0010 7a2 2 0 00-2 2" />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                        {isRegistering ? 'Crear Cuenta' : 'Acceso de Seguridad'}
                    </h2>
                    <p className="mt-3 text-sm text-gray-500 font-bold uppercase tracking-widest">
                        {isRegistering ? 'Únete a nuestra comunidad' : 'Verifique su identidad para continuar'}
                    </p>
                </div>
                <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        <div className="relative group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] absolute left-4 -top-2.5 bg-white px-2 z-10 transition-colors group-focus-within:text-primary">Usuario</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="appearance-none block w-full px-5 py-4 border border-gray-200 placeholder-gray-300 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-sm transition-all bg-gray-50/50 focus:bg-white"
                                placeholder={isRegistering ? "Elige un usuario" : "admin / guest"}
                            />
                        </div>
                        <div className="relative group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] absolute left-4 -top-2.5 bg-white px-2 z-10 transition-colors group-focus-within:text-primary">Token de Acceso</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none block w-full px-5 py-4 border border-gray-200 placeholder-gray-300 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-sm transition-all bg-gray-50/50 focus:bg-white"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-danger text-xs font-bold text-center bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center justify-center gap-2 animate-shake">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="text-success text-xs font-bold text-center bg-green-50 p-4 rounded-2xl border border-green-100 flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {success}
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-xs font-black uppercase tracking-widest rounded-2xl text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all duration-300 shadow-xl shadow-gray-900/20 active:scale-[0.98]"
                        >
                            {isRegistering ? 'Crear Cuenta' : 'Ingresar al Panel'}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                setError('');
                                setSuccess('');
                            }}
                            className="w-full text-center text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors py-2"
                        >
                            {isRegistering ? '¿Ya tienes cuenta? Ingresa aquí' : '¿No tienes cuenta? Regístrate gratis'}
                        </button>
                    </div>
                </form>

                {!isRegistering && (
                    <div className="text-center bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Credenciales de Prueba</p>
                        <div className="flex justify-center gap-6 text-xs font-bold text-gray-600">
                            <div className="flex flex-col">
                                <span className="text-primary">admin</span>
                                <span>admin123</span>
                            </div>
                            <div className="w-px bg-gray-200 h-8"></div>
                            <div className="flex flex-col">
                                <span className="text-gray-900">Guest</span>
                                <span>guest123</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
