// Legge nome, marca, prezzo e foto di un prodotto Amazon dal suo link, per completare i regali della lista.
// Solo per i genitori (codice controllato con natale_g_ok) e solo indirizzi Amazon, anche lungo i reindirizzamenti.
// verify_jwt e' spento perche' la pagina usa la chiave pubblicabile, che non e' un JWT: il controllo lo fa il codice dei genitori.
const AMAZON = /^(www\.|m\.|smile\.)?(amazon\.(it|com|de|fr|es|co\.uk|nl|be|com\.be|se|pl|at|ch|ca)|amzn\.(eu|to|com)|a\.co)$/i;
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, apikey, authorization, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};
const H = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'it-IT,it;q=0.9,en;q=0.5',
};
const out = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: CORS });
const dec = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

function breve(t: string) {
  // i titoli Amazon sono lunghissimi: tengo la prima parte significativa
  const parti = t.split(/\s+[|–—]\s+|\s+-\s+|,\s+/);
  let s = parti[0] || t;
  for (let i = 1; s.length < 14 && i < parti.length; i++) s += ' – ' + parti[i];
  return s.length > 90 ? s.slice(0, 88).replace(/\s+\S*$/, '') + '…' : s;
}
function centesimi(p: string) {
  const m = p.replace(/\s/g, '').match(/([0-9][0-9.]*)(,([0-9]{2}))?/);
  if (!m) return null;
  const n = parseInt(m[1].replace(/\./g, ''), 10) * 100 + (m[3] ? parseInt(m[3], 10) : 0);
  return Number.isFinite(n) && n > 0 && n < 10000000 ? n : null;
}
function trovaPrezzo(html: string): { testo: string; cent: number | null } {
  for (const id of ['corePriceDisplay_desktop_feature_div', 'corePrice_feature_div', 'apex_desktop', 'priceToPay', 'corePrice_desktop']) {
    const i = html.indexOf(id);
    if (i < 0) continue;
    const pezzo = html.slice(i, i + 8000);
    const m = pezzo.match(/class="a-offscreen"\s*>\s*([^<]*\d[^<]*)</);
    if (m) { const t = dec(m[1]); return { testo: t, cent: centesimi(t) }; }
    const w = pezzo.match(/class="a-price-whole"\s*>\s*([0-9.]+)[\s\S]{0,200}?class="a-price-fraction"\s*>\s*([0-9]{2})/);
    if (w) { const t = `${w[1]},${w[2]} €`; return { testo: t, cent: centesimi(t) }; }
  }
  // dati delle varianti, presenti anche quando il riquadro del prezzo non c'e'
  const pa = html.match(/"priceAmount"\s*:\s*([0-9]+(?:\.[0-9]{1,2})?)/);
  if (pa) { const c = Math.round(parseFloat(pa[1]) * 100); return { testo: (c / 100).toFixed(2).replace('.', ',') + ' €', cent: c > 0 ? c : null }; }
  const dp = html.match(/"displayPrice"\s*:\s*"([^"]*\d[^"]*)"/);
  if (dp) { const t = dec(dp[1]); return { testo: t, cent: centesimi(t) }; }
  return { testo: '', cent: null };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return out({ errore: 'metodo' }, 405);
  let body: { url?: string; pin?: string; debug?: boolean };
  try { body = await req.json(); } catch { return out({ errore: 'richiesta' }, 400); }

  const key = req.headers.get('apikey') || Deno.env.get('SUPABASE_ANON_KEY') || '';
  const ok = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/natale_g_ok`, {
    method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_pin: String(body.pin || '') }),
  }).then((r) => r.json()).catch(() => null);
  if (!ok || ok.ok !== true) return out({ errore: 'codice' }, 403);

  let url: URL;
  try { url = new URL(String(body.url || '')); } catch { return out({ errore: 'link' }, 400); }
  if (url.protocol !== 'https:' || !AMAZON.test(url.hostname)) return out({ errore: 'link' }, 400);

  let html = '', stato = 0;
  try {
    for (let i = 0; i < 6; i++) {
      const r = await fetch(url.href, { redirect: 'manual', headers: H });
      stato = r.status;
      const loc = r.headers.get('location');
      if (stato >= 300 && stato < 400 && loc) {
        const n = new URL(loc, url);
        if (n.protocol !== 'https:' || !AMAZON.test(n.hostname)) return out({ errore: 'link' }, 400);
        url = n; await r.body?.cancel(); continue;
      }
      html = await r.text(); break;
    }
  } catch (e) { return out({ errore: 'rete', dettaglio: String(e) }, 502); }

  if (!html || /validateCaptcha|api-services-support@amazon|Inserisci i caratteri|Type the characters/i.test(html)) {
    return out({ errore: 'bloccato', stato });
  }
  const asin = (url.pathname.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/i) || [])[1]
    || (html.match(/name="ASIN" value="([A-Z0-9]{10})"/) || [])[1] || '';
  const host = url.hostname.replace(/^(m|smile)\./, 'www.');
  const titoloLungo = dec((html.match(/id="productTitle"[^>]*>([\s\S]*?)<\/span>/) || [])[1] || '');
  const marca = dec((html.match(/id="bylineInfo"[^>]*>([\s\S]*?)<\/a>/) || [])[1] || '')
    .replace(/^(Visita lo Store di|Marca:|Visit the|Brand:)\s*/i, '').replace(/\s*Store$/i, '');
  const prezzo = trovaPrezzo(html);
  let foto = [...html.matchAll(/"hiRes":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/g)].map((m) => m[1]);
  if (!foto.length) foto = [...html.matchAll(/"large":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/g)].map((m) => m[1]);
  if (!foto.length) { const m = html.match(/data-old-hires="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/); if (m) foto = [m[1]]; }
  foto = [...new Set(foto)].slice(0, 7);

  if (!titoloLungo && !foto.length) return out({ errore: 'pagina', stato });
  const risposta: Record<string, unknown> = {
    ok: true,
    url: asin ? `https://${host}/dp/${asin.toUpperCase()}` : '',
    titolo: breve(titoloLungo), titolo_completo: titoloLungo, marca,
    prezzo: prezzo.testo, prezzo_cent: prezzo.cent, foto,
  };
  if (body.debug) {
    const pezzi: Record<string, string> = {};
    for (const k of ['a-price', 'priceToPay', 'a-offscreen', 'priceAmount', 'displayPrice', 'outOfStock', 'Non disponibile', 'availability']) {
      const i = html.indexOf(k); if (i >= 0) pezzi[k] = html.slice(Math.max(0, i - 150), i + 250).replace(/\s+/g, ' ');
    }
    risposta.debug = { lunghezza: html.length, pezzi };
  }
  return out(risposta);
});
