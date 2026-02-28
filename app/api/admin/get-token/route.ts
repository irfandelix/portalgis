import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  try {
    // 1. Cek apakah variabel .env sudah terbaca
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REFRESH_TOKEN) {
      throw new Error("Variabel Environment (Client ID / Refresh Token) belum lengkap di Vercel/Local.");
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // 2. Set Refresh Token
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    // 3. Minta Access Token baru
    const { token } = await oauth2Client.getAccessToken();

    if (!token) {
      throw new Error("Google tidak mengembalikan Access Token.");
    }

    return NextResponse.json({ accessToken: token });
  } catch (error: any) {
    // Munculkan error di log Vercel agar mudah dilacak
    console.error("🔥 ERROR GET-TOKEN:", error.message || error);
    return NextResponse.json(
      { error: 'Gagal mendapatkan token', detail: error.message }, 
      { status: 500 }
    );
  }
}