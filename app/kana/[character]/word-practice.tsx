'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Check, Sparkles, Volume2, X } from 'lucide-react'
import { normalizeRomaji, vocabularyByKana } from '../../kana-data'

function speakWord(word: string) {
  if (!('speechSynthesis' in window)) return false

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(word)
  utterance.lang = 'ja-JP'
  utterance.rate = 0.85
  window.speechSynthesis.speak(utterance)
  return true
}

export default function WordPractice({ character }: { character: string }) {
  const words = vocabularyByKana[character] ?? []
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [results, setResults] = useState<Record<number, 'correct' | 'incorrect'>>({})
  const [celebration, setCelebration] = useState('')
  const [audioMessage, setAudioMessage] = useState('')
  const correctWords = useRef(new Set<number>())
  const answerInputRefs = useRef<Array<HTMLInputElement | null>>([])
  const carouselRef = useRef<HTMLOListElement | null>(null)
  const celebrationTimer = useRef<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const correctCount = Object.values(results).filter((result) => result === 'correct').length

  useEffect(() => () => {
    if (celebrationTimer.current !== null) window.clearTimeout(celebrationTimer.current)
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }, [])

  const checkAnswer = (index: number) => {
    if (correctWords.current.has(index)) return
    const word = words[index]
    const answer = normalizeRomaji(answers[index] ?? '')
    if (!word || !answer) return

    const acceptedAnswers = [word.romaji, ...(word.alternatives ?? [])]
    const isCorrect = acceptedAnswers.some((acceptedAnswer) => normalizeRomaji(acceptedAnswer) === answer)
    setResults((current) => ({ ...current, [index]: isCorrect ? 'correct' : 'incorrect' }))

    if (isCorrect) {
      correctWords.current.add(index)
      const nextCount = correctWords.current.size
      setCelebration(nextCount === words.length ? `全${words.length}語クリア！` : '正解！その調子。')
      if (celebrationTimer.current !== null) window.clearTimeout(celebrationTimer.current)
      celebrationTimer.current = window.setTimeout(() => setCelebration(''), 1800)
    }
  }

  const playWord = (word: string) => {
    setAudioMessage(speakWord(word) ? '' : 'このブラウザーでは音声を再生できません。')
  }

  const goToSlide = (index: number) => {
    const carousel = carouselRef.current
    if (!carousel || words.length === 0) return

    const nextIndex = Math.min(Math.max(index, 0), words.length - 1)
    setActiveIndex(nextIndex)
    carousel.scrollTo({ left: nextIndex * carousel.clientWidth, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-[#f7f1e5] text-[#2f2b27]">
      <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-5 sm:px-7 sm:pt-7">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/gojuon" className="inline-flex items-center gap-2 rounded-full px-2 py-2 text-sm font-semibold text-[#887b70] transition hover:bg-[#efe4d2] hover:text-[#be3a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#be3a2e]">
            <ArrowLeft className="size-4" aria-hidden="true" />
            五十音表へ戻る
          </Link>
          <Link href="/" className="text-xs font-semibold text-[#be3a2e] underline decoration-[#d9b4a4] underline-offset-4 hover:text-[#8d2923]">
            書き練習へ
          </Link>
        </header>

        <section className="mt-7">
          <p className="mb-1 text-xs font-semibold tracking-[0.15em] text-[#be3a2e]">聞いて、書いてみよう</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight">「{character}」の単語カード</h1>
              <p className="mt-2 text-sm text-[#887b70]">写真を見て、発音を聞き、ローマ字で答えよう。</p>
            </div>
            {words.length > 0 && <p className="rounded-full border border-[#dfd2bf] bg-[#fffaf0]/75 px-3 py-2 text-sm font-semibold">{correctCount}<span className="text-[#9c8d80]"> / {words.length}語</span></p>}
          </div>
        </section>

        {words.length === 0 ? (
          <section className="mt-7 rounded-3xl border border-[#e8dac5] bg-[#fffaf0] p-7 text-center shadow-[0_12px_35px_rgba(98,70,41,0.06)] sm:p-10">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#f9ecd8] text-[#be3a2e]"><BookOpen className="size-6" aria-hidden="true" /></div>
            <h2 className="mt-4 font-serif text-xl font-semibold">「{character}」の単語リストは準備中です</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#887b70]">今は「さ」を含む20語を練習できます。五十音表に戻って、別の文字を見ることもできます。</p>
            <Link href="/gojuon" className="mt-5 inline-flex items-center justify-center rounded-full bg-[#be3a2e] px-5 py-2.5 text-sm font-semibold text-[#fff8e8] transition hover:bg-[#a72f27] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#be3a2e] focus-visible:ring-offset-2">
              五十音表へ戻る
            </Link>
          </section>
        ) : (
          <>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#e7dac8]" role="progressbar" aria-label="単語の練習状況" aria-valuemin={0} aria-valuemax={words.length} aria-valuenow={correctCount}>
              <div className="h-full rounded-full bg-[#be3a2e] transition-all" style={{ width: `${(correctCount / words.length) * 100}%` }} />
            </div>

            {celebration && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#e6c88f] bg-[#fff8e8] px-4 py-3" role="status" aria-live="polite">
                <div className="grid size-9 place-items-center rounded-full bg-[#e7b33b] text-white"><Sparkles className="size-4" aria-hidden="true" /></div>
                <p className="text-sm font-bold">{celebration}</p>
              </div>
            )}
            {audioMessage && <p className="mt-3 text-xs text-[#887b70]" role="status">{audioMessage}</p>}

            <div className="mx-auto mt-4 flex max-w-2xl items-center justify-between gap-4">
              <p className="text-sm font-semibold tabular-nums text-[#887b70]" aria-live="polite">
                {activeIndex + 1}<span className="px-1 text-[#b2a392]">/</span>{words.length}<span className="ml-1 text-xs font-normal">語</span>
              </p>
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-[#9c8d80] sm:inline">左右にスワイプして移動</span>
                <button
                  type="button"
                  onClick={() => goToSlide(activeIndex - 1)}
                  disabled={activeIndex === 0}
                  aria-label="前の単語"
                  className="grid size-10 place-items-center rounded-full border border-[#dfd2bf] bg-[#fffaf0] text-[#6c5d51] transition hover:bg-[#f2e5d2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#be3a2e] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => goToSlide(activeIndex + 1)}
                  disabled={activeIndex === words.length - 1}
                  aria-label="次の単語"
                  className="grid size-10 place-items-center rounded-full border border-[#dfd2bf] bg-[#fffaf0] text-[#6c5d51] transition hover:bg-[#f2e5d2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#be3a2e] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <ol
              ref={carouselRef}
              onScroll={(event) => {
                const carousel = event.currentTarget
                if (carousel.clientWidth === 0) return
                const nextIndex = Math.round(carousel.scrollLeft / carousel.clientWidth)
                setActiveIndex((current) => current === nextIndex ? current : nextIndex)
              }}
              aria-label="単語カード"
              className="mx-auto mt-3 flex w-full max-w-2xl snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {words.map((word, index) => {
                const result = results[index]
                const inputId = `romaji-answer-${index}`
                const feedbackId = `romaji-feedback-${index}`
                const inputStateClass = result === 'correct'
                  ? 'border-[#91b58b] bg-[#f2f8ee]'
                  : result === 'incorrect'
                    ? 'border-[#d6816d] bg-[#fff4ef]'
                    : 'border-[#e5d8c5] bg-[#fffaf0]'

                return (
                  <li key={`${word.kana}-${index}`} className="min-w-0 flex-[0_0_100%] snap-center px-1 pb-1">
                    <article className="overflow-hidden rounded-3xl border border-[#e8dac5] bg-[#fffaf0] shadow-[0_12px_35px_rgba(98,70,41,0.08)]">
                      <figure className="relative h-[min(56vh,24rem)] min-h-52 overflow-hidden bg-[#efe4d2]">
                        <Image
                          src={word.imageUrl}
                          alt={word.imageAlt}
                          fill
                          sizes="(max-width: 672px) 100vw, 672px"
                          loading={index < 3 ? 'eager' : 'lazy'}
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => playWord(word.kana)}
                          aria-label={`「${word.kana}」の発音を聞く`}
                          className="absolute right-4 top-4 grid size-12 place-items-center rounded-full border border-white/70 bg-[#fffaf0]/90 text-[#be3a2e] shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#be3a2e]"
                        >
                          <Volume2 className="size-5" aria-hidden="true" />
                        </button>
                      </figure>
                      <div className="p-4 sm:p-6">
                        <div className="mb-3 flex items-baseline justify-between gap-3">
                          <span className="font-serif text-2xl font-semibold text-[#332d28] sm:text-3xl" lang="ja">{word.kana}</span>
                          <span className="truncate text-xs text-[#887b70] sm:text-sm">{word.imageCaption}</span>
                        </div>
                        <label htmlFor={inputId} className="sr-only">「{word.kana}」のローマ字</label>
                        <input
                          ref={(input) => {
                            answerInputRefs.current[index] = input
                          }}
                          id={inputId}
                          type="text"
                          value={answers[index] ?? ''}
                          onFocus={() => {
                            setActiveIndex(index)
                            const carousel = carouselRef.current
                            if (carousel) carousel.scrollTo({ left: index * carousel.clientWidth, behavior: 'smooth' })
                          }}
                          onChange={(event) => {
                            setAnswers((current) => ({ ...current, [index]: event.target.value }))
                            setResults((current) => {
                              if (!current[index] || current[index] === 'correct') return current
                              const next = { ...current }
                              delete next[index]
                              return next
                            })
                          }}
                          onKeyDown={(event) => {
                            if (event.key !== 'Enter' || event.nativeEvent.isComposing || event.keyCode === 229) return
                            event.preventDefault()
                            checkAnswer(index)
                            answerInputRefs.current[index + 1]?.focus()
                          }}
                          onBlur={() => checkAnswer(index)}
                          readOnly={result === 'correct'}
                          aria-invalid={result === 'incorrect'}
                          aria-describedby={feedbackId}
                          autoCapitalize="none"
                          autoComplete="off"
                          spellCheck={false}
                          inputMode="text"
                          placeholder="ローマ字で入力"
                          className={`w-full rounded-xl border px-4 py-3 text-base text-[#332d28] outline-none placeholder:text-[#b2a392] focus-visible:ring-2 focus-visible:ring-[#be3a2e] sm:text-lg ${inputStateClass}`}
                        />
                        <p id={feedbackId} className={`mt-2 min-h-5 text-sm ${result === 'correct' ? 'text-[#537d4d]' : result === 'incorrect' ? 'text-[#a53a2c]' : 'text-transparent'}`} aria-live="polite">
                          {result === 'correct' ? <><Check className="mr-1 inline size-4" aria-hidden="true" />正解！</> : result === 'incorrect' ? <><X className="mr-1 inline size-4" aria-hidden="true" />もう一度入力してみよう。</> : '　'}
                        </p>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ol>
          </>
        )}
      </div>
    </main>
  )
}
