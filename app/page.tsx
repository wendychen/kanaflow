'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Flame, Headphones, RotateCcw, Sparkles, Volume2, VolumeX, X } from 'lucide-react'

const hiragana = [
  ['あ', 'a'], ['い', 'i'], ['う', 'u'], ['え', 'e'], ['お', 'o'], ['か', 'ka'], ['き', 'ki'], ['く', 'ku'], ['け', 'ke'], ['こ', 'ko'],
  ['さ', 'sa'], ['し', 'shi'], ['す', 'su'], ['せ', 'se'], ['そ', 'so'], ['た', 'ta'], ['ち', 'chi'], ['つ', 'tsu'], ['て', 'te'], ['と', 'to'],
  ['な', 'na'], ['に', 'ni'], ['ぬ', 'nu'], ['ね', 'ne'], ['の', 'no'], ['は', 'ha'], ['ひ', 'hi'], ['ふ', 'fu'], ['へ', 'he'], ['ほ', 'ho'],
  ['ま', 'ma'], ['み', 'mi'], ['む', 'mu'], ['め', 'me'], ['も', 'mo'], ['や', 'ya'], ['ゆ', 'yu'], ['よ', 'yo'], ['ら', 'ra'], ['り', 'ri'],
  ['る', 'ru'], ['れ', 're'], ['ろ', 'ro'], ['わ', 'wa'], ['を', 'wo'], ['ん', 'n'],
]
const katakana = hiragana.map(([_, sound]) => [String.fromCharCode(_.charCodeAt(0) + 0x60), sound])

type Kana = [string, string]

function shuffled<T>(items: T[]) {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[target]] = [copy[target], copy[index]]
  }
  return copy
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
  const [isMuted, setIsMuted] = useState(false)
  const [showWin, setShowWin] = useState(false)
  const [streak, setStreak] = useState(3)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const kana = script === 'ひらがな' ? hiragana : katakana
  const practiceSet = kana.slice(0, 5) as Kana[]
  const sequence = useMemo(() => shuffled(Array.from({ length: 20 }, () => practiceSet).flat().map((_, index) => index % 5)), [script])
  const completedCount = completed.size

  const markComplete = (index: number) => {
    if (completed.has(index)) return
    setCompleted((current) => new Set(current).add(index))
    setStreak((value) => value + 1)
    setShowWin(true)
    window.setTimeout(() => setShowWin(false), 1800)
  }

  const reset = () => setCompleted(new Set())

  return <main className="min-h-screen overflow-x-hidden bg-[#f7f1e5] text-[#2f2b27]">
    <div className="mx-auto flex min-h-screen w-full max-w-[720px] flex-col px-4 pb-8 pt-5 sm:px-7">
      <header className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="relative grid size-11 place-items-center rounded-[15px] bg-[#be3a2e] text-2xl text-[#fff8e8] shadow-[0_5px_0_#8d2923]">あ<span className="absolute -right-1 -top-1 size-2 rounded-full bg-[#e7b33b]" /></div><div><p className="font-serif text-[19px] font-semibold tracking-tight">ことばの森</p><p className="text-[11px] tracking-[0.18em] text-[#887b70]">KANA PRACTICE</p></div></div><div className="flex items-center gap-2 rounded-full border border-[#dfd2bf] bg-[#fffaf0]/75 px-3 py-2 text-sm font-semibold"><Flame className="size-4 fill-[#d98c3f] text-[#d98c3f]" /> {streak}日</div></header>
      <section className="mt-8"><div className="flex items-end justify-between gap-4"><div><p className="mb-1 text-xs font-semibold tracking-[0.15em] text-[#be3a2e]">今日の練習</p><h1 className="font-serif text-[31px] font-semibold leading-tight">5文字を、100回<br />なぞってみよう</h1></div><div className="pb-1 text-right"><p className="text-2xl font-semibold">{completedCount}<span className="text-sm text-[#9c8d80]"> / 100</span></p><p className="text-[11px] text-[#887b70]">できたマス</p></div></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-[#e7dac8]"><div className="h-full rounded-full bg-[#be3a2e] transition-all" style={{ width: `${completedCount}%` }} /></div><p className="mt-2 text-xs text-[#887b70]">{practiceSet.map(([character]) => character).join(' ・ ')} の順番をランダムに練習中</p></section>
      <div className="mt-6 grid grid-cols-2 rounded-xl bg-[#e9dfcf] p-1.5" role="tablist" aria-label="文字の種類">{(['ひらがな', 'カタカナ'] as const).map((item) => <button key={item} role="tab" aria-selected={script === item} onClick={() => { setScript(item); setCompleted(new Set()) }} className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${script === item ? 'bg-[#fffaf0] text-[#be3a2e] shadow-sm' : 'text-[#897b6d]'}`}>{item}</button>)}</div>
      <section className="mt-5 rounded-[25px] border border-[#e8dac5] bg-[#fffaf0] p-3 shadow-[0_12px_35px_rgba(98,70,41,0.08)] sm:p-4"><div className="flex items-center justify-between px-1 pb-3"><div><p className="text-sm font-bold">100マス練習</p><p className="text-xs text-[#887b70]">5文字のすべての出現を、ランダムな順番で。</p></div><div className="flex gap-1"><button onClick={() => setIsMuted((value) => !value)} className="grid size-9 place-items-center rounded-full text-[#9c8d80] hover:bg-[#f5eadb]" aria-label="音声を切り替え">{isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}</button><button onClick={reset} className="grid size-9 place-items-center rounded-full text-[#9c8d80] hover:bg-[#f5eadb]" aria-label="すべてリセット"><RotateCcw className="size-4" /></button></div></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-5">{sequence.map((kanaIndex, index) => <WritingCell key={`${script}-${index}`} kana={practiceSet[kanaIndex]} done={completed.has(index)} onDone={() => { markComplete(index); if (!isMuted) speak(practiceSet[kanaIndex][0]) }} onClear={() => setCompleted((current) => { const next = new Set(current); next.delete(index); return next })} />)}</div></section>
      <section className="mt-5 flex items-center gap-3 rounded-2xl border border-[#e8dac5] bg-[#efe4d2]/70 p-4"><div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f9ecd8] text-[#be3a2e]"><Sparkles className="size-5" /></div><div><p className="text-sm font-semibold">小さな一歩も、すごい。</p><p className="mt-0.5 text-xs text-[#887b70]">1マスできるたび、森が少しずつ育つよ。</p></div></section>
      <div className="mt-5 flex items-center justify-center gap-2 text-[10px] tracking-[0.1em] text-[#ad9d8b]"><span className="size-1 rounded-full bg-[#d8c6ae]" /> 学習を続けるための広告 <button className="underline underline-offset-2">表示について</button></div>
    </div>
    {showWin && <div className="fixed inset-x-5 top-5 z-10 mx-auto flex max-w-[470px] items-center gap-3 rounded-2xl border border-[#e6c88f] bg-[#fff8e8] px-4 py-3 shadow-xl" role="status"><div className="grid size-9 place-items-center rounded-full bg-[#e7b33b] text-white"><Sparkles className="size-4" /></div><div><p className="text-sm font-bold">すばらしい！</p><p className="text-xs text-[#887b70]">1マスできたね。次もいこう。</p></div><button className="ml-auto text-[#ad9d8b]" onClick={() => setShowWin(false)} aria-label="閉じる"><X className="size-4" /></button></div>}
  </main>
}
