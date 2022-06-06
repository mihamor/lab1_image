const img = document.getElementsByTagName("img")[0];

img.crossOrigin = "Anonymous";
const { width, height } = img;
const img2 = new Image(width, height);
img2.src = 'https://placedog.net/501/501';

const createNewCanvasFromImage = () => {
  const cvs = document.createElement('canvas');
  cvs.width = width;
  cvs.height = height;
  const ctx = cvs.getContext("2d");
  ctx.drawImage(img, 0, 0, cvs.width,cvs.height);
  const imageData = ctx.getImageData(0, 0, cvs.width, cvs.height);
  return { ctx, cvs, imageData }; 
};

const invert = (imageData) => {
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    data[i]     = 255 - data[i];     // red
    data[i + 1] = 255 - data[i + 1]; // green
    data[i + 2] = 255 - data[i + 2]; // blue
  }
  return imageData;
};

const addToPixel = (imageData, pixel, value) => {
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    switch(pixel) {
      case 'red': {
        data[i] = data[i] + value; 
        break;
      }
      case 'green': {
        data[i + 1] = data[i + 1] + value; 
        break;
      }
      case 'blue': {
        data[i + 2] = data[i + 2] + value; 
        break;
      }
    }
  }
  return imageData;
};

const nullPixel = (imageData, pixel) => {
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    switch(pixel) {
      case 'red': {
        data[i + 1] = 0; 
        data[i + 2] = 0; 
        break;
      }
      case 'green': {
        data[i] = 0; 
        data[i + 2] = 0; 
        break;
      }
      case 'blue': {
        data[i] = 0; 
        data[i + 1] = 0; 
        break;
      }
    }
  }
  return imageData;
};

const task2a = () => {
  const taskDiv = document.createElement('div');
  taskDiv.className = 'row';
  const { ctx, cvs, imageData } = createNewCanvasFromImage();
  const newImageData = invert(imageData);
  ctx.putImageData(newImageData, 0, 0);

  taskDiv.appendChild(img);
  taskDiv.appendChild(cvs);
  document.body.appendChild(taskDiv);
};

const task2b = () => {
  const taskDiv = document.createElement('div');
  taskDiv.className = 'row';
  const { ctx: ctxR, cvs: cvsR, imageData: imageDataR } = createNewCanvasFromImage();
  const { ctx: ctxG, cvs: cvsG, imageData: imageDataG } = createNewCanvasFromImage();
  const { ctx: ctxB, cvs: cvsB, imageData: imageDataB } = createNewCanvasFromImage();
  

  const newImageDataR = addToPixel(imageDataR, 'red', 20);
  const newImageDataG = addToPixel(imageDataG, 'green', 20);
  const newImageDataB = addToPixel(imageDataB, 'blue', 20);

  ctxR.putImageData(newImageDataR, 0, 0);
  ctxG.putImageData(newImageDataG, 0, 0);
  ctxB.putImageData(newImageDataB, 0, 0);

  taskDiv.appendChild(cvsR);
  taskDiv.appendChild(cvsG);
  taskDiv.appendChild(cvsB);
  document.body.appendChild(taskDiv);
};

const task2c = () => {
  const taskDiv = document.createElement('div');
  taskDiv.className = 'row';
  const { ctx: ctxR, cvs: cvsR, imageData: imageDataR } = createNewCanvasFromImage();
  const { ctx: ctxG, cvs: cvsG, imageData: imageDataG } = createNewCanvasFromImage();
  const { ctx: ctxB, cvs: cvsB, imageData: imageDataB } = createNewCanvasFromImage();
  

  const newImageDataR = nullPixel(imageDataR, 'red');
  const newImageDataG = nullPixel(imageDataG, 'green');
  const newImageDataB = nullPixel(imageDataB, 'blue');

  ctxR.putImageData(newImageDataR, 0, 0);
  ctxG.putImageData(newImageDataG, 0, 0);
  ctxB.putImageData(newImageDataB, 0, 0);

  taskDiv.appendChild(cvsR);
  taskDiv.appendChild(cvsG);
  taskDiv.appendChild(cvsB);
  document.body.appendChild(taskDiv);
};


const task2d = () => {
  const taskDiv = document.createElement('div');
  taskDiv.className = 'row';
  const img1 = img.cloneNode();
  const img2Clone = img2.cloneNode();
  taskDiv.appendChild(img1);
  taskDiv.appendChild(img2Clone);
  const { ctx, cvs } = createNewCanvasFromImage();

  img2Clone.onload = () => {
    ctx.globalAlpha = 0.5;
    ctx.drawImage(img2Clone, 0, 0, height, width);
    taskDiv.appendChild(cvs);
  };
  document.body.appendChild(taskDiv);
};


const task2e = () => {
  const taskDiv = document.createElement('div');
  taskDiv.className = 'row';
  const { ctx, cvs, imageData } = createNewCanvasFromImage();
  const px = imageData.data;
  const tmpPx = new Uint8ClampedArray(px.length);
  tmpPx.set(px);

  for (let i = 0; i < px.length; i++) {
    if (i % 4 === 3) {continue;}
    px[i] = ( tmpPx[i] 
    + (tmpPx[i - 4] || tmpPx[i])
    + (tmpPx[i + 4] || tmpPx[i]) 
    + (tmpPx[i - 4 * imageData.width] || tmpPx[i])
    + (tmpPx[i + 4 * imageData.width] || tmpPx[i]) 
    + (tmpPx[i - 4 * imageData.width - 4] || tmpPx[i])
    + (tmpPx[i + 4 * imageData.width + 4] || tmpPx[i])
    + (tmpPx[i + 4 * imageData.width - 4] || tmpPx[i])
    + (tmpPx[i - 4 * imageData.width + 4] || tmpPx[i])
    ) / 9;
  };

  ctx.putImageData(imageData, 0, 0);
  taskDiv.appendChild(cvs);
  document.body.appendChild(taskDiv);
};

img.onload = () => {
  task2a();
  task2b();
  task2c();
  task2d();
  task2e();
};
