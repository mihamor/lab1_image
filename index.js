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
  

  const newImageDataR = addToPixel(imageDataR, 'red', 40);
  const newImageDataG = addToPixel(imageDataG, 'green', 40);
  const newImageDataB = addToPixel(imageDataB, 'blue', 40);

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

const task2Median = () => {
  const taskDiv = document.createElement('div');
  taskDiv.className = 'row';
  const { ctx, cvs, imageData} = createNewCanvasFromImage();

  const sizePx = 5;
  const imageDataNew = median(imageData, sizePx);
  ctx.putImageData(imageDataNew, 0, 0);
  taskDiv.appendChild(cvs);
  document.body.appendChild(taskDiv);
};

const task2ErosionAddup = () => {
  const taskDiv = document.createElement('div');
  taskDiv.className = 'row';
  const { ctx, cvs, imageData} = createNewCanvasFromImage();
  const { ctx: ctx1, cvs: cvs1, imageData: imageData1} = createNewCanvasFromImage();

  const matrix = [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0],
  ];

  const imageDataErosion = erosion(imageData, matrix);
  const imageDataAddup = addup(imageData1, matrix);
  ctx.putImageData(imageDataErosion, 0, 0);
  ctx1.putImageData(imageDataAddup, 0, 0); 
  taskDiv.appendChild(cvs);
  taskDiv.appendChild(cvs1);
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
  ]);

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
  task2Median();
  task2ErosionAddup();
  taskFilterSobel();
};
