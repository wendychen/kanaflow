import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { allHiraganaCharacters } from '../../kana-data'
import WordPractice from './word-practice'

type KanaWordPageProps = {
  params: Promise<{ character: string }>
}

function decodeCharacter(character: string) {
  try {
    return decodeURIComponent(character)
  } catch {
    return character
  }
}

export async function generateMetadata({ params }: KanaWordPageProps): Promise<Metadata> {
  const { character: rawCharacter } = await params
  const character = decodeCharacter(rawCharacter)
  return {
    title: `「${character}」の単語練習 — ことばの森`,
    description: `「${character}」を含む単語を聞いて、ローマ字で練習しよう。`,
  }
}

export default async function KanaWordPage({ params }: KanaWordPageProps) {
  const { character: rawCharacter } = await params
  const character = decodeCharacter(rawCharacter)
  if (!allHiraganaCharacters.has(character)) notFound()

  return <WordPractice character={character} />
}
