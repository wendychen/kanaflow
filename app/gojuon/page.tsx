import type { Metadata } from 'next'
import KanaChart from './kana-chart'

export const metadata: Metadata = {
  title: '五十音表 — ことばの森',
  description: 'ひらがなとカタカナの五十音表を見ながら、文字を選んで単語練習。',
}

export default function GojuonPage() {
  return <KanaChart />
}
