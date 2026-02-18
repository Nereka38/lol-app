import { getChampionAudioQuotes, getChampionById } from '@/app/lib/api';
import ChampionDetailClient from './ChampionDetailClient';

type Params = {
  params: {
    id: string;
  };
};


export default async function ChampionPage({ params }: Params) {
  const { id } = params;
  const champion = await getChampionById(id);
  const quotes = await getChampionAudioQuotes(id);

  return (
    <ChampionDetailClient champion={champion} quotes={quotes} />
  );
}