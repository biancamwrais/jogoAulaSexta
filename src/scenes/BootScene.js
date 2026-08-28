import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Tela de carregamento elegante
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const loadingText = this.add.text(width / 2, height / 2 - 20, 'CARREGANDO CIDADE...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#00f2fe'
    }).setOrigin(0.5);

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x1a2332, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 + 10, 320, 20);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x00f2fe, 1);
      progressBar.fillRect(width / 2 - 155, height / 2 + 15, 310 * value, 10);
    });

    this.createPixelTextures();
  }

  create() {
    this.scene.start('KitnetScene');
    this.scene.launch('UIScene');
    this.scene.launch('DialogueOverlay');
  }

  createPixelTextures() {
    // 1. Textura do Player (24x32 pixels, visual jovem urbano com moletom e mochila)
    const playerCanvas = this.textures.createCanvas('player', 24, 32);
    const pCtx = playerCanvas.context;
    // Cabelo escuro
    pCtx.fillStyle = '#221e22';
    pCtx.fillRect(6, 2, 12, 6);
    // Rosto
    pCtx.fillStyle = '#fcd0a1';
    pCtx.fillRect(7, 8, 10, 8);
    // Olhos
    pCtx.fillStyle = '#1c1b29';
    pCtx.fillRect(9, 10, 2, 2);
    pCtx.fillRect(13, 10, 2, 2);
    // Moletom urbano (Azul escuro / Turquesa)
    pCtx.fillStyle = '#1d3557';
    pCtx.fillRect(5, 16, 14, 10);
    // Alças da mochila
    pCtx.fillStyle = '#e63946';
    pCtx.fillRect(7, 16, 2, 8);
    pCtx.fillRect(15, 16, 2, 8);
    // Calça jeans
    pCtx.fillStyle = '#457b9d';
    pCtx.fillRect(7, 26, 10, 4);
    // Tênis
    pCtx.fillStyle = '#f1faee';
    pCtx.fillRect(6, 30, 4, 2);
    pCtx.fillRect(14, 30, 4, 2);
    playerCanvas.refresh();

    // 2. Textura do Chão do Quarto (Madeira laminada clássica de kitnet)
    const floorWood = this.textures.createCanvas('floor_wood', 32, 32);
    const wCtx = floorWood.context;
    wCtx.fillStyle = '#8b5a2b';
    wCtx.fillRect(0, 0, 32, 32);
    wCtx.fillStyle = '#7a4e25';
    wCtx.fillRect(0, 0, 32, 2);
    wCtx.fillRect(0, 16, 32, 2);
    wCtx.fillRect(15, 2, 2, 14);
    wCtx.fillRect(28, 18, 2, 14);
    floorWood.refresh();

    // 3. Textura da Parede (Tijolo claro / reboco desgastado)
    const wallCanvas = this.textures.createCanvas('wall', 32, 32);
    const wallCtx = wallCanvas.context;
    wallCtx.fillStyle = '#2b303a';
    wallCtx.fillRect(0, 0, 32, 32);
    wallCtx.fillStyle = '#1e2229';
    wallCtx.fillRect(0, 30, 32, 2);
    wallCtx.fillStyle = '#39404d';
    wallCtx.fillRect(2, 6, 28, 1);
    wallCtx.fillRect(2, 18, 28, 1);
    wallCanvas.refresh();

    // 4. Cama de Solteiro (32x48)
    const bedCanvas = this.textures.createCanvas('bed', 32, 48);
    const bCtx = bedCanvas.context;
    // Estrutura de madeira
    bCtx.fillStyle = '#5c3a21';
    bCtx.fillRect(0, 0, 32, 48);
    // Lençol / Cobertor
    bCtx.fillStyle = '#2a6f97';
    bCtx.fillRect(2, 14, 28, 32);
    // Dobra do cobertor
    bCtx.fillStyle = '#468faf';
    bCtx.fillRect(2, 14, 28, 4);
    // Travesseiro
    bCtx.fillStyle = '#edf2f4';
    bCtx.fillRect(6, 4, 20, 8);
    bedCanvas.refresh();

    // 5. Mesa com Computador (48x32)
    const deskCanvas = this.textures.createCanvas('desk', 48, 32);
    const dCtx = deskCanvas.context;
    // Tampo da mesa
    dCtx.fillStyle = '#495057';
    dCtx.fillRect(0, 0, 48, 32);
    // Monitor
    dCtx.fillStyle = '#111';
    dCtx.fillRect(16, 2, 16, 12);
    // Tela acesa azul neon
    dCtx.fillStyle = '#00f2fe';
    dCtx.fillRect(18, 4, 12, 8);
    // Teclado
    dCtx.fillStyle = '#343a40';
    dCtx.fillRect(16, 18, 16, 6);
    // Xícara de café
    dCtx.fillStyle = '#e63946';
    dCtx.fillRect(6, 8, 4, 6);
    deskCanvas.refresh();

    // 6. Geladeira (24x36)
    const fridgeCanvas = this.textures.createCanvas('fridge', 24, 36);
    const fCtx = fridgeCanvas.context;
    fCtx.fillStyle = '#ced4da';
    fCtx.fillRect(0, 0, 24, 36);
    fCtx.fillStyle = '#adb5bd';
    fCtx.fillRect(0, 14, 24, 2);
    // Puxadores
    fCtx.fillStyle = '#495057';
    fCtx.fillRect(2, 6, 2, 4);
    fCtx.fillRect(2, 18, 2, 6);
    // Imã de geladeira
    fCtx.fillStyle = '#ff007f';
    fCtx.fillRect(14, 6, 3, 3);
    fridgeCanvas.refresh();

    // 7. Porta (24x36)
    const doorCanvas = this.textures.createCanvas('door', 24, 36);
    const drCtx = doorCanvas.context;
    drCtx.fillStyle = '#6c584c';
    drCtx.fillRect(0, 0, 24, 36);
    drCtx.fillStyle = '#443830';
    drCtx.strokeRect(2, 2, 20, 32);
    // Maçaneta dourada
    drCtx.fillStyle = '#f9d423';
    drCtx.fillRect(18, 18, 3, 3);
    doorCanvas.refresh();

    // 8. Piso de Asfalto e Calçada (Rua)
    const asphalt = this.textures.createCanvas('asphalt', 32, 32);
    const aCtx = asphalt.context;
    aCtx.fillStyle = '#1b1d22';
    aCtx.fillRect(0, 0, 32, 32);
    aCtx.fillStyle = '#23272e';
    aCtx.fillRect(4, 4, 2, 2);
    aCtx.fillRect(20, 18, 2, 2);
    asphalt.refresh();

    const sidewalk = this.textures.createCanvas('sidewalk', 32, 32);
    const sCtx = sidewalk.context;
    sCtx.fillStyle = '#6c757d';
    sCtx.fillRect(0, 0, 32, 32);
    sCtx.fillStyle = '#495057';
    sCtx.strokeRect(0, 0, 32, 32);
    sidewalk.refresh();

    // 9. Estação de Metrô / Catraca (32x32)
    const metroSign = this.textures.createCanvas('metro_sign', 32, 32);
    const mCtx = metroSign.context;
    mCtx.fillStyle = '#d90429';
    mCtx.fillRect(2, 2, 28, 28);
    mCtx.fillStyle = '#ffffff';
    mCtx.font = 'bold 16px monospace';
    mCtx.textAlign = 'center';
    mCtx.textBaseline = 'middle';
    mCtx.fillText('M', 16, 16);
    metroSign.refresh();

    // 10. Gato da vizinhança / do quarto
    const catCanvas = this.textures.createCanvas('cat', 16, 16);
    const cCtx = catCanvas.context;
    cCtx.fillStyle = '#fb8500';
    cCtx.fillRect(2, 4, 12, 10);
    // Orelhas
    cCtx.fillRect(3, 1, 3, 3);
    cCtx.fillRect(10, 1, 3, 3);
    // Olhinhos
    cCtx.fillStyle = '#219ebc';
    cCtx.fillRect(4, 6, 2, 2);
    cCtx.fillRect(10, 6, 2, 2);
    catCanvas.refresh();
  }
}
