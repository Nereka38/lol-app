export interface Champion {
  id: string;
  name: string;
  title: string;
  lore?: string;
  image?: string;
  tags?: string[];  // Esta es la propiedad que falta
  blurb?: string;  // Si tienes alguna descripción corta del campeón
}

  export interface ChampionDetail extends Champion {
    lore: string;
    tags: string[];
    stats: {
      attack: number;
      defense: number;
      magic: number;
      difficulty: number;
      [key: string]: number;
    };
  }
  
  export interface ChampionDetailResponse {
    data: {
      [key: string]: ChampionDetail;
    };
  }
  