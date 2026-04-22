import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import { Champion, ChampionDetailResponse, ChampionListResponse, Quote, Skin } from '../types/champions';

// --------------------
// CONFIGURACIÓN
// --------------------
const VERSION = '15.7.1'; // Versión actualizada (puedes verificar la última en https://ddragon.leagueoflegends.com/api/versions.json)
const LOCALES = {
  es: 'es_ES',
  en: 'en_US',
} as const;

export type Locale = keyof typeof LOCALES;

const FANDOM_BASE_URL = 'https://leagueoflegends.fandom.com/wiki';
const LOL_GRAPHS_URL = 'https://www.leagueofgraphs.com/es/champions/stats';
const IMAGE_BASE_URL = `https://ddragon.leagueoflegends.com/cdn/${VERSION}/img`;

function getBaseUrl(locale: Locale = 'es'): string {
  return `https://ddragon.leagueoflegends.com/cdn/${VERSION}/data/${LOCALES[locale]}`;
}

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'DNT': '1',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
};

// --------------------
// FUNCIONES DE UTILIDAD
// --------------------

/**
 * Construye la URL completa para una imagen de campeón.
 * Nota: championId ya incluye la extensión .png desde la API.
 */
export function getChampionImageUrl(championId: string): string {
  const cleanId = championId.replace(/\.png$/i, '');
  return `${IMAGE_BASE_URL}/champion/${cleanId}.png`;
}

/**
 * Construye la URL para el splash art de un campeón/skin.
 */
export function getChampionSplashUrl(championId: string, skinNum: number = 0): string {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_${skinNum}.jpg`;
}

/**
 * Construye la URL para el loading screen de un campeón/skin.
 */
export function getChampionLoadingUrl(championId: string, skinNum: number = 0): string {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championId}_${skinNum}.jpg`;
}

/**
 * Construye la URL para una imagen de hechizo.
 * Nota: spellId ya incluye la extensión .png desde la API.
 */
export function getSpellImageUrl(spellId: string): string {
  // Quitar extensión duplicada si existe
  const cleanId = spellId.replace(/\.png$/i, '');
  return `${IMAGE_BASE_URL}/spell/${cleanId}.png`;
}

/**
 * Construye la URL para una imagen de pasiva.
 * Nota: passiveImageName ya incluye la extensión desde la API.
 */
export function getPassiveImageUrl(passiveImageName: string): string {
  // Asegurar que tenga extensión .png
  const cleanName = passiveImageName.replace(/\.png$/i, '');
  return `${IMAGE_BASE_URL}/passive/${cleanName}.png`;
}

/**
 * Wrapper para fetch con manejo de errores centralizado.
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
async function findChampionKey(id: string, locale: Locale = 'es'): Promise<string | null> {
  const allData = await safeFetch<ChampionListResponse>(`${getBaseUrl(locale)}/champion.json`);

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
 * Obtiene las frases de audio de un campeón desde nuestra API interna.
 * Retorna un array vacío si el campeón no se encuentra o hay un error.
 */
