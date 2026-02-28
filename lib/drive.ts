import { google } from 'googleapis';

export async function getDriveClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  // Memastikan format enter (\n) terbaca dengan benar
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    // PERBAIKAN: Gunakan huruf kecil 'scopes' dan tanda titik dua ':'
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  return google.drive({ version: 'v3', auth });
}