// Configurações e constantes globais do jogo City Rut

export const GAME_CONFIG = {
  WIDTH: 960,
  HEIGHT: 540,
  SCALE: 2, // Fator de escala para visual pixel-art
  VIRTUAL_WIDTH: 480,
  VIRTUAL_HEIGHT: 270
};

export const TIME_CONFIG = {
  START_HOUR: 7,
  START_MINUTE: 0,
  MINUTES_PER_TICK: 1,
  TICK_INTERVAL_MS: 800, // Cada ~0.8s real = 1 minuto de jogo
  SLEEP_WAKE_HOUR: 7,
  EXHAUSTION_HOUR: 3 // Se passar das 03:00, desmaia por exaustão
};

export const STATUS_CONFIG = {
  INITIAL_ENERGY: 100,
  MAX_ENERGY: 100,
  INITIAL_STRESS: 15,
  MAX_STRESS: 100,
  INITIAL_MONEY: 350.00, // R$ 350 de reserva inicial
  INITIAL_STUDY_HOURS: 0,
  INITIAL_WORK_EXP: 0,
  BURNOUT_STRESS_THRESHOLD: 80
};

export const BILLS_CONFIG = [
  { id: 'aluguel', name: 'Aluguel do Kitnet', dueDay: 5, amount: 600.00, paid: false },
  { id: 'contas', name: 'Luz + Internet', dueDay: 10, amount: 140.00, paid: false },
  { id: 'faculdade', name: 'Mensalidade Faculdade', dueDay: 15, amount: 320.00, paid: false }
];

export const DAYS_OF_WEEK = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo'
];

export const EVENTS = {
  TIME_TICK: 'time_tick',
  HOUR_CHANGED: 'hour_changed',
  DAY_CHANGED: 'day_changed',
  MONTH_CHANGED: 'month_changed',
  STATUS_CHANGED: 'status_changed',
  SHOW_DIALOGUE: 'show_dialogue',
  HIDE_DIALOGUE: 'hide_dialogue',
  SHOW_NOTIFICATION: 'show_notification',
  PLAYER_EXHAUSTED: 'player_exhausted',
  GAME_OVER: 'game_over'
};
