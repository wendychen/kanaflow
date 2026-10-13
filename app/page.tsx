'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Check,
  ChevronRight,
  Flame,
  Headphones,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'

const hiragana = [
  ['あ', 'a'], ['い', 'i'], ['う', 'u'], ['え', 'e'], ['お', 'o'],
  ['か', 'ka'], ['き', 'ki'], ['く', 'ku'], ['け', 'ke'], ['こ', 'ko'],
  ['さ', 'sa'], ['し', 'shi'], ['す', 'su'], ['せ', 'se'], ['そ', 'so'],
  ['た', 'ta'], ['ち', 'chi'], ['つ', 'tsu'], ['て', 'te'], ['と', 'to'],
  ['な', 'na'], ['に', 'ni'], ['ぬ', 'nu'], ['ね', 'ne'], ['の', 'no'],
  ['は', 'ha'], ['ひ', 'hi'], ['ふ', 'fu'], ['へ', 'he'], ['ほ', 'ho'],
  ['ま', 'ma'], ['み', 'mi'], ['む', 'mu'], ['め', 'me'], ['も', 'mo'],
  ['や', 'ya'], ['ゆ', 'yu'], ['よ', 'yo'], ['ら', 'ra'], ['り', 'ri'],
  ['る', 'ru'], ['れ', 're'], ['ろ', 'ro'], ['わ', 'wa'], ['を', 'wo'], ['ん', 'n'],
]

const katakana = [
  ['ア', 'a'], ['イ', 'i'], ['ウ', 'u'], ['エ', 'e'], ['オ', 'o'],
  ['カ', 'ka'], ['キ', 'ki'], ['ク', 'ku'], ['ケ', 'ke'], ['コ', 'ko'],
  ['サ', 'sa'], ['シ', 'shi'], ['ス', 'su'], ['セ', 'se'], ['ソ', 'so'],
  ['タ', 'ta'], ['チ', 'chi'], ['ツ', 'tsu'], ['テ', 'te'], ['ト', 'to'],
  ['ナ', 'na'], ['ニ', 'ni'], ['ヌ', 'nu'], ['ネ', 'ne'], ['ノ', 'no'],
  ['ハ', 'ha'], ['ヒ', 'hi'], ['フ', 'fu'], ['ヘ', 'he'], ['ホ', 'ho'],
  ['マ', 'ma'], ['ミ', 'mi'], ['ム', 'mu'], ['メ', 'me'], ['モ', 'mo'],
  ['ヤ', 'ya'], ['ユ', 'yu'], ['ヨ', 'yo'], ['ラ', 'ra'], ['リ', 'ri'],
  ['ル', 'ru'], ['レ', 're'], ['ロ', 'ro'], ['ワ', 'wa'], ['ヲ', 'wo'], ['ン', 'n'],
]

function speak(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ja-JP'
    utterance.rate = 0.75
    window.speechSynthesis.speak(utterance)
  }
}

