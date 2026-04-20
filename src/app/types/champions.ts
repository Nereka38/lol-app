export interface Quote {
  text: string;
  audio: string;
}

export interface Skin {
  id: string;
  num: number;
  name: string;
  chromas: boolean;
  image?: string;
}

export interface ChampionImage {
  full: string;
  sprite: string;
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ChampionSpell {
  id: string;
  name: string;
  description: string;
  tooltip: string;
  leveltip: {
    label: string[];
    effect: string[];
  };
  maxrank: number;
  cooldown: number[];
  cooldownBurn: string;
  cost: number[];
  costBurn: string;
  costType: string;
  range: number[];
  rangeBurn: string;
  image: ChampionImage;
  resource: string;
  // Efectos y vars para procesar placeholders en descripciones
  effect?: (number[] | null)[];
  vars?: { key: string; coeff: number | number[]; link?: string }[];
}

export interface ChampionPassive {
  name: string;
  description: string;
  image: ChampionImage;
}

export interface ChampionStats {
  // Vida
  hp: number;
  hpperlevel: number;
  hpregen: number;
  hpregenperlevel: number;

  // Mana/Energía
  mp: number;
  mpperlevel: number;
  mpregen: number;
  mpregenperlevel: number;

  // Velocidad
  movespeed: number;

  // Armadura y Resistencia Mágica
  armor: number;
  armorperlevel: number;
  spellblock: number;
  spellblockperlevel: number;

  // Daño y Ataque
  attackdamage: number;
  attackdamageperlevel: number;
  attackspeed: number;
  attackspeedperlevel: number;

  // Rango y Crítico
  attackrange: number;
  crit: number;
  critperlevel: number;
}

export interface ChampionInfo {
  attack: number;
  defense: number;
  magic: number;
  difficulty: number;
}

export interface Champion {
  id: string;
  key: string;
  name: string;
  title: string;
  blurb: string;
  lore?: string;
  tags: string[];
  image: ChampionImage;
  skins?: Skin[];
  stats: ChampionStats;
  info: ChampionInfo;
  spells?: ChampionSpell[];
  passive?: ChampionPassive;
}

export interface ChampionDetailResponse {
  data: {
    [key: string]: Champion;
  };
}

export interface ChampionListResponse {
  data: {
    [key: string]: Champion;
  };
}
