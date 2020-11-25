const inputFile = document.getElementById('photo-file');
const preview = document.getElementById('photo-preview');
let image;
let name = 'imagem';
// Select and preview image

document.getElementById('select-image')
  .onclick = () => inputFile.click();

window.addEventListener('DOMContentLoaded', () => {
  inputFile.addEventListener('change', () => {
    let file = inputFile.files.item(0);
    if(file) {
      name = file.name;
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = event => {
        image = new Image();
        image.src = event.target.result;
        image.onload = onLoadImage;
      };
    }
  })
});

// Selection tool
const selection = document.getElementById('selection-tool');
let startX, startY, relativeStartX, relativeStartY, endX, endY, relativeEndX, relativeEndY;
let onSelection = false;

const events = {
  mouseover(){
    this.style.cursor = 'crosshair';
  },
  mousedown(event){
    const { clientX, clientY, offsetX, offsetY } = event;

    onSelection = true;
    startX = clientX;
    startY = clientY;
    relativeStartX = offsetX;
    relativeStartY = offsetY;
  },
  mousemove(event){
    endX = event.clientX;
    endY = event.clientY;

    if(onSelection) {
      selection.style.display = 'initial';
      selection.style.top = startY + 'px';
      selection.style.left = startX + 'px';
      selection.style.width = (endX-startX) + 'px';
      selection.style.height = (endY-startY) + 'px';
    }
  },
  mouseup(event){
    onSelection = false;
    relativeEndX = event.layerX;
    relativeEndY = event.layerY;

    cropButton.style.display = 'initial';
  }
}

Object.keys(events)
  .forEach( eventName => {
    preview.addEventListener(eventName, events[eventName])
  })

// Canvas
let canvas = document.createElement('canvas');
let contextCanvas = canvas.getContext('2d');

function onLoadImage() {
  // Redimensionando canvas
  const {width, height} = image;
  canvas.width = width;
  canvas.height = height;

  // Limpando contexto
  contextCanvas.clearRect(0, 0, width, height);

  // Desenhar imagem no contexto
  contextCanvas.drawImage(image, 0, 0);
  preview.src = canvas.toDataURL();
}

const cropButton = document.getElementById('crop-image');

cropButton.onclick = () => {
  const { width: imgW, height: imgH } = image;
  const { width: prevW, height: prevH } = preview;
  
  const [ widthFactor, heightFactor ] = [ 
    (imgW / prevW), 
    (imgH / prevH) 
  ];
  
  const [ selectionWidth, selectionHeight ] = [
    selection.style.width.replace('px',''), 
    selection.style.height.replace('px','')
  ];

  const [ croppedWidth, croppedHeight ] = [
    (selectionWidth * widthFactor),
    (selectionHeight * heightFactor)
  ];
  
  const [ actualX, actualY ] = [
    (relativeStartX * widthFactor),
    (relativeStartY * heightFactor)
  ];

  // Pegar do contextCanvas a região de corte
  const croppedImage = contextCanvas.getImageData(actualX, actualY, croppedWidth, croppedHeight);

  // Limpando contextCanvas
  contextCanvas.clearRect(0, 0, contextCanvas.width, contextCanvas.height);

  // Ajuste de proporções do canvas e da imagem
  image.width = canvas.width = croppedWidth;
  image.height = canvas.height = croppedHeight;

  // Adicionar imagem corta ao contexto do canvas
  contextCanvas.putImageData(croppedImage, 0, 0);

  // Esconder selection tool
  selection.style.display = 'none';

  // Atualizar preview da imagem
  preview.src = canvas.toDataURL();

  // Exibir botão de download
  downloadButton.style.display = 'initial';
}

// Download
const downloadButton = document.getElementById('download');

downloadButton.onclick = () => {
  const a = document.createElement('a');
  a.download = name.split('.')[0] + '-modified.png';
  a.href = canvas.toDataURL();
  a.click();
}