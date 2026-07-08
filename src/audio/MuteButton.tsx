import { useTranslation } from 'react-i18next';
import { useAudio } from './useAudio';

/** Persistent sound on/off toggle; adventures with audio show it near the top. */
export default function MuteButton() {
  const { t } = useTranslation();
  const audio = useAudio();
  const label = audio.muted ? t('audio.unmute') : t('audio.mute');
  return (
    <button
      type="button"
      className="mute-btn"
      aria-label={label}
      aria-pressed={audio.muted}
      title={label}
      onClick={audio.toggleMute}
    >
      {audio.muted ? '🔇' : '🔊'}
    </button>
  );
}