export default function Page() {
  const [script, setScript] = useState<'ひらがな' | 'カタカナ'>('ひらがな')
  const [selected, setSelected] = useState(0)
  const [completed, setCompleted] = useState(12)
  const [streak, setStreak] = useState(3)
  const [isMuted, setIsMuted] = useState(false)
  const [showWin, setShowWin] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const kana = script === 'ひらがな' ? hiragana : katakana
  const current = kana[selected]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.lineWidth = 6
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = '#be3a2e'
  }, [selected, script])

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const context = canvasRef.current?.getContext('2d')
    const position = point(event)
    if (!context || !position) return
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

  const finishDrawing = () => { drawing.current = false }

  const markComplete = () => {
    setCompleted((value) => value + 1)
    setStreak((value) => value + 1)
    setShowWin(true)
    window.setTimeout(() => setShowWin(false), 2200)
    if (selected < kana.length - 1) setSelected((value) => value + 1)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height)
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f1e5] text-[#2f2b27]">
      <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col px-5 pb-8 pt-5 sm:px-7">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative grid size-11 place-items-center rounded-[15px] bg-[#be3a2e] text-2xl text-[#fff8e8] shadow-[0_5px_0_#8d2923]">あ<span className="absolute -right-1 -top-1 size-2 rounded-full bg-[#e7b33b]" /></div>
            <div>
              <p className="font-serif text-[19px] font-semibold tracking-tight">ことばの森</p>
              <p className="text-[11px] tracking-[0.18em] text-[#887b70]">KANA PRACTICE</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#dfd2bf] bg-[#fffaf0]/75 px-3 py-2 text-sm font-semibold">
            <Flame className="size-4 fill-[#d98c3f] text-[#d98c3f]" /> {streak}日
          </div>
        </header>

        <section className="mt-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold tracking-[0.15em] text-[#be3a2e]">今日の練習</p>
              <h1 className="font-serif text-[31px] font-semibold leading-tight">ひらがなを<br />なぞってみよう</h1>
            </div>
            <div className="pb-1 text-right"><p className="text-2xl font-semibold">{completed}<span className="text-sm text-[#9c8d80"> / 46</span></p><p className="text-[11px] text-[#887b70]">できた文字</p></div>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#e7dac8]"><div className="h-full rounded-full bg-[#be3a2e] transition-all" style={{ width: `${Math.min((completed / 46) * 100, 100)}%` }} /></div>
        </section>

        <div className="mt-7 grid grid-cols-2 rounded-xl bg-[#e9dfcf] p-1.5" role="tablist" aria-label="文字の種類">
          {(['ひらがな', 'カタカナ'] as const).map((item) => <button key={item} role="tab" aria-selected={script === item} onClick={() => { setScript(item); setSelected(0) }} className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${script === item ? 'bg-[#fffaf0] text-[#be3a2e] shadow-sm' : 'text-[#897b6d]'}`}>{item}</button>)}
        </div>

        <section className="mt-5 rounded-[25px] border border-[#e8dac5] bg-[#fffaf0] p-4 shadow-[0_12px_35px_rgba(98,70,41,0.08)]">
          <div className="flex items-center justify-between"><span className="rounded-full bg-[#f4e8d2] px-3 py-1 text-xs font-semibold text-[#9c6b36]">{selected + 1} / {kana.length}</span><button className="rounded-full p-2 text-[#9c8d80] hover:bg-[#f5eadb]" aria-label="音声を切り替え" onClick={() => setIsMuted((value) => !value)}>{isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}</button></div>
          <div className="mt-3 flex items-center justify-center gap-5"><div className="font-serif text-[96px] leading-none text-[#332d28]">{current[0]}</div><button onClick={() => !isMuted && speak(current[0])} className="grid size-12 place-items-center rounded-full bg-[#f5e7d3] text-[#be3a2e] transition-transform hover:scale-105" aria-label={`${current[0]} の発音を聞く`}><Headphones className="size-5" /></button></div>
          <p className="mt-2 text-center font-mono text-sm tracking-[0.2em] text-[#a0866c]">{current[1]}</p>
          <div className="relative mt-5 aspect-square overflow-hidden rounded-[18px] border-2 border-dashed border-[#ddcdb7] bg-[#fcf7ed]" style={{ backgroundImage: 'linear-gradient(#eadfce 1px, transparent 1px), linear-gradient(90deg, #eadfce 1px, transparent 1px)', backgroundSize: '25% 25%' }}>
            <div className="pointer-events-none absolute inset-0 grid place-items-center font-serif text-[180px] leading-none text-[#be3a2e]/[0.09]">{current[0]}</div>
            <canvas ref={canvasRef} width={400} height={400} className="relative size-full touch-none" onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={finishDrawing} onPointerCancel={finishDrawing} aria-label="文字を書くキャンバス" />
            <span className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-[11px] text-[#b19b83]">指でなぞる</span>
          </div>
          <div className="mt-4 flex gap-2"><button onClick={clearCanvas} className="grid size-12 shrink-0 place-items-center rounded-xl border border-[#e2d4c1] text-[#9a8977] transition-colors hover:bg-[#f5eadb]" aria-label="書き直す"><RotateCcw className="size-4" /></button><button onClick={markComplete} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#be3a2e] px-4 text-sm font-bold text-[#fff8e8] shadow-[0_4px_0_#8d2923] transition-all hover:translate-y-px hover:shadow-[0_3px_0_#8d2923]">できた！ <Check className="size-4" /></button></div>
        </section>

        <section className="mt-5 flex items-center gap-3 rounded-2xl border border-[#e8dac5] bg-[#efe4d2]/70 p-4"><div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f9ecd8] text-[#be3a2e]"><Sparkles className="size-5" /></div><div><p className="text-sm font-semibold">小さな一歩も、すごい。</p><p className="mt-0.5 text-xs text-[#887b70]">毎日3文字で、森が少しずつ育つよ。</p></div><ChevronRight className="ml-auto size-4 text-[#b19b83]" /></section>

        <div className="mt-5 flex items-center justify-center gap-2 text-[10px] tracking-[0.1em] text-[#ad9d8b]"><span className="size-1 rounded-full bg-[#d8c6ae]" /> 学習を続けるための広告 <button className="underline underline-offset-2">表示について</button></div>
      </div>
      {showWin && <div className="fixed inset-x-5 top-5 z-10 mx-auto flex max-w-[470px] items-center gap-3 rounded-2xl border border-[#e6c88f] bg-[#fff8e8] px-4 py-3 shadow-xl" role="status"><div className="grid size-9 place-items-center rounded-full bg-[#e7b33b] text-white"><Sparkles className="size-4" /></div><div><p className="text-sm font-bold">すばらしい！</p><p className="text-xs text-[#887b70]">{current[0]} を覚えたね。次もいこう。</p></div><button className="ml-auto text-[#ad9d8b]" onClick={() => setShowWin(false)} aria-label="閉じる"><X className="size-4" /></button></div>}
    </main>
  )
}
