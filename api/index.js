export default async function handler(req, res) {
  // 1. Mengambil ID video dari URL (contoh: /api?id=dQw4w9WgXcQ)
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID YouTube tidak ditemukan. Gunakan format: /api?id=VIDEO_ID' });
  }

  try {
    // 2. Menarik halaman YouTube secara diam-diam (seperti browser)
    const response = await fetch(`https://www.youtube.com/watch?v=${id}`);
    const html = await response.text();

    // 3. Mencari data konfigurasi player YouTube di dalam HTML
    // YouTube menyimpan link live streaming dalam variabel ytInitialPlayerResponse
    const regex = /ytInitialPlayerResponse\s*=\s*({.+?})\s*;/;
    const match = html.match(regex);

    if (match && match[1]) {
      const playerResponse = JSON.parse(match[1]);
      
      // 4. Mengekstrak link HLS (m3u8)
      const hlsUrl = playerResponse?.streamingData?.hlsManifestUrl;

      if (hlsUrl) {
        // 5. Meneruskan (Redirect) IPTV player langsung ke link m3u8 terbaru
        // Status 302 artinya "Found" (Pindah Sementara)
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.redirect(302, hlsUrl);
      } else {
        return res.status(404).json({ error: 'Streaming HLS tidak ditemukan. Pastikan video tersebut sedang Live.' });
      }
    } else {
      return res.status(500).json({ error: 'Gagal mengekstrak data dari YouTube. Struktur halaman mungkin berubah.' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Terjadi kesalahan server: ' + error.message });
  }
}