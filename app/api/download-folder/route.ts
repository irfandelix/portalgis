import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient } from '@/lib/drive';
import archiver from 'archiver';
import { PassThrough } from 'stream';

export async function GET(request: NextRequest) {
  const folderQuery = request.nextUrl.searchParams.get('name');
  if (!folderQuery) return NextResponse.json({ error: 'Nama folder diperlukan' }, { status: 400 });

  try {
    const drive = await getDriveClient();

    // 1. Cari Folder Utama
    const folderRes = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name contains '${folderQuery}' and trashed=false`,
      fields: 'files(id, name)', // Ambil juga nama aslinya
    });

    const mainFolderId = folderRes.data.files?.[0]?.id;
    // Ambil nama asli folder dari Drive (huruf besar/kecilnya sesuai)
    const exactFolderName = folderRes.data.files?.[0]?.name || folderQuery; 
    
    if (!mainFolderId) return NextResponse.json({ error: 'Folder tidak ditemukan' }, { status: 404 });

    // 2. Siapkan mesin ZIP dan Pipa Anti-Putus
    const archive = archiver('zip', { zlib: { level: 0 } });
    const passThrough = new PassThrough();
    archive.pipe(passThrough);

    const stream = new ReadableStream({
      start(controller) {
        passThrough.on('data', (chunk) => controller.enqueue(chunk));
        passThrough.on('end', () => controller.close());
        passThrough.on('error', (err) => controller.error(err));
      }
    });

    // 3. FUNGSI PINTAR: Menyelam ke dalam sub-folder
    const processFolder = async (folderId: string, currentPath: string = '') => {
      const filesRes = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        pageSize: 1000, 
        fields: 'files(id, name, mimeType)',
      });

      const items = filesRes.data.files || [];

      for (const item of items) {
        const mimeType = item.mimeType || '';
        let itemName = item.name || 'file_tak_bernama';

        // JIKA INI ADALAH SUB-FOLDER
        if (mimeType === 'application/vnd.google-apps.folder') {
          await processFolder(item.id!, currentPath + itemName + '/');
        } 
        // JIKA INI FILE BIASA / GOOGLE DOCS
        else {
          let fileStream;

          if (mimeType.startsWith('application/vnd.google-apps.')) {
            let exportMimeType = 'application/pdf';
            if (mimeType === 'application/vnd.google-apps.spreadsheet') {
              exportMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
              if (!itemName.endsWith('.xlsx')) itemName += '.xlsx';
            } else {
              if (!itemName.endsWith('.pdf')) itemName += '.pdf';
            }

            try {
              fileStream = await drive.files.export(
                { fileId: item.id!, mimeType: exportMimeType },
                { responseType: 'stream' }
              );
            } catch (err) { continue; }
          } else {
            try {
              fileStream = await drive.files.get(
                { fileId: item.id!, alt: 'media' },
                { responseType: 'stream' }
              );
            } catch (err) { continue; }
          }

          if (fileStream && fileStream.data) {
            // Bungkus file dan letakkan ke dalam folder yang benar
            archive.append(fileStream.data as any, { name: currentPath + itemName });
          }
        }
      }
    };

    // 4. PERUBAHAN UTAMA: Mulai proses menyelam, tapi masukkan nama folder utamanya di depan!
    processFolder(mainFolderId, exactFolderName + '/').then(() => {
      archive.finalize(); 
    }).catch(err => {
      console.error("Proses file error:", err);
      archive.finalize(); 
    });

    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${exactFolderName}.zip"`,
      },
    });
  } catch (error) {
    console.error("Error zipping:", error);
    return NextResponse.json({ error: 'Gagal membungkus file' }, { status: 500 });
  }
}