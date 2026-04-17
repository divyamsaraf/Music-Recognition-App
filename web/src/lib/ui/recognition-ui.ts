export type RecognitionUiState =
  | 'idle'
  | 'recording'
  | 'analyzing'
  | 'matched'
  | 'noMatch'
  | 'error'

export const RECOGNITION_STEPS = [
  'Tap the mic to start song detection',
  'Hold your device near the music for a few seconds',
  'View song details and open it in Spotify or YouTube',
] as const

export const RECOGNITION_TIP =
  'Best results: Keep your device close to the sound source and reduce background noise.'

/** Home “Recent recognitions” preview count (no horizontal scroll; cards wrap). */
export const RECENT_RECOGNITIONS_HOME_PREVIEW = 5

export const RECOGNITION_STATUS_LABELS: Record<RecognitionUiState, string> = {
  idle: 'Tap to listen',
  recording: 'Listening for music...',
  analyzing: 'Analyzing audio...',
  matched: 'Song identified',
  noMatch: 'No match found. Try closer and clearer audio.',
  error: 'Something went wrong. Please try again.',
}

export const RECOGNITION_HELPER_TEXT: Partial<Record<RecognitionUiState, string>> = {
  idle: 'Hold your phone near the music source for best results.',
  recording: 'Keep the audio clear. Tap again when you want to stop.',
  analyzing: 'Hold on while we identify the track.',
  noMatch: 'Try moving closer to the speaker and scan again.',
  error: 'Check your connection and try again.',
}

interface UiStateInput {
  isRecording: boolean
  isAnalyzing: boolean
  hasResult: boolean
  hasError: boolean
  hadNoMatch: boolean
}

export function getRecognitionUiState(input: UiStateInput): RecognitionUiState {
  if (input.hasError) return 'error'
  if (input.hasResult) return 'matched'
  if (input.isAnalyzing) return 'analyzing'
  if (input.isRecording) return 'recording'
  if (input.hadNoMatch) return 'noMatch'
  return 'idle'
}
