'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, BookOpen, Check, Sparkles, Volume2, X } from 'lucide-react'
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
  const celebrationTimer = useRef<number | null>(null)
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

            <ol className="mt-5 flex flex-col gap-3">
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
                  <li key={`${word.kana}-${index}`} className="overflow-hidden rounded-2xl border border-[#e8dac5] bg-[#fffaf0] shadow-[0_8px_24px_rgba(98,70,41,0.04)]">
                    <div className="grid grid-cols-[80px_minmax(0,1fr)] sm:grid-cols-[104px_minmax(0,1fr)] lg:grid-cols-[136px_minmax(0,1fr)]">
                      <figure className="relative aspect-[4/5] w-full min-w-0 overflow-hidden bg-[#efe4d2]">
                        <Image
                          src={word.imageUrl}
                          alt={word.imageAlt}
                          fill
                          sizes="(max-width: 639px) 80px, (max-width: 1023px) 104px, 136px"
                          loading={index < 3 ? 'eager' : 'lazy'}
                          className="object-cover"
                        />
                      </figure>
                      <div className="flex min-w-0 flex-col justify-center p-2 sm:p-3">
                        <div className="grid grid-cols-[minmax(0,1fr)_2rem_4.5rem] items-center gap-1.5 sm:grid-cols-[minmax(0,1fr)_2.5rem_5.5rem] sm:gap-2 lg:grid-cols-[minmax(0,1fr)_2.75rem_8rem] lg:gap-3">
                          <span className="min-w-0 truncate font-serif text-base leading-none text-[#332d28] sm:text-lg lg:text-xl" lang="ja">{word.kana}</span>
                          <button
                            type="button"
                            onClick={() => playWord(word.kana)}
                            aria-label={`「${word.kana}」の発音を聞く`}
                            className="grid size-8 place-items-center rounded-full border border-[#e5d8c5] bg-[#f8f0e3] text-[#be3a2e] transition hover:bg-[#f2e5d2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#be3a2e] sm:size-10 lg:size-11"
                          >
                            <Volume2 className="size-4" aria-hidden="true" />
                          </button>
                          <label htmlFor={inputId} className="sr-only">「{word.kana}」のローマ字</label>
                          <input
                            ref={(input) => {
                              answerInputRefs.current[index] = input
                            }}
                            id={inputId}
                            type="text"
                            value={answers[index] ?? ''}
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
                            placeholder="ローマ字"
                            className={`min-w-0 w-full rounded-lg border px-2 py-2 text-xs text-[#332d28] outline-none placeholder:text-[#b2a392] focus-visible:ring-2 focus-visible:ring-[#be3a2e] sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-sm ${inputStateClass}`}
                          />
                        </div>
                        <p className="mt-1.5 truncate text-[11px] leading-tight text-[#887b70]" aria-hidden="true">{word.imageCaption}</p>
                        <p id={feedbackId} className={`mt-1 min-h-4 text-xs ${result === 'correct' ? 'text-[#537d4d]' : result === 'incorrect' ? 'text-[#a53a2c]' : 'text-transparent'}`} aria-live="polite">
                          {result === 'correct' ? <><Check className="mr-1 inline size-3.5" aria-hidden="true" />正解！</> : result === 'incorrect' ? <><X className="mr-1 inline size-3.5" aria-hidden="true" />もう一度入力してみよう。</> : '　'}
                        </p>
                      </div>
                    </div>
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
