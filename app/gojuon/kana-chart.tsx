'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, BookOpen } from 'lucide-react'
import {
  additionalHiraganaRows,
  additionalKatakanaRows,
  gojuonRows,
  smallKanaRows,
  voicedRows,
  type KanaScript,
  type KanaTableRow,
} from '../kana-data'

const columns: Record<KanaScript, string[]> = {
  hiragana: ['あ段', 'い段', 'う段', 'え段', 'お段'],
  katakana: ['ア段', 'イ段', 'ウ段', 'エ段', 'オ段'],
}

function KanaTable({ rows, script }: { rows: KanaTableRow[]; script: KanaScript }) {
  const isHiragana = script === 'hiragana'

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse" aria-label={isHiragana ? 'ひらがなの五十音表' : 'カタカナの五十音表'}>
        <thead>
          <tr className="border-b border-[#eadfce] text-[10px] font-medium text-[#9b8c7c] sm:text-xs">
            <th scope="col" className="w-12 px-1 py-2 text-left sm:w-20">行</th>
            {columns[script].map((column) => <th key={column} scope="col" className="px-0.5 py-2 text-center">{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-[#f0e8dc] last:border-0">
              <th scope="row" className="px-1 py-1.5 text-left text-[10px] font-semibold text-[#887b70] sm:text-xs">{row.label}</th>
              {row.cells.map((cell, index) => {
                const character = cell ? (isHiragana ? cell.hiragana : cell.katakana) : null

                return (
                  <td key={`${row.label}-${index}`} className="px-0.5 py-1.5 text-center sm:px-1">
                    {character ? isHiragana ? (
                      <Link
                        href={`/kana/${encodeURIComponent(character)}`}
                        aria-label={`${character}を含む単語を練習`}
                        className="mx-auto grid aspect-square w-full max-w-14 place-items-center rounded-xl font-serif text-xl text-[#332d28] transition hover:bg-[#f8eddd] hover:text-[#be3a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#be3a2e] sm:text-2xl"
                      >
                        {character}
                      </Link>
                    ) : (
                      <span className="mx-auto grid aspect-square w-full max-w-14 place-items-center font-serif text-xl text-[#332d28] sm:text-2xl">{character}</span>
                    ) : (
                      <span aria-hidden="true" className="mx-auto grid aspect-square w-full max-w-14 place-items-center text-[#d6c7b4]">·</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function KanaSection({ title, description, rows, script }: { title: string; description?: string; rows: KanaTableRow[]; script: KanaScript }) {
  return (
    <section className="mt-5 rounded-3xl border border-[#e8dac5] bg-[#fffaf0] p-3 shadow-[0_12px_35px_rgba(98,70,41,0.06)] sm:p-5">
      <div className="mb-3 px-1">
        <h2 className="font-serif text-lg font-semibold text-[#332d28]">{title}</h2>
        {description && <p className="mt-1 text-xs text-[#887b70]">{description}</p>}
      </div>
      <KanaTable rows={rows} script={script} />
    </section>
  )
}

export default function KanaChart() {
  const [script, setScript] = useState<KanaScript>('hiragana')
  const isHiragana = script === 'hiragana'
  const additionalRows = isHiragana ? additionalHiraganaRows : [...additionalHiraganaRows, ...additionalKatakanaRows]

  return (
    <main className="min-h-screen bg-[#f7f1e5] text-[#2f2b27]">
      <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-5 sm:px-7 sm:pt-7">
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full px-2 py-2 text-sm font-semibold text-[#887b70] transition hover:bg-[#efe4d2] hover:text-[#be3a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#be3a2e]">
            <ArrowLeft className="size-4" aria-hidden="true" />
            練習へ戻る
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-[#dfd2bf] bg-[#fffaf0]/75 px-3 py-2 text-xs font-semibold text-[#887b70]">
            <BookOpen className="size-4 text-[#be3a2e]" aria-hidden="true" />
            文字を見て練習
          </div>
        </header>

        <section className="mt-7">
          <p className="mb-1 text-xs font-semibold tracking-[0.15em] text-[#be3a2e]">かなの早見表</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">五十音表</h1>
          <p className="mt-2 text-sm text-[#887b70]">ひらがなを選ぶと、その文字を含む単語練習に進みます。</p>
        </section>

        <div className="mt-5 grid grid-cols-2 rounded-xl bg-[#e9dfcf] p-1.5" role="tablist" aria-label="文字の種類">
          {(['hiragana', 'katakana'] as const).map((item) => {
            const label = item === 'hiragana' ? 'ひらがな' : 'カタカナ'
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={script === item}
                onClick={() => setScript(item)}
                className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${script === item ? 'bg-[#fffaf0] text-[#be3a2e] shadow-sm' : 'text-[#897b6d]'}`}
              >
                {label}
              </button>
            )
          })}
        </div>

        <KanaSection
          title="五十音"
          description={isHiragana ? '基本の46文字。文字をタップして単語練習へ。' : '基本の46文字。'}
          rows={gojuonRows}
          script={script}
        />
        <KanaSection title="濁音・半濁音" rows={voicedRows} script={script} />
        <KanaSection title="小さい文字" rows={smallKanaRows} script={script} />
        <KanaSection title="追加・まれな文字" rows={additionalRows} script={script} />

        {!isHiragana && (
          <p className="mt-4 rounded-2xl border border-[#e8dac5] bg-[#efe4d2]/70 p-4 text-xs leading-relaxed text-[#887b70]">
            単語練習は、ひらがな表の文字を選ぶと開きます。
          </p>
        )}
      </div>
    </main>
  )
}
