export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID YouTube tidak ditemukan. Gunakan format: /api?id=VIDEO_ID' });
  }

  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        // Cookie ini berfungsi untuk mem-bypass halaman "Persetujuan Cookie" otomatis dari YouTube
        'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+478' 
      }
    });
    
    const html = await response.text();

    // METODE SNIPER: Langsung mencari link m3u8 tanpa perlu membaca seluruh data JSON
    const hlsMatch = html.match(/"hlsManifestUrl":"([^"]+)"/);

    if (hlsMatch && hlsMatch[1]) {
      // YouTube menyembunyikan link dengan karakter escape (\/), kita harus membersihkannya
      const hlsUrl = hlsMatch[1].replace(/\\\//g, '/');
      
      res.setHeader('Access-Control-Allow-Origin', '*');
      // Langsung arahkan pemutar IPTV ke link yang sudah dibersihkan
      return res.redirect(302, hlsUrl);
    } else {
      // Jika masih gagal, kita minta script mencari tahu alasan penolakannya dari YouTube
      const reasonMatch = html.match(/"reason":"([^"]+)"/);
      const reason = reasonMatch ? reasonMatch[1] : 'Tidak diketahui (mungkin stream sudah berakhir atau dibatasi wilayah).';
      
      return res.status(404).json({ 
        error: 'Gagal mengekstrak link HLS.',
        alasan_youtube: reason
      });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Terjadi kesalahan server: ' + error.message });
  }
}
