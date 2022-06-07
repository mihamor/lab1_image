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
