import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient } from '@/lib/drive';

export async function GET(request: NextRequest, context: any) {
  const params = await context.params;
  const fileId = params.id;
  let fileName = request.nextUrl.searchParams.get('name') || 'downloaded_file';

  try {
    const drive = await getDriveClient();

    // 1. Ngintip dulu ke Google Drive: "Ini file jenis apa?"
    const fileMeta = await drive.files.get({
      fileId: fileId,
      fields: 'mimeType',
    });
    const mimeType = fileMeta.data.mimeType;

    let response;
    let exportContentType = 'application/octet-stream';

    // 2. Jika ini file bawaan Google (Google Docs, Sheets, Slides)
    if (mimeType && mimeType.startsWith('application/vnd.google-apps.')) {
      let exportMimeType = 'application/pdf'; // Default: jadikan PDF
      
      // Khusus Google Sheets, kita ubah jadi file Excel (.xlsx)
      if (mimeType === 'application/vnd.google-apps.spreadsheet') {
        exportMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        if (!fileName.endsWith('.xlsx')) fileName += '.xlsx';
      } else {
        // Untuk Google Docs dan Slides, kita jadikan PDF
        if (!fileName.endsWith('.pdf')) fileName += '.pdf';
      }

      response = await drive.files.export(
        { fileId: fileId, mimeType: exportMimeType },
        { responseType: 'stream' }
      );
      exportContentType = exportMimeType;
      
    } else {
      // 3. Jika ini file normal (SHP, PDF biasa, DWG, Zip, Gambar, dll)
      response = await drive.files.get(
        { fileId: fileId, alt: 'media' },
        { responseType: 'stream' }
      );
      if (mimeType) exportContentType = mimeType;
    }

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    headers.set('Content-Type', exportContentType);

    return new NextResponse(response.data as any, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error("Error download:", error);
    return new NextResponse("Gagal mendownload file", { status: 500 });
  }
}