import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient } from '@/lib/drive';
import { Readable } from 'stream';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folderId = formData.get('folderId') as string;

    if (!file || !folderId) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const drive = await getDriveClient();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const stream = Readable.from(buffer);

   const response = await drive.files.create({
    requestBody: {
        name: file.name,
        parents: [folderId],
    },
    media: {
        mimeType: file.type,
        body: stream,
    },
    fields: 'id, name',
    // Posisikan di sini, di luar requestBody
    supportsAllDrives: true,
    // Gunakan 'as any' jika TypeScript masih merah, karena parameter ini 
    // sangat spesifik untuk menangani perpindahan kuota pemilik.
    // @ts-ignore
    moveToNewOwnersRoot: true, 
    } as any);

    return NextResponse.json({ success: true, file: response.data });
  } catch (error) {
    console.error("Upload Error:", error);
    // Jika masih error quota, berarti file mencoba disimpan di Root Service Account
    return NextResponse.json({ error: 'Gagal upload: Masalah kuota Service Account' }, { status: 500 });
  }
}