export type KanaScript = 'hiragana' | 'katakana'

export type KanaTableCell = {
  hiragana: string | null
  katakana: string
  romaji: string
}

export type KanaTableRow = {
  label: string
  cells: Array<KanaTableCell | null>
}

type KanaEntry = readonly [character: string, romaji: string] | null

function toKatakana(character: string) {
  return String.fromCharCode(character.charCodeAt(0) + 0x60)
}

function makeHiraganaRow(label: string, entries: readonly KanaEntry[]): KanaTableRow {
  return {
    label,
    cells: entries.map((entry) => entry ? {
      hiragana: entry[0],
      katakana: toKatakana(entry[0]),
      romaji: entry[1],
    } : null),
  }
}

function makeKatakanaOnlyRow(label: string, entries: readonly (readonly [character: string, romaji: string] | null)[]): KanaTableRow {
  return {
    label,
    cells: entries.map((entry) => entry ? {
      hiragana: null,
      katakana: entry[0],
      romaji: entry[1],
    } : null),
  }
}

export const gojuonRows: KanaTableRow[] = [
  makeHiraganaRow('あ行', [['あ', 'a'], ['い', 'i'], ['う', 'u'], ['え', 'e'], ['お', 'o']]),
  makeHiraganaRow('か行', [['か', 'ka'], ['き', 'ki'], ['く', 'ku'], ['け', 'ke'], ['こ', 'ko']]),
  makeHiraganaRow('さ行', [['さ', 'sa'], ['し', 'shi'], ['す', 'su'], ['せ', 'se'], ['そ', 'so']]),
  makeHiraganaRow('た行', [['た', 'ta'], ['ち', 'chi'], ['つ', 'tsu'], ['て', 'te'], ['と', 'to']]),
  makeHiraganaRow('な行', [['な', 'na'], ['に', 'ni'], ['ぬ', 'nu'], ['ね', 'ne'], ['の', 'no']]),
  makeHiraganaRow('は行', [['は', 'ha'], ['ひ', 'hi'], ['ふ', 'fu'], ['へ', 'he'], ['ほ', 'ho']]),
  makeHiraganaRow('ま行', [['ま', 'ma'], ['み', 'mi'], ['む', 'mu'], ['め', 'me'], ['も', 'mo']]),
  makeHiraganaRow('や行', [['や', 'ya'], null, ['ゆ', 'yu'], null, ['よ', 'yo']]),
  makeHiraganaRow('ら行', [['ら', 'ra'], ['り', 'ri'], ['る', 'ru'], ['れ', 're'], ['ろ', 'ro']]),
  makeHiraganaRow('わ行', [['わ', 'wa'], null, null, null, ['を', 'wo']]),
  makeHiraganaRow('撥音', [['ん', 'n'], null, null, null, null]),
]

export const voicedRows: KanaTableRow[] = [
  makeHiraganaRow('が行', [['が', 'ga'], ['ぎ', 'gi'], ['ぐ', 'gu'], ['げ', 'ge'], ['ご', 'go']]),
  makeHiraganaRow('ざ行', [['ざ', 'za'], ['じ', 'ji'], ['ず', 'zu'], ['ぜ', 'ze'], ['ぞ', 'zo']]),
  makeHiraganaRow('だ行', [['だ', 'da'], ['ぢ', 'ji'], ['づ', 'zu'], ['で', 'de'], ['ど', 'do']]),
  makeHiraganaRow('ば行', [['ば', 'ba'], ['び', 'bi'], ['ぶ', 'bu'], ['べ', 'be'], ['ぼ', 'bo']]),
  makeHiraganaRow('ぱ行', [['ぱ', 'pa'], ['ぴ', 'pi'], ['ぷ', 'pu'], ['ぺ', 'pe'], ['ぽ', 'po']]),
]

export const smallKanaRows: KanaTableRow[] = [
  makeHiraganaRow('小さい あ行', [['ぁ', 'a'], ['ぃ', 'i'], ['ぅ', 'u'], ['ぇ', 'e'], ['ぉ', 'o']]),
  makeHiraganaRow('小さい や・つ・わ', [['ゃ', 'ya'], ['ゅ', 'yu'], ['ょ', 'yo'], ['っ', 'tsu'], ['ゎ', 'wa']]),
]

export const additionalHiraganaRows: KanaTableRow[] = [
  makeHiraganaRow('まれな文字', [['ゕ', 'ka'], ['ゖ', 'ke'], ['ゔ', 'vu'], ['ゐ', 'wi'], ['ゑ', 'we']]),
]

export const additionalKatakanaRows: KanaTableRow[] = [
  makeKatakanaOnlyRow('濁点つき旧仮名', [['ヷ', 'va'], ['ヸ', 'vi'], ['ヹ', 've'], ['ヺ', 'vo'], null]),
]

export const allHiraganaCharacters = new Set(
  [...gojuonRows, ...voicedRows, ...smallKanaRows, ...additionalHiraganaRows]
    .flatMap(({ cells }) => cells.flatMap((cell) => cell?.hiragana ? [cell.hiragana] : [])),
)

export type VocabularyWord = {
  kana: string
  romaji: string
  alternatives?: string[]
}

export const vocabularyByKana: Record<string, VocabularyWord[]> = {
  さ: [
    { kana: 'あさ', romaji: 'asa' },
    { kana: 'あさごはん', romaji: 'asagohan' },
    { kana: 'さかな', romaji: 'sakana' },
    { kana: 'さくら', romaji: 'sakura' },
    { kana: 'さとう', romaji: 'satou', alternatives: ['satō', 'sato'] },
    { kana: 'さむい', romaji: 'samui' },
    { kana: 'さようなら', romaji: 'sayounara', alternatives: ['sayōnara', 'sayonara'] },
    { kana: 'さき', romaji: 'saki' },
    { kana: 'さん', romaji: 'san' },
    { kana: 'さんぽ', romaji: 'sanpo', alternatives: ['sampo'] },
    { kana: 'かさ', romaji: 'kasa' },
    { kana: 'たくさん', romaji: 'takusan' },
    { kana: 'うるさい', romaji: 'urusai' },
    { kana: 'ちいさい', romaji: 'chiisai' },
    { kana: 'やさい', romaji: 'yasai' },
    { kana: 'おかあさん', romaji: 'okaasan', alternatives: ['okāsan'] },
    { kana: 'おとうさん', romaji: 'otousan', alternatives: ['otōsan'] },
    { kana: 'おばさん', romaji: 'obasan' },
    { kana: 'おじさん', romaji: 'ojisan' },
    { kana: 'みなさん', romaji: 'minasan' },
  ],
}

export function normalizeRomaji(value: string) {
  return value
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/ā/g, 'aa')
    .replace(/ī/g, 'ii')
    .replace(/ū/g, 'uu')
    .replace(/ē/g, 'ee')
    .replace(/ō/g, 'ou')
    .replace(/\s+/g, '')
}