export async function getChampionAudioQuotes(championName?: string): Promise<Quote[]> {
  if (!championName) return [];

  try {
    // Usar nuestra API route interna para evitar CORS y bloqueos
    const encodedName = encodeURIComponent(championName);
    const response = await fetch(`/api/audio/${encodedName}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn(`[getChampionAudioQuotes] API respondió con ${response.status}`);
      return [];
    }

    const data = await response.json();
    console.log(`[getChampionAudioQuotes] Encontrados ${data.quotes?.length || 0} audios para ${championName}`);
    return data.quotes || [];
  } catch (err) {
    console.error(`[getChampionAudioQuotes] Error para "${championName}":`, err);
    return [];
  }
}

// --------------------
// OBTENER TODOS LOS CAMPEONES
// --------------------

/**
 * Retorna la lista completa de campeones en el idioma especificado con sus estadísticas.
 */
export async function getAllChampions(locale: Locale = 'es'): Promise<Champion[]> {
  try {
    const response = await safeFetch<ChampionListResponse>(`${getBaseUrl(locale)}/champion.json`);
    return Object.values(response.data).map((champion) => ({
      ...champion,
      image: {
        ...champion.image,
        full: getChampionImageUrl(champion.image.full),
      },
    }));
  } catch (err) {
    console.error('[getAllChampions] Error:', err instanceof Error ? err.message : err);
    return [];
  }
}

// --------------------
// OBTENER CAMPEÓN POR ID
// --------------------

/**
 * Retorna los datos completos de un campeón por su ID (case-insensitive).
 * Incluye todas las estadísticas, habilidades, skins, lore, etc.
 * Retorna null si no se encuentra o hay un error.
 */
export async function getChampionById(id?: string, locale: Locale = 'es'): Promise<Champion | null> {
  if (!id?.trim()) return null;

  try {
    const championKey = await findChampionKey(id, locale);

    if (!championKey) {
      console.warn(`[getChampionById] Campeón no encontrado para ID: "${id}"`);
      return null;
    }

    // Obtener datos en el idioma especificado y en inglés (valores numéricos)
    const [championDataLocale, championDataEn] = await Promise.all([
      safeFetch<ChampionDetailResponse>(`${getBaseUrl(locale)}/champion/${championKey}.json`),
      safeFetch<ChampionDetailResponse>(`${getBaseUrl('en')}/champion/${championKey}.json`).catch(() => null),
    ]);

    const champion = championDataLocale.data[championKey];
    const championEn = championDataEn?.data[championKey];

    if (!champion) {
      console.warn(`[getChampionById] Datos vacíos para key: "${championKey}"`);
      return null;
    }

    // Procesar skins para incluir URLs completas
    const processedSkins: Skin[] = champion.skins?.map((skin) => ({
      ...skin,
      image: getChampionSplashUrl(champion.id, skin.num),
    })) || [];

    // Procesar imagen del campeón
    const processedImage = {
      ...champion.image,
      full: getChampionImageUrl(champion.image.full),
    };

    // Procesar pasiva para incluir URL de imagen
    const processedPassive = champion.passive ? {
      ...champion.passive,
      image: {
        ...champion.passive.image,
        full: getPassiveImageUrl(champion.passive.image.full),
      },
    } : undefined;

    // Procesar hechizos: usar texto español pero valores numéricos del inglés
    const processedSpells = champion.spells?.map((spell, index) => {
      const spellEn = championEn?.spells?.[index];
      return {
        ...spell,
        image: {
          ...spell.image,
          full: getSpellImageUrl(spell.image.full),
        },
        // Usar effect y vars del inglés si existen, sino mantener los del español
        effect: spellEn?.effect || spell.effect,
        vars: spellEn?.vars || spell.vars,
      };
    });

    return {
      ...champion,
      image: processedImage,
      skins: processedSkins,
      passive: processedPassive,
      spells: processedSpells,
    };
  } catch (err) {
    console.error(`[getChampionById] Error para ID "${id}":`, err instanceof Error ? err.message : err);
    return null;
  }
}

// --------------------
// ESTADÍSTICAS POR ROL (Web Scraping)
// --------------------

export interface ChampionRoleStat {
  role: string;
  popularity: number;
  winRate: number;
}

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
      if (i === 0) return;

      const columns = $(row).find('td');
      const role = $(columns[0]).text().trim();
      const popularity = parseFloat($(columns[1]).find('progressbar').attr('data-value') ?? '0');
      const winRate = parseFloat($(columns[2]).find('progressbar').attr('data-value') ?? '0');

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

// --------------------
// FUNCIONES DE UTILIDAD PARA ESTADÍSTICAS
// --------------------

/**
 * Calcula el stat de un campeón a un nivel específico.
 */
export function calculateStatAtLevel(
  baseValue: number,
  perLevelValue: number,
  level: number
): number {
  if (level < 1 || level > 18) {
    throw new Error('El nivel debe estar entre 1 y 18');
  }
  // Fórmula de crecimiento de stats: base + perLevel * (nivel - 1)
  return baseValue + perLevelValue * (level - 1);
}

/**
 * Calcula la velocidad de ataque real de un campeón.
 */
export function calculateAttackSpeed(
  baseAttackSpeed: number,
  attackSpeedRatio: number,
  attackSpeedPerLevel: number,
  level: number,
  bonusAttackSpeed: number = 0
): number {
  const growth = attackSpeedPerLevel / 100 * (level - 1);
  return baseAttackSpeed + (attackSpeedRatio * growth) + bonusAttackSpeed;
}

/**
 * Obtiene las versiones disponibles de Data Dragon.
 */
export async function getVersions(): Promise<string[]> {
  try {
    return await safeFetch<string[]>('https://ddragon.leagueoflegends.com/api/versions.json');
  } catch (err) {
    console.error('[getVersions] Error:', err instanceof Error ? err.message : err);
    return [VERSION];
  }
}

/**
 * Obtiene la versión más reciente disponible.
 */
export async function getLatestVersion(): Promise<string> {
  try {
    const versions = await getVersions();
    return versions[0] || VERSION;
  } catch {
    return VERSION;
  }
}
