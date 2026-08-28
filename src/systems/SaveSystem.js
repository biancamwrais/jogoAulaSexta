const SAVE_KEY = 'city_rut_savegame_v1';

export class SaveSystem {
  static save(gameState) {
    try {
      const payload = {
        version: '0.1.0',
        savedAt: new Date().toISOString(),
        time: gameState.time.serialize(),
        status: gameState.status.serialize(),
        economy: gameState.economy.serialize()
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      return { success: true };
    } catch (err) {
      console.error('Erro ao salvar no localStorage:', err);
      return { success: false, error: err };
    }
  }

  static load(gameState) {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return { success: false, message: 'Nenhum save encontrado' };

      const data = JSON.parse(raw);
      if (data.time) gameState.time.deserialize(data.time);
      if (data.status) gameState.status.deserialize(data.status);
      if (data.economy) gameState.economy.deserialize(data.economy);

      return { success: true, savedAt: data.savedAt };
    } catch (err) {
      console.error('Erro ao carregar save:', err);
      return { success: false, error: err };
    }
  }

  static hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  static exportToFile() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;

    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `city_rut_save_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }

  static importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
          resolve({ success: true });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  static clear() {
    localStorage.removeItem(SAVE_KEY);
  }
}
