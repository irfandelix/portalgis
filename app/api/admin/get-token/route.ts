import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Gunakan Refresh Token abadi kamu
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    // Minta Access Token sementara
    const { token } = await oauth2Client.getAccessToken();

    return NextResponse.json({ accessToken: token });
  } catch (error) {
    console.error("Gagal ambil token:", error);
    return NextResponse.json({ error: 'Gagal mendapatkan token akses' }, { status: 500 });
  }
}