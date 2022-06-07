
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


const median = (imageData, size) => {
  const { data, width, height } = imageData;
  const halfSize = Math.floor(size / 2);
  const newData = createImageData(width, height);
  for (let i = 0; i < data.length; i += 4) {
    const x = Math.floor(i / 4) % width;
    const y =  Math.floor(Math.floor(i / 4) / width);
    const redEntries = [];
    const greenEntries = [];
    const blueEntries = [];

    const startValueX = x - halfSize < 0 ? 0 : x - halfSize;
    for (let mx = startValueX; mx < x + halfSize && mx < width; mx++) {
      const startValueY = y - halfSize < 0 ? 0 : y - halfSize;
      for (let my = startValueY; my < y + halfSize && my < height; my++) {
        const startI = ((my * width) + mx) * 4;
        redEntries.push(data[startI]);
        greenEntries.push(data[startI + 1]);
        blueEntries.push(data[startI + 2]);
      }
    }

    const red = redEntries.sort()[Math.floor(redEntries.length / 2)];
    const green = greenEntries.sort()[Math.floor(redEntries.length / 2)];
    const blue = blueEntries.sort()[Math.floor(redEntries.length / 2)];

    newData.data[i] = red;
    newData.data[i + 1] = green;
    newData.data[i + 2] = blue;
    newData.data[i + 3] = 255;
  }
  return newData;
};

const erosion = (imageData, matrix) => {
  const { data, width, height } = imageData;
  const halfSize = Math.floor(matrix.length / 2);
  const newData = createImageData(width, height);
  for (let i = 0; i < data.length; i += 4) {
    const x = Math.floor(i / 4) % width;
    const y =  Math.floor(Math.floor(i / 4) / width);
    const redEntries = [];
    const greenEntries = [];
    const blueEntries = [];

    const startValueX = x - halfSize < 0 ? 0 : x - halfSize;
    for (let mx = startValueX; mx < x + halfSize && mx < width; mx++) {
      const startValueY = y - halfSize < 0 ? 0 : y - halfSize;
      for (let my = startValueY; my < y + halfSize && my < height; my++) {
        const startI = ((my * width) + mx) * 4;
        const matrixX = mx - x + halfSize < 0 ? 0 : mx - x + halfSize
        const matrixY = my - y + halfSize < 0 ? 0 : my - y + halfSize
        if (matrix[matrixX][matrixY]) {
          redEntries.push(data[startI]);
          greenEntries.push(data[startI + 1]);
          blueEntries.push(data[startI + 2]);
        }
      }
    }

    const red = redEntries.sort()[0];
    const green = greenEntries.sort()[0];
    const blue = blueEntries.sort()[0];

    newData.data[i] = red;
    newData.data[i + 1] = green;
    newData.data[i + 2] = blue;
    newData.data[i + 3] = 255;
  }
  return newData;
};
const addup = (imageData, matrix) => {
  const { data, width, height } = imageData;
  const halfSize = Math.floor(matrix.length / 2);
  const newData = createImageData(width, height);
  for (let i = 0; i < data.length; i += 4) {
    const x = Math.floor(i / 4) % width;
    const y =  Math.floor(Math.floor(i / 4) / width);
    const redEntries = [];
    const greenEntries = [];
    const blueEntries = [];
    const alphaEntries = [];


    const startValueX = x - halfSize < 0 ? 0 : x - halfSize;
    for (let mx = startValueX; mx < x + halfSize && mx < width; mx++) {
      const startValueY = y - halfSize < 0 ? 0 : y - halfSize;
      for (let my = startValueY; my < y + halfSize && my < height; my++) {
        const startI = ((my * width) + mx) * 4;

        const matrixX = mx - x + halfSize < 0 ? 0 : mx - x + halfSize;
        const matrixY = my - y + halfSize < 0 ? 0 : my - y + halfSize;
        if (matrix[matrixX][matrixY]) {
          redEntries.push(data[startI]);
          greenEntries.push(data[startI + 1]);
          blueEntries.push(data[startI + 2]);
          alphaEntries.push(data[startI + 3])
        }
      }
    }

    const red = redEntries.sort()[redEntries.length - 1];
    const green = greenEntries.sort()[greenEntries.length - 1];
    const blue = blueEntries.sort()[blueEntries.length - 1];

    newData.data[i] = red;
    newData.data[i + 1] = green;
    newData.data[i + 2] = blue;
    newData.data[i + 3] = 255;
  }
  return newData;
};
