const VERSION = '14.7.1'; // puedes actualizarlo
const BASE_URL = `https://ddragon.leagueoflegends.com/cdn/${VERSION}/data/es_ES`;

import axios from 'axios';
import * as cheerio from 'cheerio';
import { Skin } from '../types/champions';

interface Quote {
  text: string;
  audio: string;
}

interface ChampionRoleStat {
  role: string;
  popularity: number;
  winRate: number;
}

export interface Champion {
  id: string;
  name: string;
  title: string;
  lore: string;
  image?: string;  
  skins?: Skin[];  
}

// --------------------
// FUNCIONES DE AUDIO
// --------------------
export async function getChampionAudioQuotes(championName?: string) {
  if (!championName) return [];

  const formattedChampionName = championName.replace(/\s/g, '_'); // Replaces spaces with underscores
  const url = `https://leagueoflegends.fandom.com/wiki/${formattedChampionName}/LoL/Audio`;

  try {
    // Obtener el HTML de la página del campeón
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const quotes: Quote[] = [];

    // Seleccionar todos los elementos <audio> que contienen los audios
    $('audio').each((_, audio) => {
      const audioUrl = $(audio).find('source').attr('src'); // Extraemos el 'src' de la etiqueta <source>
      const text = $(audio).parent().text().trim(); // Intentamos obtener el texto asociado

      if (audioUrl && text && text !== 'Link') {
        quotes.push({
          text: text,
          audio: audioUrl,
        });
      }
    });

    return quotes;
  } catch (error) {
    console.error(`Error fetching champion audio quotes for ${championName}:`, error);
    return [];
  }
}

// --------------------
// OBTENER TODOS LOS CAMPEONES
// --------------------
export async function getAllChampions(): Promise<Champion[]> {
  try {
    const res = await fetch(`${BASE_URL}/champion.json`, { cache: 'no-store' });
    if (!res.ok) return [];

    const data: { data: Record<string, Champion> } = await res.json();
    return Object.values(data.data);
  } catch (err) {
    console.error('Error fetching all champions:', err);
    return [];
  }
}

// --------------------
// OBTENER CAMPEÓN POR ID (case-insensitive)
// --------------------
export async function getChampionById(id?: string) {
  if (!id) return null;

  try {
    const BASE_URL_EN = `https://ddragon.leagueoflegends.com/cdn/14.7.1/data/en_US`;

    // Traemos todos los campeones para obtener la key exacta
    const resAll = await fetch(`${BASE_URL_EN}/champion.json`, { cache: 'no-store' });
    if (!resAll.ok) return null;
    const allData: { data: Record<string, any> } = await resAll.json();

    // Buscar key exacta (case-insensitive)
    const championKey = Object.keys(allData.data).find(
      (key) => key.toLowerCase() === id.toLowerCase()
    );
    if (!championKey) return null;

    // Fetch de datos del campeón usando la key correcta
    const resChampion = await fetch(`${BASE_URL_EN}/champion/${championKey}.json`, { cache: 'no-store' });
    if (!resChampion.ok) return null;

    const championData = await resChampion.json();
    const champion = championData.data[championKey];

    return {
      ...champion,
      lore: champion.lore || '',
      image: champion.image || undefined,
    };
  } catch (err) {
    console.error('Error fetching champion by ID:', err);
    return null;
  }
}

// --------------------
// ESTADÍSTICAS POR ROL
// --------------------
export async function getChampionRoleStats(championSlug: string): Promise<ChampionRoleStat[]> {
  const url = `https://www.leagueofgraphs.com/es/champions/stats/${championSlug}`;
  try {
    const { data: html } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    const $ = cheerio.load(html);
    const rows = $('table.data_table.sortable_table tbody tr');
    const stats: ChampionRoleStat[] = [];

    rows.each((i, row) => {
      if (i === 0) return; // saltar encabezado

      const columns = $(row).find('td');
      const role = $(columns[0]).text().trim();
      const popularity = parseFloat($(columns[1]).find('progressbar').attr('data-value') || '0');
      const winRate = parseFloat($(columns[2]).find('progressbar').attr('data-value') || '0');

      stats.push({ role, popularity, winRate });
    });

    return stats;
  } catch (error) {
    console.error('Error fetching champion role stats:', error);
    return [];
  }
}
