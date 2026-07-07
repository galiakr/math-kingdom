import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdventureLayout from '../../components/AdventureLayout';
import StoryText from '../../components/StoryText';
import './HilbertHotel.css';

type ScenarioId = 'single' | 'bus' | 'infinite';
type Flash = 'gold' | 'green' | 'violet' | 'pink';

interface Room {
  id: number;
  number: number;
  guest: string;
  flash: Flash | null;
}

const SCENARIOS: ScenarioId[] = ['single', 'bus', 'infinite'];
const BASE_GUESTS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐸', '🐨'];
const BUS_GUESTS = ['🦄', '🦊', '🐯', '🦁', '🐷'];
const INFINITE_BUSES = [
  ['👑', '🤖', '👽', '🧚'],
  ['🎪', '🎭', '🎨', '🎵'],
  ['🍎', '🍕', '🎂', '🍦'],
  ['⚽', '🏀', '🎾', '🏐'],
];
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
const TOTAL_STEPS = 5;

// New guests in the infinite scenario go to room 2^(bus+1) * 3^(seat+1);
// only the ones that land within the visible part of the hotel are shown.
const INFINITE_ARRIVALS = INFINITE_BUSES.flatMap((bus, b) =>
  bus.map((guest, s) => ({ guest, room: 2 ** (b + 1) * 3 ** (s + 1) }))
)
  .filter(({ room }) => room <= 29)
  .sort((a, b) => a.room - b.room);

