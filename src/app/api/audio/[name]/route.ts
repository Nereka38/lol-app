import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Datos estáticos de respaldo para campeones populares
const STATIC_QUOTES: Record<string, { text: string; audio: string }[]> = {
  'Ahri': [
    { text: 'Al seleccionar', audio: 'https://static.wikia.nocookie.net/leagueoflegends/images/6/6e/Ahri_Select.ogg' },
    { text: 'Vamos a jugar', audio: 'https://static.wikia.nocookie.net/leagueoflegends/images/7/7a/Ahri_Move_2.ogg' },
    { text: '¿Acaso me echas de menos?', audio: 'https://static.wikia.nocookie.net/leagueoflegends/images/9/9e/Ahri_Taunt.ogg' },
    { text: 'La diversión comienza', audio: 'https://static.wikia.nocookie.net/leagueoflegends/images/8/8c/Ahri_Aggro_2.ogg' },
    { text: 'Tentaré a mi presa', audio: 'https://static.wikia.nocookie.net/leagueoflegends/images/5/56/Ahri_Move_5.ogg' },
    { text: 'No podrás resistirte', audio: 'https://static.wikia.nocookie.net/leagueoflegends/images/4/4e/Ahri_Aggro_3.ogg' },
    { text: '¿Te gusta cuando muevo la cola?', audio: 'https://static.wikia.nocookie.net/leagueoflegends/images/2/26/Ahri_Joke.ogg' },
    { text: 'Mi corazón late más rápido', audio: 'https://static.wikia.nocookie.net/leagueoflegends/images/3/33/Ahri_Laugh.ogg' },
  ],
  'Aatrox': [
    { text: 'Soy el destructor de mundos', audio: 'https://static.wikia.nocookie.net/leagueoflegends/images/8/8e/Aatrox_Select.ogg' },
    { text: '¡Yo soy Aatrox!', audio: 'https://static.wikia.nocookie.net/leagueoflegends/images/9/9f/Aatrox_Move_0.ogg' },
    { text: 'La guerra eterna', audio: 'https://static.wikia.nocookie.net/leagueoflegends/images/a/a6/Aatrox_Attack_0.ogg' },
    { text: 'Soy tu destructor', audio: 'https://static.wikia.nocookie.net/leagueoflegends/images/2/2d/Aatrox_Attack_2.ogg' },
    { text: '¡Muere!', audio: 'https://static.wikia.nocookie.net/leagueoflegends/images/7/7c/Aatrox_Crit_0.ogg' },
    { text: 'La oscuridad consume todo', audio: 'https://static.wikia.nocookie.net/leagueoflegends/images/3/3c/Aatrox_R_activated.ogg' },
  ],
  'Amumu': [
    { text: 'Solo quiero un abrazo', audio: 'https://static.wikia.nocookie.net/leagueoflegends/images/8/88/Amumu_Select.ogg' },
    { text: 'Estoy llorando', audio: 'https://static.wikia.nocookie.net/leagueoflegends/images/2/24/Amumu_Move_0.ogg' },
    { text: '¿Quieres ser mi amigo?', audio: 'https://static.wikia.nocookie.net/leagueoflegends/images/4/41/Amumu_Move_3.ogg' },
    { text: 'Otra vez solo', audio: 'https://static.wikia.nocookie.net/leagueoflegends/images/7/7a/Amumu_Attack_0.ogg' },
    { text: 'Nadie quiere jugar conmigo', audio: 'https://static.wikia.nocookie.net/leagueoflegends/images/5/5d/Amumu_Joke.ogg' },
  ],
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  if (!name) {
    return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
  }

  const decodedName = decodeURIComponent(name).trim();

  // Intentar obtener datos de Fandom con diferentes proxies
  const formattedName = decodedName.replace(/\s+/g, '_');
  const fandomUrl = `https://leagueoflegends.fandom.com/wiki/${formattedName}/LoL/Audio`;

  // Lista de proxies CORS gratuitos para probar
  const proxyUrls = [
    null, // Intentar directo primero
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest=',
  ];

  for (const proxy of proxyUrls) {
    try {
      const url = proxy ? `${proxy}${encodeURIComponent(fandomUrl)}` : fandomUrl;
      console.log(`[Audio API] Intentando: ${proxy || 'directo'}`);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) continue;

      const html = await response.text();
      const $ = cheerio.load(html);
      const quotes: { text: string; audio: string }[] = [];

      // Método 1: Etiquetas <audio>
      $('audio').each((_, audioEl) => {
        const audioUrl = $(audioEl).find('source').attr('src');
        const text = $(audioEl).parent().text().trim();

        if (audioUrl && text && text !== 'Link') {
          const fullUrl = audioUrl.startsWith('http')
            ? audioUrl
            : `https://leagueoflegends.fandom.com${audioUrl}`;
          quotes.push({ text: text.substring(0, 200), audio: fullUrl });
        }
      });

      // Método 2: Atributos data-url (formato actual de Fandom)
      if (quotes.length === 0) {
        $('[data-url*=".ogg"]').each((_, el) => {
          const audioUrl = $(el).attr('data-url');
          if (audioUrl) {
            const fullUrl = audioUrl.startsWith('http') ? audioUrl : `https:${audioUrl}`;
            const text = $(el).closest('td, li, tr').prev('td').text().trim()
              || $(el).closest('td').prev('td').text().trim()
              || $(el).closest('tr').find('td:first-child').text().trim()
              || 'Voice line';
            if (text) {
              quotes.push({ text: text.substring(0, 200), audio: fullUrl });
            }
          }
        });
      }

      // Método 3: Links a archivos .ogg
      if (quotes.length === 0) {
        $('a[href*=".ogg"]').each((_, el) => {
          const href = $(el).attr('href');
          if (href?.includes('.ogg')) {
            const fullUrl = href.startsWith('http') ? href : `https://leagueoflegends.fandom.com${href}`;
            const text = $(el).closest('tr, li').find('td:first-child').text().trim()
              || $(el).text().trim();
            if (text && text !== 'Listen' && !text.includes('.ogg')) {
              quotes.push({ text: text.substring(0, 200), audio: fullUrl });
            }
          }
        });
      }

      if (quotes.length > 0) {
        console.log(`[Audio API] Éxito con ${proxy || 'directo'}: ${quotes.length} audios`);
        return NextResponse.json({ quotes });
      }
    } catch (error) {
      console.log(`[Audio API] Falló ${proxy || 'directo'}:`, error);
    }
  }

  // Fallback: usar datos estáticos si existen
  if (STATIC_QUOTES[decodedName]) {
    console.log(`[Audio API] Usando datos estáticos para ${decodedName}`);
    return NextResponse.json({ quotes: STATIC_QUOTES[decodedName] });
  }

  // Último intento: crear URLs basadas en patrones conocidos
  const fallbackQuotes = [
    { text: 'Al seleccionar', audio: `https://static.wikia.nocookie.net/leagueoflegends/images/${decodedName.charAt(0).toLowerCase()}/${decodedName.charAt(0).toLowerCase()}${decodedName.charAt(1).toLowerCase()}/${decodedName}_Select.ogg` },
    { text: 'Moverse', audio: `https://static.wikia.nocookie.net/leagueoflegends/images/${decodedName.charAt(0).toLowerCase()}/${decodedName.charAt(0).toLowerCase()}${decodedName.charAt(1).toLowerCase()}/${decodedName}_Move_0.ogg` },
    { text: 'Atacar', audio: `https://static.wikia.nocookie.net/leagueoflegends/images/${decodedName.charAt(0).toLowerCase()}/${decodedName.charAt(0).toLowerCase()}${decodedName.charAt(1).toLowerCase()}/${decodedName}_Attack_0.ogg` },
  ];

  console.log(`[Audio API] Intentando URLs de fallback para ${decodedName}`);
  return NextResponse.json({ quotes: fallbackQuotes });
}
