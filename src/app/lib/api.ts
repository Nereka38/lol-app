import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import { Skin } from '../types/champions';

// --------------------
// CONFIGURACIÓN
// --------------------
const VERSION = '14.7.1';
const BASE_URL_ES = `https://ddragon.leagueoflegends.com/cdn/${VERSION}/data/es_ES`;
const BASE_URL_EN = `https://ddragon.leagueoflegends.com/cdn/${VERSION}/data/en_US`;
const FANDOM_BASE_URL = 'https://leagueoflegends.fandom.com/wiki';
const LOL_GRAPHS_URL = 'https://www.leagueofgraphs.com/es/champions/stats';

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0',
};

// --------------------
// TIPOS
// --------------------
export interface Quote {
  text: string;
  audio: string;
}

export interface ChampionRoleStat {
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

// Tipo raw que devuelve la API de Riot
interface RiotChampionRaw {
  id: string;
  name: string;
  title: string;
  lore: string;
  image?: string;
  skins?: Skin[];
  [key: string]: unknown;
}

interface RiotChampionListResponse {
  data: Record<string, RiotChampionRaw>;
}

// --------------------
// UTILIDADES INTERNAS
// --------------------

/**
 * Wrapper para fetch con manejo de errores centralizado.
 * Lanza un error descriptivo si la respuesta no es OK.
 */
async function safeFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} al intentar obtener: ${url}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Busca la clave exacta de un campeón en la API (case-insensitive).
 */
async function findChampionKey(id: string): Promise<string | null> {
  const allData = await safeFetch<RiotChampionListResponse>(`${BASE_URL_EN}/champion.json`);

  return (
    Object.keys(allData.data).find(
      (key) => key.toLowerCase() === id.toLowerCase()
    ) ?? null
  );
}

// --------------------
// FUNCIONES DE AUDIO
// --------------------

/**
 * Obtiene las frases de audio de un campeón desde la wiki de League of Legends.
 * Retorna un array vacío si el campeón no se encuentra o hay un error.
 */
export async function getChampionAudioQuotes(championName?: string): Promise<Quote[]> {
  if (!championName) return [];

  const formattedName = championName.trim().replace(/\s+/g, '_');
  const url = `${FANDOM_BASE_URL}/${formattedName}/LoL/Audio`;

  try {
    const { data: html } = await axios.get<string>(url, { headers: DEFAULT_HEADERS });
    const $ = cheerio.load(html);
    const quotes: Quote[] = [];

    $('audio').each((_, audioEl) => {
      const audioUrl = $(audioEl).find('source').attr('src');
      const text = $(audioEl).parent().text().trim();

      // Filtramos entradas vacías o con texto genérico "Link"
      if (audioUrl && text && text !== 'Link') {
        quotes.push({ text, audio: audioUrl });
      }
    });

    return quotes;
  } catch (err) {
    const message = err instanceof AxiosError ? err.message : String(err);
    console.error(`[getChampionAudioQuotes] Error para "${championName}":`, message);
    return [];
  }
}

// --------------------
// OBTENER TODOS LOS CAMPEONES
// --------------------

/**
 * Retorna la lista completa de campeones en español.
 */
export async function getAllChampions(): Promise<Champion[]> {
  try {
    const data = await safeFetch<RiotChampionListResponse>(`${BASE_URL_ES}/champion.json`);
    return Object.values(data.data);
  } catch (err) {
    console.error('[getAllChampions] Error:', err instanceof Error ? err.message : err);
    return [];
  }
}

// --------------------
// OBTENER CAMPEÓN POR ID
// --------------------

/**
 * Retorna los datos detallados de un campeón por su ID (case-insensitive).
 * Retorna null si no se encuentra o hay un error.
 */
export async function getChampionById(id?: string): Promise<Champion | null> {
  if (!id?.trim()) return null;

  try {
    const championKey = await findChampionKey(id);

    if (!championKey) {
      console.warn(`[getChampionById] Campeón no encontrado para ID: "${id}"`);
      return null;
    }

    const championData = await safeFetch<{ data: Record<string, RiotChampionRaw> }>(
      `${BASE_URL_EN}/champion/${championKey}.json`
    );

    const champion = championData.data[championKey];

    if (!champion) {
      console.warn(`[getChampionById] Datos vacíos para key: "${championKey}"`);
      return null;
    }

    return {
      id: champion.id,
      name: champion.name,
      title: champion.title,
      lore: champion.lore ?? '',
      image: champion.image,
      skins: champion.skins,
    };
  } catch (err) {
    console.error(`[getChampionById] Error para ID "${id}":`, err instanceof Error ? err.message : err);
    return null;
  }
}

// --------------------
// ESTADÍSTICAS POR ROL
// --------------------

/**
 * Obtiene las estadísticas de un campeón por rol (popularidad y winrate)
 * desde leagueofgraphs.com.
 */
export async function getChampionRoleStats(championSlug: string): Promise<ChampionRoleStat[]> {
  if (!championSlug?.trim()) return [];

  const url = `${LOL_GRAPHS_URL}/${championSlug}`;

  try {
    const { data: html } = await axios.get<string>(url, { headers: DEFAULT_HEADERS });
    const $ = cheerio.load(html);
    const stats: ChampionRoleStat[] = [];

    $('table.data_table.sortable_table tbody tr').each((i, row) => {
      if (i === 0) return; // Saltar fila de encabezado

      const columns = $(row).find('td');
      const role = $(columns[0]).text().trim();
      const popularity = parseFloat($(columns[1]).find('progressbar').attr('data-value') ?? '0');
      const winRate = parseFloat($(columns[2]).find('progressbar').attr('data-value') ?? '0');

      // Solo añadimos filas con datos válidos
      if (role && !isNaN(popularity) && !isNaN(winRate)) {
        stats.push({ role, popularity, winRate });
      }
    });

    return stats;
  } catch (err) {
    const message = err instanceof AxiosError ? err.message : String(err);
    console.error(`[getChampionRoleStats] Error para "${championSlug}":`, message);
    return [];
  }
}