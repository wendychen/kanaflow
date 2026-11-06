'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, Check, Flame, RotateCcw, Sparkles, Volume2, VolumeX, X } from 'lucide-react'

type Kana = [character: string, reading: string]
type KanaGroup = { label: string; kana: Kana[] }

function createGroup(label: string, characters: string, readings: string[]): KanaGroup {
  return {
    label,
    kana: Array.from(characters, (character, index) => [character, readings[index]] as Kana),
  }
}

const hiraganaGroups: KanaGroup[] = [
  createGroup('あ行', 'あいうえお', ['a', 'i', 'u', 'e', 'o']),
  createGroup('か行', 'かきくけこ', ['ka', 'ki', 'ku', 'ke', 'ko']),
  createGroup('さ行', 'さしすせそ', ['sa', 'shi', 'su', 'se', 'so']),
  createGroup('た行', 'たちつてと', ['ta', 'chi', 'tsu', 'te', 'to']),
  createGroup('な行', 'なにぬねの', ['na', 'ni', 'nu', 'ne', 'no']),
  createGroup('は行', 'はひふへほ', ['ha', 'hi', 'fu', 'he', 'ho']),
  createGroup('ま行', 'まみむめも', ['ma', 'mi', 'mu', 'me', 'mo']),
  createGroup('や・わ行', 'やゆよわを', ['ya', 'yu', 'yo', 'wa', 'wo']),
  createGroup('ら行', 'らりるれろ', ['ra', 'ri', 'ru', 're', 'ro']),
  createGroup('ん・まとめ', 'んわをらろ', ['n', 'wa', 'wo', 'ra', 'ro']),
  createGroup('が行', 'がぎぐげご', ['ga', 'gi', 'gu', 'ge', 'go']),
  createGroup('ざ行', 'ざじずぜぞ', ['za', 'ji', 'zu', 'ze', 'zo']),
  createGroup('だ行', 'だぢづでど', ['da', 'ji', 'zu', 'de', 'do']),
  createGroup('ば行', 'ばびぶべぼ', ['ba', 'bi', 'bu', 'be', 'bo']),
  createGroup('ぱ行', 'ぱぴぷぺぽ', ['pa', 'pi', 'pu', 'pe', 'po']),
  createGroup('小さい あ行', 'ぁぃぅぇぉ', ['a', 'i', 'u', 'e', 'o']),
  createGroup('小さい や・つ・わ', 'ゃゅょっゎ', ['ya', 'yu', 'yo', 'tsu', 'wa']),
  createGroup('まれな文字', 'ゕゖゔゐゑ', ['ka', 'ke', 'vu', 'wi', 'we']),
]

function toKatakana(character: string) {
  return String.fromCharCode(character.charCodeAt(0) + 0x60)
}

function toKatakanaLabel(label: string) {
  if (label === 'や・わ行') return 'ヤ・ワ行'
  if (label === 'ん・まとめ') return 'ン・まとめ'
  if (label === '小さい や・つ・わ') return '小さい ヤ・ツ・ワ'
  return label.replace(/([ぁ-ゖ])行$/, (row) => `${toKatakana(row[0])}行`)
}

const katakanaGroups: KanaGroup[] = hiraganaGroups.map(({ label, kana }) => ({
  label: toKatakanaLabel(label),
  kana: kana.map(([character, reading]) => [toKatakana(character), reading] as Kana),
}))
katakanaGroups.push({
  label: '濁点つき旧仮名',
  kana: [['ヷ', 'va'], ['ヸ', 'vi'], ['ヹ', 've'], ['ヺ', 'vo']],
})

function createPracticeSequence(kanaCount: number, cellCount: number, seed: number) {
  if (kanaCount <= 0) return []

  let randomState = seed >>> 0
  const random = () => {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0
    return randomState / 4294967296
  }
  const remaining = Array.from(
    { length: kanaCount },
    (_, index) => Math.floor(cellCount / kanaCount) + (index < cellCount % kanaCount ? 1 : 0),
  )
  const sequence: number[] = []

  for (let position = 0; position < cellCount; position += 1) {
    const available = remaining
      .map((count, index) => ({ count, index }))
      .filter(({ count }) => count > 0)
    const withoutRepeat = available.filter(({ index }) => index !== sequence[position - 1])
    const choices = withoutRepeat.length > 0 ? withoutRepeat : available
    const highestCount = Math.max(...choices.map(({ count }) => count))
    const mostNeeded = choices.filter(({ count }) => count === highestCount)
    const selected = mostNeeded[Math.floor(random() * mostNeeded.length)]

    sequence.push(selected.index)
    remaining[selected.index] -= 1
  }

  return sequence
}

function speak(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ja-JP'
    utterance.rate = 0.75
    window.speechSynthesis.speak(utterance)
  }
}

