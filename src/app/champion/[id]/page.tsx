'use client';

import { notFound } from "next/navigation";
import { getChampionAudioQuotes, getChampionById } from '@/app/lib/api';
import ChampionDetailClient from './ChampionDetailClient';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = {
  params: {
    id: string;
  };
};

export default async function ChampionPage(props: { params: Params['params'] }) {
  // ⚠️ params ahora puede ser un Promise en Turbopack
  const { id } = await props.params; // Desestructuramos con await

  const champion = await getChampionById(id);
  if (!champion) return notFound();

  const quotes = await getChampionAudioQuotes(champion.name);

  return <ChampionDetailClient champion={champion} quotes={quotes} />;
}
