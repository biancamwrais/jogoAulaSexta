import { STATUS_CONFIG, EVENTS } from '../utils/Constants.js';

export class StatusSystem {
  constructor(eventEmitter) {
    this.events = eventEmitter;
    this.energy = STATUS_CONFIG.INITIAL_ENERGY;
    this.stress = STATUS_CONFIG.INITIAL_STRESS;
    this.money = STATUS_CONFIG.INITIAL_MONEY;
    this.studyHours = STATUS_CONFIG.INITIAL_STUDY_HOURS;
    this.workExp = STATUS_CONFIG.INITIAL_WORK_EXP;
  }

  modifyEnergy(amount) {
    // Se estiver em burnout, o gasto de energia é 40% maior
    let finalAmount = amount;
    if (amount < 0 && this.isBurnout()) {
      finalAmount = Math.round(amount * 1.4);
    }

    this.energy = Math.max(0, Math.min(STATUS_CONFIG.MAX_ENERGY, this.energy + finalAmount));
    this.emitStatus();

    if (this.energy <= 0) {
      this.events.emit(EVENTS.PLAYER_EXHAUSTED, { reason: 'zero_energy' });
    }
  }

  modifyStress(amount) {
    this.stress = Math.max(0, Math.min(STATUS_CONFIG.MAX_STRESS, this.stress + amount));
    this.emitStatus();
  }

  modifyMoney(amount) {
    this.money += amount;
    this.emitStatus();
  }

  addStudy(hours) {
    this.studyHours += hours;
    this.emitStatus();
  }

  addWorkExp(points) {
    this.workExp += points;
    this.emitStatus();
  }

  isBurnout() {
    return this.stress >= STATUS_CONFIG.BURNOUT_STRESS_THRESHOLD;
  }

  restoreSleep(hoursSlept = 8) {
    // Qualidade do sono afetada pelo estresse
    const qualityFactor = 1 - (this.stress / 150); // Quanto mais estresse, pior o descanso
    const recoveredEnergy = Math.round(85 * qualityFactor);
    this.energy = Math.min(STATUS_CONFIG.MAX_ENERGY, recoveredEnergy);

    // Dormir reduz o estresse naturalmente
    this.modifyStress(-25);
    this.emitStatus();
  }

  penalizeExhaustion() {
    // Se desmaiou na rua ou de cansaço extremo
    this.energy = 40;
    this.modifyStress(30);
    this.modifyMoney(-45); // Pequena perda financeira (remédio/táxi)
    this.events.emit(EVENTS.SHOW_NOTIFICATION, {
      text: 'Você desmaiou de exaustão! Acordou quebrado e perdeu R$ 45,00 em remédios.',
      type: 'warning'
    });
    this.emitStatus();
  }

  emitStatus() {
    this.events.emit(EVENTS.STATUS_CHANGED, this.getStatusData());
  }

  getStatusData() {
    return {
      energy: this.energy,
      maxEnergy: STATUS_CONFIG.MAX_ENERGY,
      stress: this.stress,
      maxStress: STATUS_CONFIG.MAX_STRESS,
      money: this.money,
      studyHours: this.studyHours,
      workExp: this.workExp,
      isBurnout: this.isBurnout()
    };
  }

  serialize() {
    return {
      energy: this.energy,
      stress: this.stress,
      money: this.money,
      studyHours: this.studyHours,
      workExp: this.workExp
    };
  }

  deserialize(data) {
    if (!data) return;
    this.energy = data.energy ?? this.energy;
    this.stress = data.stress ?? this.stress;
    this.money = data.money ?? this.money;
    this.studyHours = data.studyHours ?? this.studyHours;
    this.workExp = data.workExp ?? this.workExp;
    this.emitStatus();
  }
}
