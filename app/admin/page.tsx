'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [folders, setFolders] = useState<any[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 1. Ambil daftar folder dari Drive
  const fetchFolders = async () => {
    try {
      const res = await fetch('/api/search?q=');
      const data = await res.json();
      setFolders(data.files || []);
    } catch (err) {
      console.error("Gagal memuat folder");
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  // 2. Fungsi Buat Folder Baru
  const handleCreateFolder = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderName: newFolderName }),
      });
      if (res.ok) {
        setNewFolderName('');
        fetchFolders();
        alert('Folder project berhasil dibuat! ✨');
      }
    } catch (err) {
      alert('Gagal membuat folder');
    } finally {
      setLoading(false);
    }
  };

  // 3. Fungsi Update Status Pembayaran (Lunas/Belum)
  const updateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Lunas' ? 'Belum' : 'Lunas';
    try {
      const res = await fetch('/api/admin/drive', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: id, status: newStatus }),
      });
      if (res.ok) fetchFolders();
    } catch (err) {
      alert('Gagal update status');
    }
  };

  // 4. Fungsi Hapus Folder
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus folder "${name}"? Semua file di dalamnya akan ikut terhapus!`)) return;
    try {
      const res = await fetch(`/api/admin/drive?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchFolders();
    } catch (err) {
      alert('Gagal menghapus');
    }
  };

  // 5. Fungsi Multi-Upload File
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, folderId: string) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const total = selectedFiles.length;
    alert(`Memulai upload ${total} file... Mohon tunggu ya sayang 🥰`);

    // Proses upload satu per satu agar server tidak overload
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', folderId);

      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!res.ok) throw new Error(`Gagal upload ${file.name}`);
        console.log(`Berhasil upload: ${file.name}`);
      } catch (err) {
        alert(`Waduh, file ${file.name} gagal diunggah.`);
      }
    }

    alert(`Yeay! ${total} file berhasil terupload ke Drive! 🚀✨`);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 text-gray-800 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER DASHBOARD */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-teal-700 tracking-tight">Control Center</h1>
            <p className="text-gray-500 font-medium">Manajemen Data & Pembayaran Spasial</p>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-red-50 hover:text-red-600 transition-all"
          >
            Log Out
          </button>
        </div>

        {/* INPUT PROJECT BARU */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-gray-700">
            <span className="p-2 bg-teal-100 text-teal-600 rounded-xl text-base">➕</span> Tambah Project Baru
          </h2>
          <form onSubmit={handleCreateFolder} className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Contoh: 2026_03_PerumIndahPermata" 
              className="flex-1 px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              required
            />
            <button 
              disabled={loading} 
              className="bg-teal-600 hover:bg-teal-700 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-teal-200 transition-all disabled:opacity-50"
            >
              {loading ? 'Proses...' : 'Buat Folder'}
            </button>
          </form>
        </div>

        {/* DAFTAR FOLDER & STATUS */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold px-4 flex items-center gap-2 text-gray-700">
            <span className="p-2 bg-amber-100 text-amber-600 rounded-xl text-base">📂</span> Daftar Project Aktif
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {folders.map((f) => {
              const isPaid = f.description === 'Lunas';
              return (
                <div key={f.id} className="group bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-teal-100 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${isPaid ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path></svg>
                    </div>
                    
                    <div className="flex gap-1">
                      {/* TOMBOL MULTI-UPLOAD */}
                      <label className="cursor-pointer p-2 text-teal-600 hover:bg-teal-50 rounded-xl transition-all flex items-center gap-1" title="Multi-upload ke folder ini">
                        <input 
                          type="file" 
                          multiple 
                          className="hidden" 
                          onChange={(e) => handleUpload(e, f.id)} 
                        />
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                        </svg>
                        <span className="text-[10px] font-bold">Upload</span>
                      </label>

                      {/* TOMBOL HAPUS */}
                      <button 
                        onClick={() => handleDelete(f.id, f.name)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Hapus folder"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="font-extrabold text-sm text-gray-800 leading-tight line-clamp-2 min-h-[2.5rem]">
                      {f.name}
                    </p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status Bayar</span>
                      <button 
                        onClick={() => updateStatus(f.id, f.description)}
                        className={`text-[10px] font-black px-4 py-1.5 rounded-full transition-all ${
                          isPaid 
                          ? 'bg-green-500 text-white shadow-md shadow-green-100' 
                          : 'bg-gray-100 text-gray-500 hover:bg-amber-500 hover:text-white'
                        }`}
                      >
                        {isPaid ? '✓ LUNAS' : 'BELUM BAYAR'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}