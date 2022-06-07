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

const grayscaleFilter = (pixels) => {
  const d = pixels.data;
  for (let i=0; i<d.length; i+=4) {
    const r = d[i];
    const g = d[i+1];
    const b = d[i+2];
    // CIE luminance for the RGB
    // The human eye is bad at seeing red and blue, so we de-emphasize them.
    const v = 0.2126*r + 0.7152*g + 0.0722*b;
    d[i] = d[i+1] = d[i+2] = v
  }
  return pixels;
}

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


const createImageData = (w,h) => {
  const tmpCanvas = document.createElement('canvas');
  const tmpCtx = tmpCanvas.getContext('2d');
  return tmpCtx.createImageData(w,h);
};

const convolute = (pixels, weights) => {
  const side = Math.round(Math.sqrt(weights.length));
  const halfSide = Math.floor(side/2);
  const src = pixels.data;
  const sw = pixels.width;
  const sh = pixels.height;
  // pad output by the convolution matrix
  const w = sw;
  const h = sh;
  const output = createImageData(w, h);
  const dst = output.data;
  const alphaFac = 1;
  // go through the destination image pixels
  for (let y=0; y<h; y++) {
    for (let x=0; x<w; x++) {
      let sy = y;
      let sx = x;
      let dstOff = (y*w+x)*4;
      // calculate the weighed sum of the source image pixels that
      // fall under the convolution matrix
      let r=0, g=0, b=0, a=0;
      for (let cy=0; cy<side; cy++) {
        for (let cx=0; cx<side; cx++) {
          let scy = sy + cy - halfSide;
          let scx = sx + cx - halfSide;
          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
            let srcOff = (scy*sw+scx)*4;
            let wt = weights[cy*side+cx];
            r += src[srcOff] * wt;
            g += src[srcOff+1] * wt;
            b += src[srcOff+2] * wt;
            a += src[srcOff+3] * wt;
          }
        }
      }
      dst[dstOff] = r;
      dst[dstOff+1] = g;
      dst[dstOff+2] = b;
      dst[dstOff+3] = a + alphaFac*(255-a);
    }
  }
  return output;
};

const convoluteFloat32 = (pixels, weights) => {
  const side = Math.round(Math.sqrt(weights.length));
  const halfSide = Math.floor(side/2);

  const src = pixels.data;
  const sw = pixels.width;
  const sh = pixels.height;

  const w = sw;
  const h = sh;
  const output = {
    width: w, height: h, data: new Float32Array(w*h*4)
  };
  const dst = output.data;

  const alphaFac = 0;
  for (let y=0; y<h; y++) {
    for (let x=0; x<w; x++) {
      let sy = y;
      let sx = x;
      let dstOff = (y*w+x)*4;
      let r=0, g=0, b=0, a=0;
      for (let cy=0; cy<side; cy++) {
        for (let cx=0; cx<side; cx++) {
          let scy = Math.min(sh-1, Math.max(0, sy + cy - halfSide));
          let scx = Math.min(sw-1, Math.max(0, sx + cx - halfSide));
          let srcOff = (scy*sw+scx)*4;
          let wt = weights[cy*side+cx];
          r += src[srcOff] * wt;
          g += src[srcOff+1] * wt;
          b += src[srcOff+2] * wt;
          a += src[srcOff+3] * wt;
        }
      }
      dst[dstOff] = r;
      dst[dstOff+1] = g;
      dst[dstOff+2] = b;
      dst[dstOff+3] = a + alphaFac*(255-a);
    }
  }
  return output;
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


const task2BlurGaussian = () => {
  const size = 10;
  const div = size * (size / 2);

  const normalMatrix = new Array(size*size).fill(0).map(() => randn_bm() / div);
  
  const taskDiv = document.createElement('div');
  taskDiv.className = 'row';
  const { ctx, cvs, imageData } = createNewCanvasFromImage();
  const imageDataNew = convolute(imageData, normalMatrix);

  ctx.putImageData(imageDataNew, 0, 0);
  taskDiv.appendChild(cvs);
  document.body.appendChild(taskDiv);
};

const taskFilterSharp = () => {
  const taskDiv = document.createElement('div');
  taskDiv.className = 'row';
  const { ctx, cvs, imageData } = createNewCanvasFromImage();
  const imageDataNew = convolute(imageData,[ 
    0, -1,  0,
    -1,  5, -1,
    0, -1,  0
  ])

  ctx.putImageData(imageDataNew, 0, 0);
  taskDiv.appendChild(cvs);
  document.body.appendChild(taskDiv);
};


const taskFilterSobel = () => {
  const taskDiv = document.createElement('div');
  taskDiv.className = 'row';
  const { ctx, cvs, imageData } = createNewCanvasFromImage();
  const grayscale = grayscaleFilter(imageData);
  const vertical = convoluteFloat32(grayscale,
  [ -1, 0, 1,
    -2, 0, 2,
    -1, 0, 1 ]
  );
  const horizontal = convoluteFloat32(grayscale,
  [ -1, -2, -1,
    0,  0,  0,
    1,  2,  1 ]
  );
  const final_image = createImageData(vertical.width, vertical.height);
  for (let i = 0; i < final_image.data.length; i += 4) {
    // make the vertical gradient red
    const v = Math.abs(vertical.data[i]);
    const h = Math.abs(horizontal.data[i]);
    const magnitude = Math.sqrt((v * v) + (h * h));
    final_image.data[i] = magnitude
    final_image.data[i+1] = magnitude;
    final_image.data[i+2] = magnitude;
    final_image.data[i+3] = 255; // opaque alpha
  }

  ctx.putImageData(final_image, 0, 0);
  taskDiv.appendChild(cvs);
  document.body.appendChild(taskDiv);
};

img.onload = () => {
  task2a();
  task2b();
  task2c();
  task2d();
  task2BlurGaussian();
  taskFilterSharp();
  taskFilterSobel();
};