const initialRooms = (): Room[] =>
  BASE_GUESTS.map((guest, i) => ({ id: i + 1, number: i + 1, guest, flash: null }));

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function HilbertHotel() {
  const { t } = useTranslation();

  const [scenario, setScenario] = useState<ScenarioId>('single');
  const [step, setStep] = useState(1);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [waiting, setWaiting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [finished, setFinished] = useState(false);
  const [burst, setBurst] = useState<{ emoji: string; n: number } | null>(null);

  // Bumping this token cancels any in-flight animation sequence.
  const runToken = useRef(0);
  const nextRoomId = useRef(100);

  useEffect(() => {
    if (!burst) return;
    const timer = setTimeout(() => setBurst(null), 900);
    return () => clearTimeout(timer);
  }, [burst]);

  useEffect(() => () => void runToken.current++, []);

  const fireBurst = (emoji: string) =>
    setBurst((prev) => ({ emoji, n: (prev?.n ?? 0) + 1 }));

  const flashRoom = (id: number, flash: Flash | null) =>
    setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, flash } : r)));

  const renumberRoom = (id: number, number: number) =>
    setRooms((rs) =>
      rs.map((r) => (r.id === id ? { ...r, number, flash: null } : r))
    );

  const insertRoom = (number: number, guest: string) => {
    const id = nextRoomId.current++;
    setRooms((rs) =>
      [...rs, { id, number, guest, flash: 'pink' as Flash }].sort(
        (a, b) => a.number - b.number
      )
    );
    return id;
  };

  const resetTo = useCallback((target: ScenarioId) => {
    runToken.current++;
    setScenario(target);
    setStep(1);
    setRooms(initialRooms());
    setWaiting(false);
    setBusy(false);
    setCelebrate(false);
  }, []);

  const start = () => {
    fireBurst('🔔');
    setStep(2);
    setWaiting(true);
  };

  const showMagic = async () => {
    const token = ++runToken.current;
    const live = () => runToken.current === token;

    setBusy(true);
    setStep(3);
    fireBurst('✨');
    await sleep(400);

    if (scenario === 'single') {
      // Everyone shifts up one room, from the highest room down.
      for (let id = BASE_GUESTS.length; id >= 1; id--) {
        if (!live()) return;
        flashRoom(id, 'gold');
        await sleep(150);
        renumberRoom(id, id + 1);
      }
    } else if (scenario === 'bus') {
      // Everyone doubles their room number, freeing the odd rooms.
      for (let id = 1; id <= BASE_GUESTS.length; id++) {
        if (!live()) return;
        flashRoom(id, 'green');
        await sleep(130);
        renumberRoom(id, id * 2);
      }
    } else {
      // Everyone moves to a prime-numbered room.
      for (let id = 1; id <= BASE_GUESTS.length; id++) {
        if (!live()) return;
        flashRoom(id, 'violet');
        await sleep(140);
        renumberRoom(id, PRIMES[id - 1]);
      }
    }

    if (!live()) return;
    await sleep(400);
    if (!live()) return;
    setWaiting(false);

    const arrivals =
      scenario === 'single'
        ? [{ guest: '🦄', room: 1 }]
        : scenario === 'bus'
          ? BUS_GUESTS.map((guest, i) => ({ guest, room: i * 2 + 1 }))
          : INFINITE_ARRIVALS;

    for (const { guest, room } of arrivals) {
      if (!live()) return;
      const id = insertRoom(room, guest);
      await sleep(320);
      if (!live()) return;
      flashRoom(id, null);
    }

    if (!live()) return;
    await sleep(350);
    if (!live()) return;
    fireBurst('🎊');
    setCelebrate(true);
    setStep(4);
    setBusy(false);
  };

  const continueAdventure = () => {
    const index = SCENARIOS.indexOf(scenario);
    if (index < SCENARIOS.length - 1) {
      fireBurst('🎉');
      resetTo(SCENARIOS[index + 1]);
    } else {
      fireBurst('🏆');
      setFinished(true);
    }
  };

  return (
    <AdventureLayout
      title={t('hotel.title')}
      subtitle={t('hotel.subtitle')}
      className="hotel"
    >
        <div className="scenario-tabs" role="tablist">
          {SCENARIOS.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={scenario === id}
              className="scenario-tab"
              disabled={busy}
              onClick={() => resetTo(id)}
            >
              {t(`hotel.scenarios.${id}`)}
            </button>
          ))}
        </div>

        <div className="step-track" aria-label={`${t('hotel.step')} ${step}/${TOTAL_STEPS}`}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
            <span
              key={n}
              className={`step-dot ${
                n < step ? 'is-done' : n === step ? 'is-active' : ''
              }`}
            >
              {n}
            </span>
          ))}
          <div className="progress-rail">
            <div
              className="progress-fill"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <section className="hotel-panel">
          <div className="hotel-sign">✦ {t('hotel.sign')} ✦</div>
          <div className="rooms-grid">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`room ${room.flash ? `flash-${room.flash}` : ''}`}
              >
                <span className="room-number">{room.number}</span>
                <span className="room-guest">{room.guest}</span>
              </div>
            ))}
            <div className="room room-more" aria-hidden="true">
              <span className="room-number">…</span>
              <span className="room-guest">∞</span>
            </div>
          </div>

          {waiting && (
            <div className="waiting-area">
              {scenario === 'single' && (
                <div className="waiting-guest">🦄</div>
              )}
              {scenario === 'bus' && (
                <div className="waiting-bus">
                  <span className="bus-icon">🚌</span>
                  {BUS_GUESTS.map((guest) => (
                    <span key={guest} className="bus-guest">
                      {guest}
                    </span>
                  ))}
                </div>
              )}
              {scenario === 'infinite' && (
                <div className="waiting-fleet">
                  {INFINITE_BUSES.map((bus, i) => (
                    <span key={i} className="waiting-bus small">
                      <span className="bus-icon">🚌</span>
                      {bus.map((guest) => (
                        <span key={guest} className="bus-guest">
                          {guest}
                        </span>
                      ))}
                    </span>
                  ))}
                  <span className="fleet-more">…♾️</span>
                </div>
              )}
              <p className="waiting-dialogue">{t(`hotel.dialogue.${scenario}`)}</p>
            </div>
          )}

          {celebrate && (
            <div className="celebration">🎉 {t('hotel.celebration')} 🎉</div>
          )}

          <div className="controls">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={busy}
              onClick={() => resetTo(scenario)}
            >
              {t('hotel.buttons.reset')}
            </button>
            {step === 1 && (
              <button type="button" className="btn btn-primary" onClick={start}>
                {t('hotel.buttons.start')}
              </button>
            )}
            {step === 2 && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={showMagic}
              >
                {t('hotel.buttons.magic')}
              </button>
            )}
            {step === 4 && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep(5)}
              >
                {t('hotel.buttons.next')}
              </button>
            )}
            {step === 5 && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={continueAdventure}
              >
                {t('hotel.buttons.continue')}
              </button>
            )}
          </div>
        </section>

        <section className="story-panel">
          <StoryText text={t(`hotel.story.${scenario}.${step}`)} />
        </section>

      {burst && (
        <div key={burst.n} className="sound-burst" aria-hidden="true">
          {burst.emoji}
        </div>
      )}

      {finished && (
        <div className="finished-overlay" role="dialog" aria-modal="true">
          <div className="finished-panel">
            <div className="finished-emoji" aria-hidden="true">
              🏆
            </div>
            <h2>{t('hotel.finishedTitle')}</h2>
            <p>{t('hotel.finished')}</p>
            <div className="controls">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setFinished(false);
                  resetTo('single');
                }}
              >
                {t('hotel.buttons.reset')}
              </button>
              <Link to="/" className="btn btn-primary">
                {t('hotel.finishedButton')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </AdventureLayout>
  );
}
