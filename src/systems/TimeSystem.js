import { TIME_CONFIG, DAYS_OF_WEEK, EVENTS } from '../utils/Constants.js';

export class TimeSystem {
  constructor(eventEmitter) {
    this.events = eventEmitter;
    this.hour = TIME_CONFIG.START_HOUR;
    this.minute = TIME_CONFIG.START_MINUTE;
    this.day = 1; // Dia do mês (1 a 30)
    this.dayOfWeekIndex = 0; // 0 = Segunda-feira
    this.month = 1;
    this.isPaused = false;
    this.accumulator = 0;
  }

  update(deltaMs) {
    if (this.isPaused) return;

    this.accumulator += deltaMs;
    if (this.accumulator >= TIME_CONFIG.TICK_INTERVAL_MS) {
      const ticks = Math.floor(this.accumulator / TIME_CONFIG.TICK_INTERVAL_MS);
      this.accumulator %= TIME_CONFIG.TICK_INTERVAL_MS;
      this.advanceMinutes(ticks * TIME_CONFIG.MINUTES_PER_TICK);
    }
  }

  advanceMinutes(minutes) {
    const oldHour = this.hour;
    this.minute += minutes;

    while (this.minute >= 60) {
      this.minute -= 60;
      this.hour += 1;

      if (this.hour >= 24) {
        this.hour = 0;
      }

      this.events.emit(EVENTS.HOUR_CHANGED, { hour: this.hour, day: this.day });

      // Verificação de colapso por hora tardia (03:00 da madrugada)
      if (this.hour === TIME_CONFIG.EXHAUSTION_HOUR) {
        this.events.emit(EVENTS.PLAYER_EXHAUSTED, { reason: 'late_night' });
      }
    }

    this.events.emit(EVENTS.TIME_TICK, this.getTimeData());
  }

  advanceToNextDay() {
    this.day += 1;
    this.dayOfWeekIndex = (this.dayOfWeekIndex + 1) % 7;
    this.hour = TIME_CONFIG.SLEEP_WAKE_HOUR;
    this.minute = 0;
    this.accumulator = 0;

    if (this.day > 30) {
      this.day = 1;
      this.month += 1;
      this.events.emit(EVENTS.MONTH_CHANGED, { month: this.month });
    }

    this.events.emit(EVENTS.DAY_CHANGED, this.getTimeData());
    this.events.emit(EVENTS.TIME_TICK, this.getTimeData());
  }

  getTimeData() {
    const formattedHour = String(this.hour).padStart(2, '0');
    const formattedMinute = String(this.minute).padStart(2, '0');
    return {
      hour: this.hour,
      minute: this.minute,
      timeString: `${formattedHour}:${formattedMinute}`,
      day: this.day,
      dayOfWeek: DAYS_OF_WEEK[this.dayOfWeekIndex],
      month: this.month,
      isDaytime: this.hour >= 6 && this.hour < 18
    };
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  serialize() {
    return {
      hour: this.hour,
      minute: this.minute,
      day: this.day,
      dayOfWeekIndex: this.dayOfWeekIndex,
      month: this.month
    };
  }

  deserialize(data) {
    if (!data) return;
    this.hour = data.hour ?? this.hour;
    this.minute = data.minute ?? this.minute;
    this.day = data.day ?? this.day;
    this.dayOfWeekIndex = data.dayOfWeekIndex ?? this.dayOfWeekIndex;
    this.month = data.month ?? this.month;
  }
}
