class HilbertsHotel {
  constructor() {
    this.currentScenario = 'single';
    this.currentStep = 1;
    this.totalSteps = 5;
    this.maxRooms = 10;
    this.animationInProgress = false;

    this.guests = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐸', '🐨'];
    this.busGuests = ['🦄', '🦊', '🐯', '🦁', '🐷'];
    this.infiniteBusGuests = [
      ['👑', '🤖', '👽', '🧚'],
      ['🎪', '🎭', '🎨', '🎵'],
      ['🍎', '🍕', '🎂', '🍦'],
      ['⚽', '🏀', '🎾', '🏐'],
    ];

    this.scenarios = {
      single: {
        newGuest: '🦄',
        titleKey: 'scenario-single-title',
        steps: 5,
      },
      bus: {
        newGuests: this.busGuests,
        titleKey: 'scenario-bus-title',
        steps: 5,
      },
      infinite: {
        newGuests: this.infiniteBusGuests,
        titleKey: 'scenario-infinite-title',
        steps: 5,
      },
    };

    window.hilbertsHotel = this;
    this.init();
  }

  getScenarioTitle(scenario) {
    const titleKey = this.scenarios[scenario]?.titleKey;
    return titleKey ? t(titleKey) : scenario;
  }

  init() {
    this.createRooms();
    this.setupEventListeners();
    this.updateExplanation();
  }

  createRooms() {
    const container = document.getElementById('rooms-container');
    container.innerHTML = '';

    for (let i = 1; i <= this.maxRooms; i++) {
      const room = document.createElement('div');
      room.className = 'room occupied';
      room.innerHTML = `
                        <div class="room-number">${i}</div>
                        <div class="guest">${this.guests[i - 1]}</div>
                    `;
      container.appendChild(room);
    }
  }

  setupEventListeners() {
    document
      .getElementById('reset-btn')
      .addEventListener('click', () => this.reset());
    document
      .getElementById('start-scenario-btn')
      .addEventListener('click', () => this.startScenario());
    document
      .getElementById('show-solution-btn')
      .addEventListener('click', () => this.showSolution());
    document
      .getElementById('next-step-btn')
      .addEventListener('click', () => this.nextStep());
    document
      .getElementById('continue-adventure-btn')
      .addEventListener('click', () => this.continueAdventure());

    document.querySelectorAll('.scenario-btn').forEach((btn) => {
      btn.addEventListener('click', (e) =>
        this.selectScenario(e.target.dataset.scenario)
      );
    });
  }

