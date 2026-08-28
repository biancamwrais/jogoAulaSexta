import { BILLS_CONFIG, EVENTS } from '../utils/Constants.js';

export class EconomySystem {
  constructor(eventEmitter, statusSystem) {
    this.events = eventEmitter;
    this.status = statusSystem;
    this.bills = JSON.parse(JSON.stringify(BILLS_CONFIG));
    this.evictionGraceDays = 0;
  }

  checkDailyBills(day) {
    this.bills.forEach(bill => {
      // Notificação no dia do vencimento
      if (bill.dueDay === day && !bill.paid) {
        this.events.emit(EVENTS.SHOW_NOTIFICATION, {
          text: `⚠️ BOLETO VENCE HOJE: ${bill.name} - R$ ${bill.amount.toFixed(2)}`,
          type: 'alert'
        });
      }

      // Notificação de boleto atrasado
      if (day > bill.dueDay && !bill.paid) {
        const daysLate = day - bill.dueDay;
        const interest = Math.round(bill.amount * 0.03 * daysLate);
        this.events.emit(EVENTS.SHOW_NOTIFICATION, {
          text: `🚨 BOLETO ATRASADO (${daysLate}d): ${bill.name} (+R$ ${interest} juros)`,
          type: 'warning'
        });

        // Atraso de aluguel grave: risco de despejo
        if (bill.id === 'aluguel' && daysLate >= 4) {
          this.events.emit(EVENTS.SHOW_NOTIFICATION, {
            text: 'AVISO DE DESPEJO: O proprietário ameaça trocar as fechaduras se não pagar hoje!',
            type: 'danger'
          });

          if (daysLate >= 6) {
            this.events.emit(EVENTS.GAME_OVER, {
              reason: 'eviction',
              message: 'Você foi despejado do kitnet por falta de pagamento do aluguel.'
            });
          }
        }
      }
    });
  }

  payBill(billId) {
    const bill = this.bills.find(b => b.id === billId);
    if (!bill) return { success: false, message: 'Boleto não encontrado' };
    if (bill.paid) return { success: false, message: 'Este boleto já foi pago' };

    if (this.status.money < bill.amount) {
      return { success: false, message: 'Saldo bancário insuficiente' };
    }

    this.status.modifyMoney(-bill.amount);
    bill.paid = true;
    this.status.modifyStress(-10); // Alívio ao pagar conta!

    this.events.emit(EVENTS.SHOW_NOTIFICATION, {
      text: `✅ Pagamento confirmado: ${bill.name} (R$ ${bill.amount.toFixed(2)})`,
      type: 'success'
    });

    return { success: true };
  }

  resetMonthlyBills() {
    this.bills.forEach(bill => {
      bill.paid = false;
    });
    this.events.emit(EVENTS.SHOW_NOTIFICATION, {
      text: '🗓 Novo mês se inicia! Novas contas foram lançadas.',
      type: 'info'
    });
  }

  getBillsSummary() {
    return this.bills.map(b => ({
      ...b,
      status: b.paid ? 'Pago' : 'Pendente'
    }));
  }

  serialize() {
    return {
      bills: this.bills
    };
  }

  deserialize(data) {
    if (!data || !data.bills) return;
    this.bills = data.bills;
  }
}
