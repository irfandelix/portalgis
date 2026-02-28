import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient } from '@/lib/drive';

export async function GET(request: NextRequest) {
  const queryName = request.nextUrl.searchParams.get('q');

  try {
    const drive = await getDriveClient();

    // JIKA UNTUK ADMIN (Menampilkan daftar folder di Dashboard)
    if (!queryName || queryName === '') {
    // AMBIL DARI ENV: Pastikan namanya sama dengan yang ada di .env.local
    const parentFolderId = process.env.NEXT_PUBLIC_DRIVE_DATABASE_ID;

    // Validasi agar TypeScript tidak protes 'undefined'
    if (!parentFolderId) {
        return NextResponse.json({ error: 'Database ID belum diatur di .env' }, { status: 500 });
    }

    const response = await drive.files.list({
        // Kita cari folder yang HANYA ada di dalam folder database tersebut
        q: `mimeType='application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, description)',
        orderBy: 'name',
    });
    
    return NextResponse.json({ files: response.data.files });
    }

    // --- BAGIAN KLIEN TETAP SAMA SEPERTI SEBELUMNYA ---
    const folderRes = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name contains '${queryName}' and trashed=false`,
      fields: 'files(id, name)',
    });

    const folders = folderRes.data.files;
    if (!folders || folders.length === 0) {
      return NextResponse.json({ error: 'Data kegiatan tidak ditemukan.' }, { status: 404 });
    }

    const folderId = folders[0].id;
    const filesRes = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType)',
    });

    return NextResponse.json({ files: filesRes.data.files });

  } catch (error) {
    console.error("Error API Search:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem.' }, { status: 500 });
  }
}