function WritingCell({ kana, done, onDone, onClear }: { kana: Kana; done: boolean; onDone: () => void; onClear: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.lineWidth = 4
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = '#be3a2e'
  }, [kana, done])

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return { x: (event.clientX - rect.left) * (canvas.width / rect.width), y: (event.clientY - rect.top) * (canvas.height / rect.height) }
  }
  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const context = canvasRef.current?.getContext('2d')
    const position = point(event)
    if (!context || !position || done) return
    drawing.current = true
    context.beginPath()
    context.moveTo(position.x, position.y)
    canvasRef.current?.setPointerCapture(event.pointerId)
  }
  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const context = canvasRef.current?.getContext('2d')
    const position = point(event)
    if (!context || !position) return
    context.lineTo(position.x, position.y)
    context.stroke()
  }
  return <article className={`relative rounded-xl border p-2 transition-colors ${done ? 'border-[#c9aa62] bg-[#fff7dd]' : 'border-[#e5d8c5] bg-[#fffaf0]'}`}>
    <div className="flex items-center justify-between px-1"><span className="font-serif text-lg text-[#332d28]">{kana[0]}</span><span className="font-mono text-[9px] text-[#a0866c]">{kana[1]}</span></div>
    <div className="relative mt-1 aspect-square overflow-hidden rounded-lg border border-dashed border-[#ddcdb7] bg-[#fcf7ed]" style={{ backgroundImage: 'linear-gradient(#eadfce 1px, transparent 1px), linear-gradient(90deg, #eadfce 1px, transparent 1px)', backgroundSize: '50% 50%' }}>
      <div className="pointer-events-none absolute inset-0 grid place-items-center font-serif text-[62px] leading-none text-[#be3a2e]/[0.10]">{kana[0]}</div>
      <canvas ref={canvasRef} width={160} height={160} className="relative size-full touch-none" onPointerDown={start} onPointerMove={draw} onPointerUp={() => { drawing.current = false }} onPointerCancel={() => { drawing.current = false }} aria-label={`${kana[0]}を書く`} />
      {done && <div className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-[#c9aa62] text-white"><Check className="size-3" /></div>}
    </div>
    <div className="mt-1 flex gap-1"><button onClick={onClear} className="grid size-7 place-items-center rounded-md text-[#a0866c] hover:bg-[#f5eadb]" aria-label={`${kana[0]}を書き直す`}><RotateCcw className="size-3" /></button><button onClick={onDone} className="flex h-7 flex-1 items-center justify-center rounded-md bg-[#be3a2e] text-[10px] font-bold text-[#fff8e8]">{done ? 'できた' : '完了'}</button></div>
  </article>
}

export default function Page() {
  const [script, setScript] = useState<'ひらがな' | 'カタカナ'>('ひらがな')
  const [groupIndex, setGroupIndex] = useState(0)
  const [practiceRound, setPracticeRound] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [showWin, setShowWin] = useState(false)
  const [streak, setStreak] = useState(3)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const groups = script === 'ひらがな' ? hiraganaGroups : katakanaGroups
  const practiceGroup = groups[groupIndex] ?? groups[0]!
  const practiceSet = practiceGroup.kana
  const allKanaCount = new Set(groups.flatMap(({ kana }) => kana.map(([character]) => character))).size
  const sequenceSeed = (script === 'ひらがな' ? 1 : 2) * 1_000_000 + groupIndex * 1_000 + practiceRound
  const sequence = useMemo(
    () => createPracticeSequence(practiceSet.length, 100, sequenceSeed),
    [practiceSet.length, sequenceSeed],
  )
  const completedCount = completed.size

  const markComplete = (index: number) => {
    if (completed.has(index)) return
    setCompleted((current) => new Set(current).add(index))
    setStreak((value) => value + 1)
    setShowWin(true)
    window.setTimeout(() => setShowWin(false), 1800)
  }

  const reset = () => {
    setCompleted(new Set())
    setPracticeRound((current) => current + 1)
  }

  return <main className="min-h-screen overflow-x-hidden bg-[#f7f1e5] text-[#2f2b27]">
    <div className="mx-auto flex min-h-screen w-full max-w-[720px] flex-col px-4 pb-8 pt-5 sm:px-7">
      <header className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="relative grid size-11 place-items-center rounded-[15px] bg-[#be3a2e] text-2xl text-[#fff8e8] shadow-[0_5px_0_#8d2923]">あ<span className="absolute -right-1 -top-1 size-2 rounded-full bg-[#e7b33b]" /></div><div><p className="font-serif text-[19px] font-semibold tracking-tight">ことばの森</p><p className="text-[11px] tracking-[0.18em] text-[#887b70]">かなの練習</p></div></div><div className="flex items-center gap-2 rounded-full border border-[#dfd2bf] bg-[#fffaf0]/75 px-3 py-2 text-sm font-semibold"><Flame className="size-4 fill-[#d98c3f] text-[#d98c3f]" /> {streak}日</div></header>
      <section className="mt-8"><div className="flex items-end justify-between gap-4"><div><p className="mb-1 text-xs font-semibold tracking-[0.15em] text-[#be3a2e]">今日の練習</p><h1 className="font-serif text-[31px] font-semibold leading-tight">{practiceSet.length}文字を、100回<br />なぞってみよう</h1></div><div className="pb-1 text-right"><p className="text-2xl font-semibold">{completedCount}<span className="text-sm text-[#9c8d80]"> / 100</span></p><p className="text-[11px] text-[#887b70]">できたマス</p></div></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-[#e7dac8]"><div className="h-full rounded-full bg-[#be3a2e] transition-all" style={{ width: `${completedCount}%` }} /></div><p className="mt-2 text-xs text-[#887b70]">{practiceSet.map(([character]) => character).join(' ・ ')} の順番をランダムに練習中</p></section>
      <div className="mt-4 flex justify-end"><Link href="/gojuon" className="inline-flex items-center gap-2 rounded-full border border-[#e5d8c5] bg-[#fffaf0] px-3 py-2 text-xs font-semibold text-[#be3a2e] transition hover:bg-[#f5eadb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#be3a2e]"><BookOpen className="size-4" aria-hidden="true" />五十音表を見る</Link></div>
      <div className="mt-6 grid grid-cols-2 rounded-xl bg-[#e9dfcf] p-1.5" role="tablist" aria-label="文字の種類">{(['ひらがな', 'カタカナ'] as const).map((item) => <button key={item} role="tab" aria-selected={script === item} onClick={() => { setScript(item); setGroupIndex(0); setCompleted(new Set()); setShowWin(false) }} className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${script === item ? 'bg-[#fffaf0] text-[#be3a2e] shadow-sm' : 'text-[#897b6d]'}`}>{item}</button>)}</div>
      <section className="mt-4 rounded-2xl border border-[#e8dac5] bg-[#efe4d2]/70 p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <label htmlFor="kana-group" className="text-sm font-semibold">練習セット</label>
          <span className="text-[11px] text-[#887b70]">全{allKanaCount}文字</span>
        </div>
        <select id="kana-group" value={groupIndex} onChange={(event) => { setGroupIndex(Number(event.target.value)); setCompleted(new Set()); setShowWin(false) }} className="block w-full rounded-xl border border-[#e5d8c5] bg-[#fffaf0] px-3 py-2.5 text-sm font-semibold text-[#332d28] outline-none focus-visible:ring-2 focus-visible:ring-[#be3a2e]">
          {groups.map((group, index) => <option key={`${group.label}-${index}`} value={index}>{group.label}　{group.kana.map(([character]) => character).join(' ')}</option>)}
        </select>
        <p className="mt-2 text-[11px] text-[#887b70]">基本・濁音・半濁音・小さい文字・まれな文字を収録</p>
      </section>
      <section className="mt-5 rounded-[25px] border border-[#e8dac5] bg-[#fffaf0] p-3 shadow-[0_12px_35px_rgba(98,70,41,0.08)] sm:p-4"><div className="flex items-center justify-between px-1 pb-3"><div><p className="text-sm font-bold">100マス練習</p><p className="text-xs text-[#887b70]">{practiceSet.length}文字を均等に、ランダムな順番で。</p></div><div className="flex gap-1"><button onClick={() => setIsMuted((value) => !value)} className="grid size-9 place-items-center rounded-full text-[#9c8d80] hover:bg-[#f5eadb]" aria-label="音声を切り替え">{isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}</button><button onClick={reset} className="grid size-9 place-items-center rounded-full text-[#9c8d80] hover:bg-[#f5eadb]" aria-label="すべてリセット"><RotateCcw className="size-4" /></button></div></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-5">{sequence.map((kanaIndex, index) => <WritingCell key={`${script}-${index}`} kana={practiceSet[kanaIndex]} done={completed.has(index)} onDone={() => { markComplete(index); if (!isMuted) speak(practiceSet[kanaIndex][0]) }} onClear={() => setCompleted((current) => { const next = new Set(current); next.delete(index); return next })} />)}</div></section>
      <section className="mt-5 flex items-center gap-3 rounded-2xl border border-[#e8dac5] bg-[#efe4d2]/70 p-4"><div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f9ecd8] text-[#be3a2e]"><Sparkles className="size-5" /></div><div><p className="text-sm font-semibold">小さな一歩も、すごい。</p><p className="mt-0.5 text-xs text-[#887b70]">1マスできるたび、森が少しずつ育つよ。</p></div></section>
      <div className="mt-5 flex items-center justify-center gap-2 text-[10px] tracking-[0.1em] text-[#ad9d8b]"><span className="size-1 rounded-full bg-[#d8c6ae]" /> 学習を続けるための広告 <button className="underline underline-offset-2">表示について</button></div>
    </div>
    {showWin && <div className="fixed inset-x-5 top-5 z-10 mx-auto flex max-w-[470px] items-center gap-3 rounded-2xl border border-[#e6c88f] bg-[#fff8e8] px-4 py-3 shadow-xl" role="status"><div className="grid size-9 place-items-center rounded-full bg-[#e7b33b] text-white"><Sparkles className="size-4" /></div><div><p className="text-sm font-bold">すばらしい！</p><p className="text-xs text-[#887b70]">1マスできたね。次もいこう。</p></div><button className="ml-auto text-[#ad9d8b]" onClick={() => setShowWin(false)} aria-label="閉じる"><X className="size-4" /></button></div>}
  </main>
}
