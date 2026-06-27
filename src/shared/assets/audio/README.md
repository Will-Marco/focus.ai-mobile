# Audio Fon fayllari (offline lokal loop)

Bu papkaga **6 ta ambient loop** qo'shiladi. Fayllar qo'shilgach
`src/features/run-session/config/tracks.ts` dagi `AUDIO_SOURCES` requirelarini oching.

## Kerakli fayllar (aniq nom)
| Fayl | Trek | Tavsif |
|------|------|--------|
| `rain.mp3`   | Yomg'ir    | yengil yomg'ir/momaqaldiroqsiz |
| `lofi.mp3`   | Lo-fi      | lo-fi hip-hop / chillhop loop |
| `ocean.mp3`  | Okean      | to'lqin/qirg'oq |
| `forest.mp3` | O'rmon     | qushlar/shamol/barglar |
| `fire.mp3`   | O'choq     | gulxan chirsillashi |
| `white.mp3`  | Oq shovqin | barqaror oq/jigarrang shovqin |

## Talablar
- **Format:** `.mp3` (yoki `.ogg` — bo'lsa `tracks.ts` kengaytmasini moslang).
- **Davomiylik:** ~30–120s **seamless** (audio-api `AudioBufferSourceNode.loop` bilan uzluksiz loop qiladi).
- **Hajm:** har biri ideal < 2–3 MB (APK shishmasin). 96–128 kbps yetarli.

## Royalty-free manbalar (CC0 / litsenziyasiz)
- **Pixabay Sounds** — https://pixabay.com/sound-effects/ (CC0, atribut shart emas)
- **Freesound** — https://freesound.org (CC0 filtri bilan)
- **Mixkit** — https://mixkit.co/free-sound-effects/ (bepul)

Qidiruv: "rain loop", "lofi loop", "ocean waves loop", "forest ambience",
"campfire crackle loop", "white noise".

## Qo'shgandan keyin
1. 6 faylni shu papkaga joylang (yuqoridagi aniq nomlar bilan).
2. `tracks.ts` dagi `AUDIO_SOURCES` 6 require qatorini oching (kommentdan chiqaring).
3. Native rebuild: `npx react-native run-android`.
4. Audio Fon sheet'da trek tanlab sinang.
