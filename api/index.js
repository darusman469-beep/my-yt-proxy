export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID YouTube diperlukan' });
  }

  try {
    // Menembak instansi publik Piped API (bebas blokir bot)
    const response = await fetch(`https://pipedapi.kavin.rocks/streams/${id}`);
    
    if (!response.ok) {
      return res.status(404).json({ error: 'Gagal mengambil data dari API alternatif.' });
    }

    const data = await response.json();
    
    // Piped memisahkan link HLS live streaming di dalam properti hls
    const hlsUrl = data.hls;

    if (hlsUrl) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.redirect(302, hlsUrl);
    } else {
      return res.status(404).json({ error: 'Video ini bukan Live Streaming atau sedang offline.' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Kesalahan Server: ' + error.message });
  }
}
