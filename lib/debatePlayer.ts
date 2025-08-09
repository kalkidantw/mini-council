import { playBase64Mp3, abortCurrentAudio } from './audio'

type Turn = { persona: string; message: string; audioData?: string }

export type Hooks = {
  onActivate: (persona: string) => void
  onAppendTranscript: (persona: string, message: string) => void
  onDeactivate: () => void
}

export type PlayOptions = {
  gapMs?: number // default 350
  firstTurnDeadlineMs?: number // default 1500
  turnAudioDeadlineMs?: number // default 2500
}

let isPlaying = false

export async function playDebate(
  turns: Turn[],
  hooks: Hooks,
  opts: PlayOptions = {}
): Promise<void> {
  const GAP_MS = opts.gapMs ?? 350
  const FIRST_TURN_DEADLINE_MS = opts.firstTurnDeadlineMs ?? 1500
  const TURN_AUDIO_DEADLINE_MS = opts.turnAudioDeadlineMs ?? 2500

  if (isPlaying) {
    abortCurrentAudio()
  }
  isPlaying = true

  try {
    for (let i = 0; i < turns.length; i++) {
      const turn = turns[i]
      const appendedLen = i + 1
      console.log(`[TURN] start idx=${i} persona=${turn.persona} appendedLen=${appendedLen}`)

      hooks.onActivate(turn.persona)
      hooks.onAppendTranscript(turn.persona, turn.message)

      const deadline = i === 0 ? FIRST_TURN_DEADLINE_MS : TURN_AUDIO_DEADLINE_MS

      const startedAt = performance.now()
      let audioReady = !!turn.audioData

      if (!turn.audioData) {
        const pollStart = Date.now()
        while (!turn.audioData && Date.now() - pollStart < deadline) {
          await new Promise(r => setTimeout(r, 100))
        }
        audioReady = !!turn.audioData
      }

      const waited = Math.max(0, Math.round(performance.now() - startedAt))
      console.log(`[AUDIO] ready=${audioReady} waitedMs=${waited}`)

      let played = false
      if (audioReady && turn.audioData) {
        try {
          abortCurrentAudio()
          await playBase64Mp3(turn.audioData, { timeoutMs: TURN_AUDIO_DEADLINE_MS })
          played = true
        } catch {
          // ignore, fall through
        }
      }

      if (!played) {
        console.warn(`[WARN] audio timeout idx=${i} (silent)`) 
        await new Promise(r => setTimeout(r, 2000))
      }

      console.log(`[AUDIO] ended idx=${i}`)

      hooks.onDeactivate()
      console.log(`[FLOW] visibleTranscriptLen=${appendedLen}`)
      await new Promise(r => setTimeout(r, GAP_MS))
    }
  } finally {
    isPlaying = false
  }
} 