  selectScenario(scenario) {
    this.currentScenario = scenario;
    document.querySelectorAll('.scenario-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.scenario === scenario);
    });
    this.reset();
  }

  playSound(soundType) {
    const soundEffects = {
      ding: '🔔',
      magic: '✨',
      whoosh: '💨',
      tada: '🎉',
      beep: '📻',
      cheer: '🎊',
    };

    const soundDiv = document.createElement('div');
    soundDiv.className = 'sound-effect';
    soundDiv.textContent = soundEffects[soundType] || '🔊';
    document.body.appendChild(soundDiv);

    setTimeout(() => {
      document.body.removeChild(soundDiv);
    }, 1000);
  }

  reset() {
    if (this.animationInProgress) return;

    this.currentStep = 1;
    this.totalSteps = this.scenarios[this.currentScenario].steps;
    this.createRooms();
    this.updateStepIndicator();
    this.updateProgress();
    document.getElementById('waiting-area').innerHTML = '';
    document.getElementById('start-scenario-btn').style.display =
      'inline-block';
    document.getElementById('show-solution-btn').style.display = 'none';
    document.getElementById('next-step-btn').style.display = 'none';
    document.getElementById('continue-adventure-btn').style.display = 'none';
    document.getElementById('celebration').style.display = 'none';
    this.updateExplanation();
  }

  startScenario() {
    if (this.animationInProgress) return;

    this.playSound('ding');
    this.currentStep = 2;
    this.updateStepIndicator();
    this.updateProgress();

    const waitingArea = document.getElementById('waiting-area');

    switch (this.currentScenario) {
      case 'single':
        waitingArea.innerHTML = `
                            <div class="waiting-guest">🦄</div>
                            <p style="text-align: center; font-size: 16px; margin-top: 10px;">
                                "Excuse me, do you have a room available?"
                            </p>
                        `;
        break;

      case 'bus':
        waitingArea.innerHTML = `
                            <div class="bus">
                                🚌
                                <div class="bus-guests">
                                    ${this.busGuests
                                      .map(
                                        (guest) =>
                                          `<span class="waiting-guest" style="font-size: 30px; margin: 2px;">${guest}</span>`
                                      )
                                      .join('')}
                                </div>
                            </div>
                            <p style="text-align: center; font-size: 16px; margin-top: 10px;">
                                "We're a bus tour group! Do you have 5 rooms available?"
                            </p>
                        `;
        break;

      case 'infinite':
        let busHTML = '';
        this.infiniteBusGuests.forEach((busGroup, index) => {
          busHTML += `
                                <div class="bus" style="animation-delay: ${
                                  index * 0.5
                                }s;">
                                    🚌
                                    <div class="bus-guests">
                                        ${busGroup
                                          .map(
                                            (guest) =>
                                              `<span style="font-size: 20px; margin: 1px;">${guest}</span>`
                                          )
                                          .join('')}
                                    </div>
                                </div>
                            `;
        });
        waitingArea.innerHTML = `
                            <div style="display: flex; flex-wrap: wrap; justify-content: center;">
                                ${busHTML}
                                <div style="font-size: 30px; margin: 20px;">...♾️</div>
                            </div>
                            <p style="text-align: center; font-size: 16px; margin-top: 10px;">
                                "We're infinite buses with infinite guests! Can you fit us all?"
                            </p>
                        `;
        break;
    }

    document.getElementById('start-scenario-btn').style.display = 'none';
    document.getElementById('show-solution-btn').style.display = 'inline-block';
    this.updateExplanation();
  }

  showSolution() {
    if (this.animationInProgress) return;

    this.playSound('magic');
    this.currentStep = 3;
    this.updateStepIndicator();
    this.updateProgress();
    this.animationInProgress = true;

    document.getElementById('show-solution-btn').style.display = 'none';
    this.updateExplanation();

    switch (this.currentScenario) {
      case 'single':
        this.solveSingleGuest();
        break;
      case 'bus':
        this.solveBusGuests();
        break;
      case 'infinite':
        this.solveInfiniteGuests();
        break;
    }
  }

  // move everyone to the next room (add 1)
  solveSingleGuest() {
    this.animateGuestMovement(1, () => {
      this.addGuestToRoom(1, '🦄');
      this.showCelebration();
    });
  }

  // move everyone to odd-numbered rooms (multiply by 2)
  solveBusGuests() {
    this.animateGuestMovementMultiplier(2, () => {
      this.busGuests.forEach((guest, index) => {
        setTimeout(() => {
          this.addGuestToRoom(index + 1, guest);
          if (index === this.busGuests.length - 1) {
            this.showCelebration();
          }
        }, index * 300);
      });
    });
  }

  // move everyone to prime-numbered rooms
  solveInfiniteGuests() {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
    this.animateGuestMovementToPrimes(primes, () => {
      let guestIndex = 0;
      this.infiniteBusGuests.forEach((busGroup, busIndex) => {
        busGroup.forEach((guest, seatIndex) => {
          const roomNumber =
            Math.pow(2, busIndex + 1) * Math.pow(3, seatIndex + 1);
          if (roomNumber <= this.maxRooms) {
            setTimeout(() => {
              this.addGuestToRoom(roomNumber, guest);
            }, guestIndex * 200);
            guestIndex++;
          }
        });
      });
      setTimeout(() => this.showCelebration(), guestIndex * 200 + 500);
    });
  }

  animateGuestMovement(shift, callback) {
    const rooms = document.querySelectorAll('.room');
    let delay = 0;

    for (let i = rooms.length - 1; i >= 0; i--) {
      setTimeout(() => {
        const room = rooms[i];
        const currentNumber = parseInt(
          room.querySelector('.room-number').textContent
        );
        const newNumber = currentNumber + shift;

        this.playSound('whoosh');
        room.style.transform = 'scale(1.1)';
        room.style.boxShadow = '0 0 20px #FFD700';

        setTimeout(() => {
          room.querySelector('.room-number').textContent = newNumber;
          room.style.transform = 'scale(1)';
          room.style.boxShadow = '';

          if (i === 0 && callback) {
            setTimeout(callback, 300);
          }
        }, 500);
      }, delay);
      delay += 200;
    }
  }

  animateGuestMovementMultiplier(multiplier, callback) {
    const rooms = document.querySelectorAll('.room');
    let delay = 0;

    rooms.forEach((room, index) => {
      setTimeout(() => {
        const currentNumber = parseInt(
          room.querySelector('.room-number').textContent
        );
        const newNumber = currentNumber * multiplier;

        this.playSound('whoosh');
        room.style.transform = 'scale(1.1)';
        room.style.boxShadow = '0 0 20px #32CD32';

        setTimeout(() => {
          room.querySelector('.room-number').textContent = newNumber;
          room.style.transform = 'scale(1)';
          room.style.boxShadow = '';

          if (index === rooms.length - 1 && callback) {
            setTimeout(callback, 300);
          }
        }, 500);
      }, delay);
      delay += 150;
    });
  }

  animateGuestMovementToPrimes(primes, callback) {
    const rooms = document.querySelectorAll('.room');
    let delay = 0;

    rooms.forEach((room, index) => {
      if (index < primes.length) {
        setTimeout(() => {
          this.playSound('beep');
          room.style.transform = 'scale(1.1)';
          room.style.boxShadow = '0 0 20px #9370DB';

          setTimeout(() => {
            room.querySelector('.room-number').textContent = primes[index];
            room.style.transform = 'scale(1)';
            room.style.boxShadow = '';

            if (
              index === Math.min(rooms.length, primes.length) - 1 &&
              callback
            ) {
              setTimeout(callback, 300);
            }
          }, 500);
        }, delay);
        delay += 200;
      }
    });
  }

  addGuestToRoom(roomNumber, guest) {
    const container = document.getElementById('rooms-container');
    const rooms = Array.from(container.children);
    let targetRoom = rooms.find(
      (room) =>
        parseInt(room.querySelector('.room-number').textContent) === roomNumber
    );

    if (!targetRoom && roomNumber <= this.maxRooms) {
      targetRoom = document.createElement('div');
      targetRoom.className = 'room occupied';
      targetRoom.innerHTML = `
                        <div class="room-number">${roomNumber}</div>
                        <div class="guest">${guest}</div>
                    `;

      let inserted = false;
      for (let i = 0; i < rooms.length; i++) {
        const currentRoomNum = parseInt(
          rooms[i].querySelector('.room-number').textContent
        );
        if (roomNumber < currentRoomNum) {
          container.insertBefore(targetRoom, rooms[i]);
          inserted = true;
          break;
        }
      }
      if (!inserted) {
        container.appendChild(targetRoom);
      }
    }

    if (targetRoom) {
      this.playSound('ding');
      targetRoom.style.transform = 'scale(1.2)';
      targetRoom.style.boxShadow = '0 0 30px #FF69B4';

      setTimeout(() => {
        targetRoom.style.transform = 'scale(1)';
        targetRoom.style.boxShadow = '';
      }, 800);
    }

    document.getElementById('waiting-area').innerHTML = '';
  }

  showCelebration() {
    this.playSound('cheer');
    this.currentStep = 4;
    this.updateStepIndicator();
    this.updateProgress();

    const celebration = document.getElementById('celebration');
    celebration.style.display = 'block';

    document.getElementById('next-step-btn').style.display = 'inline-block';
    this.animationInProgress = false;
    this.updateExplanation();
  }

  nextStep() {
    this.currentStep = 5;
    this.updateStepIndicator();
    this.updateProgress();
    document.getElementById('next-step-btn').style.display = 'none';
    document.getElementById('continue-adventure-btn').style.display =
      'inline-block';
    this.updateExplanation();
  }

  continueAdventure() {
    const scenarios = ['single', 'bus', 'infinite'];
    const currentIndex = scenarios.indexOf(this.currentScenario);

    if (currentIndex < scenarios.length - 1) {
      this.selectScenario(scenarios[currentIndex + 1]);
      this.playSound('tada');
    } else {
      this.playSound('cheer');
      alert(
        "🎉 Congratulations! You've mastered all of Hilbert's Hotel mysteries! You now understand how infinity works in mathematics - even when something is completely full, you can sometimes still add more! Isn't math magical? ✨"
      );
    }
  }

  updateStepIndicator() {
    for (let i = 1; i <= 5; i++) {
      const step = document.getElementById(`step${i}`);
      if (step) {
        step.className = 'step';

        if (i < this.currentStep) {
          step.classList.add('completed');
        } else if (i === this.currentStep) {
          step.classList.add('active');
        }
      }
    }
  }

  updateProgress() {
    const progressFill = document.getElementById('progress-fill');
    const percentage = (this.currentStep / this.totalSteps) * 100;
    progressFill.style.width = `${percentage}%`;
  }

  updateExplanation() {
    const explanation = document.getElementById('explanation');
    const content = getStoryContent(this.currentScenario, this.currentStep);
    explanation.innerHTML = formatStoryContent(content);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new HilbertsHotel();
});
