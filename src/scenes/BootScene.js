import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Fundo da tela de carregamento
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.rectangle(width / 2, height / 2, width, height, 0x111625);

    this.add.text(width / 2, height / 2 - 25, 'CITY RUT • ROTINA URBANA', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#f9d423'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 15, 'Carregando cenários e texturas...', {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '14px',
      color: '#8b949e'
    }).setOrigin(0.5);
  }

  create() {
    this.createPixelTextures();

    // Inicia o jogo diretamente na rua principal inspirada nas referências!
    this.scene.start('StreetScene');
    this.scene.launch('UIScene');
    this.scene.launch('DialogueOverlay');
  }

  createPixelTextures() {
    // 1. Pavimento de Paralelepípedos Dourados / Tijolos (Referência Imagem 1)
    const cobble = this.textures.createCanvas('cobblestone', 32, 32);
    const cCtx = cobble.context;
    // Cor base tijolo dourado/areia
    cCtx.fillStyle = '#dec08b';
    cCtx.fillRect(0, 0, 32, 32);
    // Linhas de rejunte
    cCtx.fillStyle = '#bfa16f';
    cCtx.fillRect(0, 0, 32, 1);
    cCtx.fillRect(0, 16, 32, 1);
    cCtx.fillRect(15, 0, 1, 16);
    cCtx.fillRect(31, 16, 1, 16);
    // Destaques de luz nos tijolos
    cCtx.fillStyle = '#edd3a4';
    cCtx.fillRect(1, 1, 14, 2);
    cCtx.fillRect(17, 17, 14, 2);
    // Variações de tom sutil
    cCtx.fillStyle = '#caa975';
    cCtx.fillRect(8, 8, 4, 3);
    cCtx.fillRect(22, 24, 5, 3);
    cobble.refresh();

    // 2. Piso de Madeira Nobre para Interiores
    const floorWood = this.textures.createCanvas('floor_wood', 32, 32);
    const wCtx = floorWood.context;
    wCtx.fillStyle = '#b07d4b';
    wCtx.fillRect(0, 0, 32, 32);
    wCtx.fillStyle = '#8f5e31';
    wCtx.fillRect(0, 0, 32, 1);
    wCtx.fillRect(0, 16, 32, 1);
    wCtx.fillRect(16, 1, 1, 15);
    wCtx.fillRect(28, 17, 1, 15);
    floorWood.refresh();

    // 3. Personagem Principal (Inspirada na protagonista loira da Imagem 1)
    // Tamanho 24x34 pixels
    const playerCanvas = this.textures.createCanvas('player', 24, 34);
    const pCtx = playerCanvas.context;
    // Cabelo loiro vibrante com rabo de cavalo
    pCtx.fillStyle = '#ffd166';
    pCtx.fillRect(6, 2, 12, 10);
    pCtx.fillStyle = '#f4a261'; // Sombras do cabelo
    pCtx.fillRect(5, 4, 3, 8);
    pCtx.fillRect(16, 4, 3, 6);
    // Presilha / elástico de cabelo
    pCtx.fillStyle = '#e63946';
    pCtx.fillRect(17, 3, 3, 3);

    // Rosto e pele
    pCtx.fillStyle = '#ffe0bd';
    pCtx.fillRect(7, 9, 10, 8);
    // Olhos azuis expressivos
    pCtx.fillStyle = '#118ab2';
    pCtx.fillRect(9, 11, 2, 3);
    pCtx.fillRect(13, 11, 2, 3);
    pCtx.fillStyle = '#ffffff'; // Brilho no olho
    pCtx.fillRect(9, 11, 1, 1);
    pCtx.fillRect(13, 11, 1, 1);
    // Bochechas rosadas
    pCtx.fillStyle = '#ffb4a2';
    pCtx.fillRect(7, 14, 2, 1);
    pCtx.fillRect(15, 14, 2, 1);

    // Blusa Verde Esmeralda (como na Imagem 1)
    pCtx.fillStyle = '#06d6a0';
    pCtx.fillRect(6, 17, 12, 8);
    // Gola branca
    pCtx.fillStyle = '#ffffff';
    pCtx.fillRect(10, 17, 4, 2);

    // Saia / Bermuda azul marinho
    pCtx.fillStyle = '#1d3557';
    pCtx.fillRect(7, 25, 10, 4);

    // Pernas
    pCtx.fillStyle = '#ffe0bd';
    pCtx.fillRect(8, 29, 3, 3);
    pCtx.fillRect(13, 29, 3, 3);

    // Tênis pretos/marrons
    pCtx.fillStyle = '#2b2d42';
    pCtx.fillRect(7, 32, 4, 2);
    pCtx.fillRect(13, 32, 4, 2);
    playerCanvas.refresh();

    // 4. Fachada da Loja 1: "Threads Clothing Boutique" (Inspirada na Imagem 1)
    // 120x110 pixels
    const threadsShop = this.textures.createCanvas('threads_shop', 120, 110);
    const tCtx = threadsShop.context;
    // Paredes superiores amarelas suaves
    tCtx.fillStyle = '#fef08a';
    tCtx.fillRect(0, 20, 120, 90);
    // Rodapé / base em tom ciano / azul pastel
    tCtx.fillStyle = '#67e8f9';
    tCtx.fillRect(0, 96, 120, 14);

    // Toldo listrado em Verde e Branco
    for (let i = 0; i < 60; i += 10) {
      tCtx.fillStyle = (i % 20 === 0) ? '#10b981' : '#f8fafc';
      tCtx.fillRect(10 + i, 44, 10, 14);
    }
    // Sombra abaixo do toldo
    tCtx.fillStyle = 'rgba(0,0,0,0.18)';
    tCtx.fillRect(10, 58, 60, 4);

    // Vitrine de vidro com moldura de madeira
    tCtx.fillStyle = '#78350f';
    tCtx.fillRect(12, 60, 56, 34);
    tCtx.fillStyle = '#38bdf8';
    tCtx.fillRect(15, 63, 50, 28);
    // Reflexo no vidro
    tCtx.fillStyle = 'rgba(255,255,255,0.4)';
    tCtx.fillRect(18, 65, 8, 24);

    // Placa Oval: "Threads Clothing Boutique"
    tCtx.fillStyle = '#ffffff';
    tCtx.beginPath();
    tCtx.ellipse(42, 28, 36, 12, 0, 0, Math.PI * 2);
    tCtx.fill();
    tCtx.lineWidth = 2;
    tCtx.strokeStyle = '#0284c7';
    tCtx.stroke();
    tCtx.fillStyle = '#0f172a';
    tCtx.font = 'bold 8px monospace';
    tCtx.textAlign = 'center';
    tCtx.fillText('Threads', 42, 28);
    tCtx.font = '5px sans-serif';
    tCtx.fillText('CLOTHING BOUTIQUE', 42, 34);

    // Porta com arco de madeira
    tCtx.fillStyle = '#854d0e';
    tCtx.fillRect(74, 38, 36, 68);
    tCtx.fillStyle = '#38bdf8';
    tCtx.fillRect(80, 50, 24, 30);
    // Vidro da porta
    tCtx.fillStyle = '#78350f';
    tCtx.strokeRect(80, 50, 24, 30);
    // Maçaneta dourada
    tCtx.fillStyle = '#facc15';
    tCtx.fillRect(76, 74, 3, 6);

    // Jardineira com flores coloridas na lateral
    tCtx.fillStyle = '#22c55e';
    tCtx.fillRect(4, 36, 6, 60);
    tCtx.fillStyle = '#eab308'; // Tulipas amarelas
    tCtx.fillRect(5, 42, 4, 4);
    tCtx.fillRect(5, 58, 4, 4);
    tCtx.fillStyle = '#3b82f6'; // Flores azuis
    tCtx.fillRect(5, 50, 4, 4);
    tCtx.fillRect(5, 72, 4, 4);
    threadsShop.refresh();

    // 5. Fachada da Loja 2: "Salon Flamingo" (Inspirada na Imagem 1)
    // 110x110 pixels
    const salonShop = this.textures.createCanvas('salon_shop', 110, 110);
    const sCtx = salonShop.context;
    // Paredes rosas em tábuas de madeira
    sCtx.fillStyle = '#f472b6';
    sCtx.fillRect(0, 20, 110, 90);
    sCtx.fillStyle = '#ec4899';
    for (let y = 20; y < 110; y += 8) {
      sCtx.fillRect(0, y, 110, 1);
    }
    // Telhado de telhas amarelas
    sCtx.fillStyle = '#facc15';
    sCtx.fillRect(0, 0, 110, 20);
    sCtx.fillStyle = '#eab308';
    for (let x = 0; x < 110; x += 10) {
      sCtx.fillRect(x, 0, 2, 20);
    }

    // Letreiro Neon Roxo/Pink "Salon Flamingo"
    sCtx.fillStyle = '#831843';
    sCtx.font = 'bold 11px sans-serif';
    sCtx.fillText('SALON', 20, 36);
    sCtx.font = 'bold 13px sans-serif';
    sCtx.fillStyle = '#fef08a';
    sCtx.fillText('FLAMINGO', 16, 50);
    sCtx.fillStyle = '#fbcfe8';
    sCtx.font = '6px sans-serif';
    sCtx.fillText('Cuts, Colors & Trims', 18, 58);

    // Flamingo mascote em neon
    sCtx.fillStyle = '#f43f5e';
    sCtx.beginPath();
    sCtx.arc(10, 38, 6, 0, Math.PI * 2);
    sCtx.fill();

    // Porta branca com vigia circular azul
    sCtx.fillStyle = '#ffffff';
    sCtx.fillRect(20, 64, 28, 44);
    sCtx.strokeStyle = '#475569';
    sCtx.strokeRect(20, 64, 28, 44);
    // Vigia circular
    sCtx.fillStyle = '#38bdf8';
    sCtx.beginPath();
    sCtx.arc(34, 78, 7, 0, Math.PI * 2);
    sCtx.fill();
    sCtx.strokeStyle = '#0284c7';
    sCtx.stroke();

    // Vaso de Rosas Vermelhas ao lado da porta
    sCtx.fillStyle = '#9a3412'; // Terracota
    sCtx.fillRect(56, 86, 20, 22);
    sCtx.fillStyle = '#15803d'; // Folhas verdes
    sCtx.fillRect(54, 76, 24, 12);
    sCtx.fillStyle = '#dc2626'; // Rosas vermelhas
    sCtx.fillRect(58, 74, 5, 5);
    sCtx.fillRect(68, 72, 6, 6);
    sCtx.fillRect(63, 78, 5, 5);
    salonShop.refresh();

    // 6. Fachada do Prédio Residencial (O Kitnet do Jogador)
    const aptBuilding = this.textures.createCanvas('apt_building', 100, 110);
    const aCtx = aptBuilding.context;
    aCtx.fillStyle = '#334155';
    aCtx.fillRect(0, 0, 100, 110);
    // Janelas iluminadas do prédio
    aCtx.fillStyle = '#fef08a';
    aCtx.fillRect(15, 15, 20, 20);
    aCtx.fillRect(65, 15, 20, 20);
    aCtx.fillStyle = '#38bdf8';
    aCtx.fillRect(15, 45, 20, 20);
    aCtx.fillRect(65, 45, 20, 20);
    // Portaria
    aCtx.fillStyle = '#1e293b';
    aCtx.fillRect(35, 75, 30, 35);
    aCtx.fillStyle = '#00f2fe';
    aCtx.font = 'bold 6px monospace';
    aCtx.fillText('KITNETS', 50, 72);
    aptBuilding.refresh();

    // 7. Entrada de Metrô com Totem Vermelho (Referência Urbana)
    const subwayCanvas = this.textures.createCanvas('subway_station', 80, 80);
    const subCtx = subwayCanvas.context;
    // Escada subterrânea
    subCtx.fillStyle = '#0f172a';
    subCtx.fillRect(10, 30, 60, 48);
    subCtx.fillStyle = '#475569';
    for (let y = 34; y < 78; y += 8) {
      subCtx.fillRect(14, y, 52, 4);
    }
    // Corrimão metálico
    subCtx.fillStyle = '#cbd5e1';
    subCtx.fillRect(8, 25, 4, 55);
    subCtx.fillRect(68, 25, 4, 55);
    subCtx.fillRect(8, 25, 64, 4);
    // Totem Vermelho iluminado "M"
    subCtx.fillStyle = '#dc2626';
    subCtx.fillRect(30, 2, 20, 20);
    subCtx.fillStyle = '#ffffff';
    subCtx.font = 'bold 14px monospace';
    subCtx.textAlign = 'center';
    subCtx.fillText('M', 40, 17);
    subwayCanvas.refresh();

    // 8. Palmeira Tropical em Vaso com Luzinhas (Inspirada na Imagem 1)
    const palm = this.textures.createCanvas('palm_planter', 48, 50);
    const pmCtx = palm.context;
    // Vaso de concreto cinza
    pmCtx.fillStyle = '#64748b';
    pmCtx.fillRect(14, 32, 20, 18);
    // Folhagem densa da palmeira (leques verdes)
    pmCtx.fillStyle = '#16a34a';
    pmCtx.beginPath();
    pmCtx.arc(24, 22, 18, 0, Math.PI * 2);
    pmCtx.fill();
    pmCtx.fillStyle = '#15803d';
    pmCtx.beginPath();
    pmCtx.arc(24, 22, 12, 0, Math.PI * 2);
    pmCtx.fill();
    // Cordão de luzinhas quentes penduradas
    pmCtx.fillStyle = '#fef08a';
    pmCtx.fillRect(12, 26, 4, 4);
    pmCtx.fillRect(22, 29, 4, 4);
    pmCtx.fillRect(32, 26, 4, 4);
    palm.refresh();

    // 9. Guarda-corpo / Grade Metálica com Luzes (Inspirada na Imagem 1)
    const railing = this.textures.createCanvas('street_railing', 64, 24);
    const rCtx = railing.context;
    rCtx.fillStyle = '#475569';
    rCtx.fillRect(0, 0, 64, 6);
    rCtx.fillRect(0, 18, 64, 6);
    for (let x = 6; x < 64; x += 12) {
      rCtx.fillRect(x, 6, 4, 12);
      // Lâmpada de iluminação pública na grade
      rCtx.fillStyle = '#fef08a';
      rCtx.fillRect(x - 1, 3, 6, 6);
      rCtx.fillStyle = '#475569';
    }
    railing.refresh();

    // 10. Cama e Móveis do Quarto
    const bedCanvas = this.textures.createCanvas('bed', 32, 48);
    const bCtx = bedCanvas.context;
    bCtx.fillStyle = '#5c3a21';
    bCtx.fillRect(0, 0, 32, 48);
    bCtx.fillStyle = '#38bdf8'; // Cobertor azul alegre
    bCtx.fillRect(2, 14, 28, 32);
    bCtx.fillStyle = '#ffffff'; // Travesseiro branco fofo
    bCtx.fillRect(6, 4, 20, 8);
    bedCanvas.refresh();

    const deskCanvas = this.textures.createCanvas('desk', 48, 32);
    const dCtx = deskCanvas.context;
    dCtx.fillStyle = '#475569';
    dCtx.fillRect(0, 0, 48, 32);
    dCtx.fillStyle = '#0f172a';
    dCtx.fillRect(16, 2, 16, 12);
    dCtx.fillStyle = '#00f2fe';
    dCtx.fillRect(18, 4, 12, 8);
    dCtx.fillStyle = '#e11d48'; // Caneca vermelha de café
    dCtx.fillRect(6, 8, 4, 6);
    deskCanvas.refresh();

    const fridgeCanvas = this.textures.createCanvas('fridge', 24, 36);
    const fCtx = fridgeCanvas.context;
    fCtx.fillStyle = '#f8fafc';
    fCtx.fillRect(0, 0, 24, 36);
    fCtx.fillStyle = '#94a3b8';
    fCtx.fillRect(0, 14, 24, 2);
    fCtx.fillStyle = '#ef4444';
    fCtx.fillRect(14, 6, 3, 3);
    fridgeCanvas.refresh();

    const catCanvas = this.textures.createCanvas('cat', 16, 16);
    const catCtx = catCanvas.context;
    catCtx.fillStyle = '#f97316';
    catCtx.fillRect(2, 4, 12, 10);
    catCtx.fillRect(3, 1, 3, 3);
    catCtx.fillRect(10, 1, 3, 3);
    catCtx.fillStyle = '#38bdf8';
    catCtx.fillRect(4, 6, 2, 2);
    catCtx.fillRect(10, 6, 2, 2);
    catCanvas.refresh();
  }
}
