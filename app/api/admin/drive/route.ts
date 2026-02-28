import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient } from '@/lib/drive';
import { cookies } from 'next/headers';

// Fungsi bantuan untuk mengecek apakah yang mengakses adalah admin
async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get('admin_session');
}

/**
 * 1. CREATE (POST)
 * Digunakan untuk membuat folder project baru di dalam folder database utama.
 */
export async function POST(request: NextRequest) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { folderName } = await request.json();
    const drive = await getDriveClient();

    // 1. Ambil ID dari ENV
    const databaseFolderId = process.env.NEXT_PUBLIC_DRIVE_DATABASE_ID;

    // 2. VALIDASI KETAT: Jika ID tidak ada, langsung stop dan beri error.
    // Ini akan menghilangkan error "Type undefined is not assignable"
    if (!databaseFolderId) {
      console.error("Konfigurasi Error: NEXT_PUBLIC_DRIVE_DATABASE_ID tidak ditemukan di .env.local");
      return NextResponse.json({ error: 'Sistem belum dikonfigurasi dengan benar' }, { status: 500 });
    }

    const folder = await drive.files.create({
      requestBody: { 
        name: folderName, 
        mimeType: 'application/vnd.google-apps.folder',
        // 3. Kita pakai variabel yang sudah divalidasi di atas
        parents: [databaseFolderId] 
      },
      fields: 'id',
    });

    return NextResponse.json({ success: true, id: folder.data.id });
  } catch (error) { 
    console.error("Error Create Folder:", error);
    return NextResponse.json({ error: 'Gagal membuat folder baru' }, { status: 500 }); 
  }
}

/**
 * 2. UPDATE STATUS PEMBAYARAN (PATCH)
 * Mengubah deskripsi folder menjadi 'Lunas' atau 'Belum'.
 * FIX: Menambahkan 'fields' agar tidak Error 500.
 */
export async function PATCH(request: NextRequest) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { fileId, status } = await request.json();
    const drive = await getDriveClient();

    await drive.files.update({
      fileId: fileId,
      requestBody: {
        description: status // Menyimpan 'Lunas' atau 'Belum'
      },
      fields: 'id, description' // Memberitahu Google data apa yang mau kita terima balik
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error Patch Status:", error);
    return NextResponse.json({ error: 'Gagal update status' }, { status: 500 });
  }
}

/**
 * 3. DELETE (DELETE)
 * Menghapus folder project beserta isinya secara permanen.
 */
export async function DELETE(request: NextRequest) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('id');

  if (!fileId) return NextResponse.json({ error: 'ID folder tidak ditemukan' }, { status: 400 });

  try {
    const drive = await getDriveClient();
    await drive.files.delete({ fileId: fileId });
    
    return NextResponse.json({ success: true });
  } catch (error) { 
    console.error("Error Delete Folder:", error);
    return NextResponse.json({ error: 'Gagal menghapus folder dari Drive' }, { status: 500 }); 
  }
}