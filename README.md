# 🏙️ City Rut (Rotina Urbana)

**City Rut** é um Life Sim / RPG Social 2D em Pixel Art desenvolvido para a Web com **Phaser 3** e **Vite**, inspirado no equilíbrio de rotina de *Stardew Valley* e *Persona*.

Na metrópole, o jogador precisa gerenciar tempo, energia, sanidade mental e finanças para equilibrar trabalho precarizado, freelas, condução pública lotada, faculdade noturna, aluguel e vida social.

---

## 🎮 Controles

| Tecla | Ação |
| :--- | :--- |
| **W, A, S, D** ou **Setas** | Movimentação em 8 direções |
| **E** ou **Espaço** | Interagir com objetos e personagens |
| **Mouse** | Selecionar opções em diálogos e pagar boletos |
| **M** | Acessar informações de metrô e trânsito |

---

## ⚙️ Principais Mecânicas

1. **Ciclo Diário e Relógio (06:00 às 03:00)**:
   - 1 segundo real ≈ 1 minuto no jogo.
   - Dormir na cama restaura a energia, reduz o estresse e salva o progresso.
   - Ficar acordado após as 03:00 causa colapso por exaustão.

2. **Barras de Status**:
   - **Energia (0 a 100)**: Dita ações físicas, trabalho e estudo.
   - **Estresse / Sanidade (0 a 100)**: Aumenta com transporte lotado e boletos. Estresse alto (>80) gera **Burnout**, duplicando o gasto de energia e bloqueando o aprendizado.

3. **Economia e Boletos**:
   - **Aluguel do Kitnet (Dia 05 - R$ 600,00)**: Atrasar mais de 5 dias leva ao despejo (Game Over).
   - **Luz + Internet (Dia 10 - R$ 140,00)**.
   - **Mensalidade da Faculdade (Dia 15 - R$ 320,00)**.

4. **Dungeon Urbana (Metrô / Ônibus)**:
   - Viagens de transporte público geram eventos aleatórios de estresse, ambulantes e encontros inesperados.

5. **Salvamento Local**:
   - Salvamento automático diário no `localStorage` do navegador com suporte a exportação e importação em `.json`.

---

## 🚀 Como Rodar Localmente

1. Clone o repositório ou acesse a pasta:
   ```bash
   cd jogoAulaSexta
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   Abra no seu navegador o endereço indicado (normalmente `http://localhost:3000` ou `http://localhost:5173`).

---

## 📦 Build e Publicação

- Gerar versão de produção:
  ```bash
  npm run build
  ```
- O repositório já possui uma **GitHub Action** configurada em `.github/workflows/deploy.yml` que publica automaticamente no **GitHub Pages** a cada push na branch `main`.
