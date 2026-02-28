'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [kodeKegiatan, setKodeKegiatan] = useState('');
  const [projectAktif, setProjectAktif] = useState(''); 
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pesanError, setPesanError] = useState('');

  // --- STATE UNTUK MODAL LOGIN ---
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  const router = useRouter();

  const cariData = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setPesanError('');
    setFiles([]);

    try {
      const res = await fetch(`/api/search?q=${kodeKegiatan.toLowerCase()}`);
      const data = await res.json();

      if (!res.ok) {
        setPesanError(data.error);
      } else {
        setFiles(data.files);
        setProjectAktif(kodeKegiatan);
      }
    } catch (err) {
      setPesanError('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push('/admin'); 
      } else {
        const data = await res.json();
        setLoginError(data.error);
      }
    } catch (err) {
      setLoginError('Gagal login. Cek koneksi.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div 
      className="h-screen overflow-hidden relative flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 font-sans text-gray-800 bg-fixed bg-center bg-cover"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80')" }}
    >
      
      <div className="absolute inset-0 z-0 bg-white/70 backdrop-blur-[6px]"></div>

      {/* Kotak Utama */}
      <div className="relative z-10 max-w-4xl w-full flex flex-col bg-white/85 backdrop-blur-2xl p-8 md:p-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,100,100,0.2)] border border-white transition-all max-h-[95vh]">
        
        {/* Header Section */}
        <div className="text-center flex-shrink-0">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-400 shadow-lg mb-4 transform hover:scale-105 transition-transform">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-emerald-600 tracking-tight mb-2">
            Portal Data Spasial
          </h1>
          <p className="text-gray-600 text-base font-medium">
            Sistem Unduh Arsip Pemetaan & Dokumen Lingkungan
          </p>
        </div>

        {/* Form Pencarian */}
        <form onSubmit={cariData} className="mt-6 relative max-w-xl mx-auto w-full flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Contoh: 2026_02_PerumNdalemAsri3"
                className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm text-base transition-all"
                value={kodeKegiatan}
                onChange={(e) => setKodeKegiatan(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-bold rounded-2xl text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? 'Mencari...' : 'Cari Data'}
            </button>
          </div>
        </form>

        {pesanError && (
          <div className="mt-4 max-w-xl mx-auto w-full bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm flex-shrink-0">
            <p className="text-sm font-medium text-red-800">{pesanError}</p>
          </div>
        )}

        {/* Hasil Pencarian */}
        {files.length > 0 && (
          <div className="mt-8 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500 border-t border-gray-200 pt-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-0 overflow-hidden">
              
              {/* Header Hasil - DENGAN STATUS PEMBAYARAN */}
              <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-teal-50/30 flex-shrink-0">
                <div>
                  <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Status Proyek</h3>
                  <p className="text-xl font-extrabold text-gray-800 truncate max-w-[250px] sm:max-w-sm">{projectAktif}</p>
                  
                  {/* LABEL PENGINGAT PEMBAYARAN */}
                  <div className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-[10px] font-bold border ${
                    files[0]?.description === 'Lunas' 
                    ? 'bg-green-50 text-green-600 border-green-200' 
                    : 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse'
                  }`}>
                    {files[0]?.description === 'Lunas' ? '● PEMBAYARAN TERKONFIRMASI' : '● MENUNGGU PELUNASAN'}
                  </div>
                </div>
                
                <a
                  href={`/api/download-folder?name=${encodeURIComponent(projectAktif.toLowerCase())}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all group"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Unduh Paket (.zip)
                </a>
              </div>

              {/* Daftar File */}
              <div className="p-5 bg-gray-50/40 overflow-y-auto max-h-[40vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {files.map((file) => {
                    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                    return (
                      <li key={file.id} className="flex items-center p-3.5 bg-white border border-gray-200 rounded-xl hover:border-teal-400 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                        <div className="flex-shrink-0 mr-3.5">
                          {isFolder ? (
                            <div className="p-2 bg-amber-100 rounded-lg text-amber-600 group-hover:bg-amber-200 transition-colors">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                              </svg>
                            </div>
                          ) : (
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-200 transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-700 truncate group-hover:text-teal-700 transition-colors">
                            {file.name}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              
            </div>
          </div>
        )}
      </div>

      {/* Footer Kecil dengan Link Admin Pop-out */}
      <div className="relative z-10 mt-8 text-center flex-shrink-0 drop-shadow-md">
        <p className="text-xs text-gray-500 font-semibold italic">
          &copy; {new Date().getFullYear()} Database Peta Irfan
        </p>
        
        <div className="mt-2 h-5">
          <button 
            onClick={() => setShowLogin(true)}
            className="text-[10px] text-gray-400/30 hover:text-teal-600 transition-all duration-300 flex items-center justify-center gap-1 group mx-auto w-fit"
          >
            <svg className="w-3 h-3 text-gray-400/30 group-hover:text-teal-600 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            Admin Login
          </button>
        </div>
      </div>

      {/* MODAL LOGIN (OVERLAY POPOUT) */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLogin(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="text-center mb-6">
              <div className="mx-auto h-12 w-12 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Admin Area</h2>
              <p className="text-xs text-gray-500">Masukkan kredensial untuk mengelola data</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="text" placeholder="Username" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm" value={username} onChange={(e) => setUsername(e.target.value)} required />
              <input type="password" placeholder="Password" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm" value={password} onChange={(e) => setPassword(e.target.value)} required />
              {loginError && <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg">{loginError}</p>}
              <button type="submit" disabled={loginLoading} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all">
                {loginLoading ? 'Memverifikasi...' : 'Masuk Dashboard'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}