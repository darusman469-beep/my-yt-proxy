export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID YouTube tidak ditemukan. Gunakan format: /api?id=VIDEO_ID' });
  }

  try {
    // Menambahkan Headers agar Vercel menyamar sebagai browser Google Chrome asli
    const response = await fetch(`https://www.youtube.com/watch?v=${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    const html = await response.text();

    const regex = /ytInitialPlayerResponse\s*=\s*({.+?})\s*;/;
    const match = html.match(regex);

    if (match && match[1]) {
      const playerResponse = JSON.parse(match[1]);
      const hlsUrl = playerResponse?.streamingData?.hlsManifestUrl;

      if (hlsUrl) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.redirect(302, hlsUrl);
      } else {
        return res.status(404).json({ error: 'HLS tidak ditemukan di data video. Pastikan ini adalah Live Streaming aktif.' });
      }
    } else {
      return res.status(500).json({ error: 'Gagal membaca halaman YouTube. Terblokir sistem anti-bot.' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Terjadi kesalahan server: ' + error.message });
  }
}
