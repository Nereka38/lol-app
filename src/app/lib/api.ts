const VERSION = '14.7.1'; // puedes actualizarlo
const BASE_URL = `https://ddragon.leagueoflegends.com/cdn/${VERSION}/data/es_ES`;

import axios from 'axios';
import * as cheerio from 'cheerio';

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
  image?: string;  // Marca la propiedad como opcional
  // Otras propiedades si las tienes
}

// Función para obtener los audios de un campeón desde su página en la Wiki
export async function getChampionAudioQuotes(championName: string) {
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

      if (audioUrl && text && text !== "Link") {
        quotes.push({
          text: text, // El texto asociado al audio
          audio: audioUrl, // La URL del audio
        });
      }
    });

    return quotes;
  } catch (error) {
    console.error(`Error fetching champion audio quotes for ${championName}:`, error);
    return [];
  }
}

export async function getAllChampions(): Promise<Champion[]> {
  const res = await fetch(`${BASE_URL}/champion.json`);
  const data: { data: Record<string, Champion> } = await res.json(); // Definimos el tipo de data
  return Object.values(data.data); // Esto devuelve un array de objetos Champion
}

export async function getChampionById(id: string) {
  const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/14.7.1/data/en_US/champion/${id}.json`);
  const data = await response.json();

  const champion = data.data[id];

  // Si "lore" está ausente en los datos de la API, puedes asignarle un valor predeterminado
  const fullChampion = {
    ...champion,
    lore: champion.lore || '', // Asegúrate de que lore esté presente, incluso si es vacío
    image: champion.image || undefined, // Asegura que image sea un objeto con 'full'
  };

  return fullChampion;
}

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
    console.error('Error:', error);
    return [];
  }
}