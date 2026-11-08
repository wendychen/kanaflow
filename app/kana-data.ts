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
  imageUrl: string
  imageAlt: string
  imageCaption: string
}

export const vocabularyByKana: Record<string, VocabularyWord[]> = {
  さ: [
    { kana: 'あさ', romaji: 'asa', imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/01_%E3%81%82%E3%81%95-jTppiUtS5HZQHON7d77AQuxk74fbOf.webp', imageAlt: '東京の街並みとスカイツリーを照らす朝日', imageCaption: '東京の朝焼け' },
    { kana: 'あさごはん', romaji: 'asagohan', imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/02_%E3%81%82%E3%81%95%E3%81%94%E3%81%AF%E3%82%93-7ux9EjIeyciBf6my4YEw8ISjAbuDYz.webp', imageAlt: '焼き魚、ごはん、みそ汁が並ぶ朝食', imageCaption: '朝ごはんの食卓' },
    { kana: 'さかな', romaji: 'sakana', imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/03_%E3%81%95%E3%81%8B%E3%81%AA-80LLS4SSP7pIM6Bev7GYg2TqjCpBcf.webp', imageAlt: '魚市場の氷の上に並ぶ新鮮な魚', imageCaption: '魚市場の魚' },
    { kana: 'さくら', romaji: 'sakura', imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/04_%E3%81%95%E3%81%8F%E3%82%89-2aVbTuBvOv0YBTBKc8TeS1GhisiItm.webp', imageAlt: '満開の桜並木の下を歩く人々', imageCaption: '満開の桜' },
    { kana: 'さとう', romaji: 'satou', alternatives: ['satō', 'sato'], imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/05_%E3%81%95%E3%81%A8%E3%81%86-YPesmKdYeJw5XzpKce6iujs4kpboiV.webp', imageAlt: '紅茶にスプーンで砂糖を入れる様子', imageCaption: '紅茶に砂糖を入れる' },
    { kana: 'さむい', romaji: 'samui', imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/06_%E3%81%95%E3%82%80%E3%81%84-HIOPPlktN1vxQMoBbjfQNMkxaGZJnl.webp', imageAlt: '雪の降る街で寒そうに身を縮める女性', imageCaption: '寒い冬の街' },
    { kana: 'さようなら', romaji: 'sayounara', alternatives: ['sayōnara', 'sayonara'], imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/07_%E3%81%95%E3%82%88%E3%81%86%E3%81%AA%E3%82%89-sDjaJKl5QUa8GOk1jGB8N5duEZyukN.webp', imageAlt: '駅のホームで別れ際に手を振る二人', imageCaption: '駅でさようなら' },
    { kana: 'さき', romaji: 'saki', imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/08_%E3%81%95%E3%81%8D-oLaEEFBQq66MDrQXqQkGNarYjLLbwY.webp', imageAlt: '公園で前方を指さす女性', imageCaption: '先を指さす' },
    { kana: 'さん', romaji: 'san', imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/09_%E3%81%95%E3%82%93-eAOS3h2X8vAhcTSZ5RZaPkHK3pEF8s.webp', imageAlt: '木箱の上に並んだ三つのりんご', imageCaption: 'りんごが三つ' },
    { kana: 'さんぽ', romaji: 'sanpo', alternatives: ['sampo'], imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/10_%E3%81%95%E3%82%93%E3%81%BD-5zYcxrbNLNphSXZePg3z00H8V2HSjC.webp', imageAlt: '桜が咲く公園を散歩する二人', imageCaption: '公園の散歩' },
    { kana: 'かさ', romaji: 'kasa', imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/11_%E3%81%8B%E3%81%95-Wcuelkl4soQVITG7N18ofXx5qsnyBZ.webp', imageAlt: '雨の街で傘をさして歩く女性', imageCaption: '雨の日の傘' },
    { kana: 'たくさん', romaji: 'takusan', imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/12_%E3%81%9F%E3%81%8F%E3%81%95%E3%82%93-ugkEyauRskyo4obufGGtJmSBDzEs0T.webp', imageAlt: '祭りの会場にたくさん並ぶ赤い提灯と人々', imageCaption: '提灯がたくさん' },
    { kana: 'うるさい', romaji: 'urusai', imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/13_%E3%81%86%E3%82%8B%E3%81%95%E3%81%84-zeMfmxkd9lORhkbIpNG2arH9QmFUv7.webp', imageAlt: '人混みでにぎわう都市の交差点', imageCaption: '人通りの多い街' },
    { kana: 'ちいさい', romaji: 'chiisai', imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/14_%E3%81%A1%E3%81%84%E3%81%95%E3%81%84-44V7A8irZYt92F5lC4lQtuDfXWesK1.webp', imageAlt: 'スニーカーの横に座る小さな子犬', imageCaption: '小さい子犬' },
    { kana: 'やさい', romaji: 'yasai', imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/15_%E3%82%84%E3%81%95%E3%81%84-GD0vL43MAYYnEs6TX1RZAbaNtnbaA0.webp', imageAlt: '市場に並ぶ大根やにんじんなどの野菜', imageCaption: '新鮮な野菜' },
    { kana: 'おかあさん', romaji: 'okaasan', alternatives: ['okāsan'], imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/16_%E3%81%8A%E3%81%8B%E3%81%82%E3%81%95%E3%82%93-BBWeE5mkGGo3un1zWUuMDaRSoXxwKC.webp', imageAlt: '子どもを抱きしめる母親', imageCaption: 'おかあさんと子ども' },
    { kana: 'おとうさん', romaji: 'otousan', alternatives: ['otōsan'], imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/17_%E3%81%8A%E3%81%A8%E3%81%86%E3%81%95%E3%82%93-pMbek4k3dGvozZ04tz56jZs0qa0imW.webp', imageAlt: '子どもを肩に乗せて笑う父親', imageCaption: 'おとうさんと子ども' },
    { kana: 'おばさん', romaji: 'obasan', imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/18_%E3%81%8A%E3%81%B0%E3%81%95%E3%82%93-3EdbMMAq0j5bHTnMGes7tv9mfjyexw.webp', imageAlt: '焼き菓子を持って微笑む女性', imageCaption: 'おばさんのおもてなし' },
    { kana: 'おじさん', romaji: 'ojisan', imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/19_%E3%81%8A%E3%81%98%E3%81%95%E3%82%93-8qJyvq1hGTtMFGPWHMJSvdf4ciGV6f.webp', imageAlt: '木々の下で笑う男性', imageCaption: 'おじさんの笑顔' },
    { kana: 'みなさん', romaji: 'minasan', imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/20_%E3%81%BF%E3%81%AA%E3%81%95%E3%82%93-C8kxK5Bdb7uU9BGH8xds8XTVqHW1kN.webp', imageAlt: '東京スカイツリーの前で手を振る大勢の人々', imageCaption: 'みなさんで記念撮影' },
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
