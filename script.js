const barsContainer = document.getElementById('barsContainer');
const sizeRange = document.getElementById('sizeRange');
const speedRange = document.getElementById('speedRange');
const sizeLabel = document.getElementById('sizeLabel');
const speedLabel = document.getElementById('speedLabel');
const generateBtn = document.getElementById('generateBtn');
const startBtn = document.getElementById('startBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const resetBtn = document.getElementById('resetBtn');
const algoSelect = document.getElementById('algoSelect');

let array = [];
let isSorting = false;
let barElements = [];
let currentAlgorithm = algoSelect.value;

function speedToDelay(speed) {
  const max = 500;
  const min = 6;
  const val = Math.round(max - (speed / 100) * (max - min));
  return Math.max(min, val);
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function createArray(size) {
  const arr = [];
  for (let i = 0; i < size; i++) {
    const base = Math.floor(Math.random() * 90) + 10;
    const bump = Math.random() < 0.12 ? Math.floor(Math.random() * 120) : 0;
    arr.push(base + bump);
  }
  return arr;
}

function renderArray(arr) {
  barsContainer.innerHTML = '';
  barElements = [];
  const size = arr.length;
  let barWidth = Math.floor((barsContainer.clientWidth - (size - 1) * 6) / size);
  if (barWidth < 6) barWidth = 6;
  for (let i = 0; i < size; i++) {
    const val = arr[i];
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${val * 1.6}px`;
    bar.style.width = `${barWidth}px`;
    const lbl = document.createElement('div');
    lbl.className = 'val';
    lbl.textContent = val;
    bar.appendChild(lbl);
    barsContainer.appendChild(bar);
    barElements.push(bar);
  }
}

function markBars(indexes, cls) {
  if (!Array.isArray(indexes)) indexes = [indexes];
  for (let i = 0; i < barElements.length; i++) {
    const b = barElements[i];
    if (indexes.indexOf(i) !== -1) {
      b.classList.add(cls);
    } else {
      if (cls !== 'sorted') b.classList.remove(cls);
    }
  }
}

function swap(arr, i, j) {
  const tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
  const bi = barElements[i];
  const bj = barElements[j];
  const htmp = bi.style.height;
  bi.style.height = bj.style.height;
  bj.style.height = htmp;
  const lbli = bi.querySelector('.val');
  const lblj = bj.querySelector('.val');
  if (lbli && lblj) {
    const t = lbli.textContent;
    lbli.textContent = lblj.textContent;
    lblj.textContent = t;
  }
}

async function bubbleSortVisual(arr) {
  const n = arr.length;
  let swapped;
  do {
    swapped = false;
    for (let i = 0; i < n - 1; i++) {
      markBars([i, i + 1], 'comparing');
      await sleep(speedToDelay(speedRange.value));
      if (arr[i] > arr[i + 1]) {
        markBars([i, i + 1], 'current');
        await sleep(20);
        swap(arr, i, i + 1);
        swapped = true;
        await sleep(speedToDelay(speedRange.value));
      }
      markBars([i, i + 1], 'comparing');
    }
  } while (swapped);
  for (let k = 0; k < n; k++) {
    barElements[k].classList.add('sorted');
    await sleep(8);
  }
}

async function selectionSortVisual(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;
    barElements[minIndex].classList.add('current');
    for (let j = i + 1; j < n; j++) {
      markBars([minIndex, j], 'comparing');
      await sleep(speedToDelay(speedRange.value));
      if (arr[j] < arr[minIndex]) {
        barElements[minIndex].classList.remove('current');
        minIndex = j;
        barElements[minIndex].classList.add('current');
      }
      markBars([minIndex, j], 'comparing');
    }
    if (minIndex !== i) {
      await sleep(30);
      swap(arr, i, minIndex);
    }
    barElements[i].classList.add('sorted');
    barElements[minIndex].classList.remove('current');
  }
  if (barElements.length > 0) {
    barElements[barElements.length - 1].classList.add('sorted');
  }
}

async function insertionSortVisual(arr) {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    markBars(i, 'current');
    await sleep(speedToDelay(speedRange.value));
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      barElements[j + 1].style.height = barElements[j].style.height;
      barElements[j + 1].querySelector('.val').textContent = barElements[j].querySelector('.val').textContent;
      markBars([j, j + 1], 'comparing');
      await sleep(speedToDelay(speedRange.value) / 1.5);
      j--;
    }
    arr[j + 1] = key;
    barElements[j + 1].style.height = `${key * 2}px`;
    barElements[j + 1].querySelector('.val').textContent = key;
    markBars(i, 'current');
    await sleep(18);
  }
  for (let k = 0; k < n; k++) {
    barElements[k].classList.add('sorted');
    await sleep(4);
  }
}

async function mergeSortVisual(arr) {
  async function mergeSortHelper(l, r) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    await mergeSortHelper(l, m);
    await mergeSortHelper(m + 1, r);
    await merge(l, m, r);
  }
  async function merge(l, m, r) {
    const left = [];
    const right = [];
    for (let i = l; i <= m; i++) left.push(arr[i]);
    for (let j = m + 1; j <= r; j++) right.push(arr[j]);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      markBars(k, 'current');
      await sleep(speedToDelay(speedRange.value));
      if (left[i] <= right[j]) {
        arr[k] = left[i];
        barElements[k].style.height = `${left[i] * 2}px`;
        barElements[k].querySelector('.val').textContent = left[i];
        i++;
      } else {
        arr[k] = right[j];
        barElements[k].style.height = `${right[j] * 2}px`;
        barElements[k].querySelector('.val').textContent = right[j];
        j++;
      }
      k++;
      await sleep(12);
    }
    while (i < left.length) {
      arr[k] = left[i];
      barElements[k].style.height = `${left[i] * 2}px`;
      barElements[k].querySelector('.val').textContent = left[i];
      i++; k++;
      await sleep(10);
    }
    while (j < right.length) {
      arr[k] = right[j];
      barElements[k].style.height = `${right[j] * 2}px`;
      barElements[k].querySelector('.val').textContent = right[j];
      j++; k++;
      await sleep(10);
    }
    for (let p = l; p <= r; p++) {
      barElements[p].classList.add('sorted');
    }
    await sleep(20);
    for (let p = l; p <= r; p++) {
      barElements[p].classList.remove('sorted');
    }
  }
  await mergeSortHelper(0, arr.length - 1);
  for (let z = 0; z < arr.length; z++) {
    barElements[z].classList.add('sorted');
    await sleep(3);
  }
}

async function quickSortVisual(arr) {
  async function partition(low, high) {
    let pivot = arr[high];
    let i = low - 1;
    barElements[high].classList.add('current');
    for (let j = low; j < high; j++) {
      markBars([j, high], 'comparing');
      await sleep(speedToDelay(speedRange.value));
      if (arr[j] < pivot) {
        i++;
        swap(arr, i, j);
        await sleep(12);
      }
      markBars([j, high], 'comparing');
    }
    swap(arr, i + 1, high);
    barElements[high].classList.remove('current');
    return i + 1;
  }
  async function quickHelper(low, high) {
    if (low < high) {
      const p = await partition(low, high);
      barElements[p].classList.add('sorted');
      await quickHelper(low, p - 1);
      await quickHelper(p + 1, high);
    } else {
      if (low >= 0 && high >= 0 && low < barElements.length) {
        barElements[low].classList.add('sorted');
      }
    }
  }
  await quickHelper(0, arr.length - 1);
  for (let i = 0; i < arr.length; i++) {
    barElements[i].classList.add('sorted');
    await sleep(2);
  }
}

function disableControls(state) {
  sizeRange.disabled = state;
  speedRange.disabled = state;
  generateBtn.disabled = state;
  algoSelect.disabled = state;
  shuffleBtn.disabled = state;
  resetBtn.disabled = state;
}

function enableControls() {
  disableControls(false);
}

generateBtn.addEventListener('click', () => {
  array = createArray(sizeRange.value);
  renderArray(array);
});

startBtn.addEventListener('click', async () => {
  if (isSorting) return;
  isSorting = true;
  disableControls(true);
  if (currentAlgorithm === 'bubble') await bubbleSortVisual(array);
  if (currentAlgorithm === 'selection') await selectionSortVisual(array);
  if (currentAlgorithm === 'insertion') await insertionSortVisual(array);
  if (currentAlgorithm === 'merge') await mergeSortVisual(array);
  if (currentAlgorithm === 'quick') await quickSortVisual(array);
  isSorting = false;
  enableControls();
});

shuffleBtn.addEventListener('click', () => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    swap(array, i, j);
  }
});

resetBtn.addEventListener('click', () => {
  renderArray(array);
});

sizeRange.addEventListener('input', () => {
  sizeLabel.textContent = sizeRange.value;
});

speedRange.addEventListener('input', () => {
  speedLabel.textContent = speedRange.value;
});

algoSelect.addEventListener('change', () => {
  currentAlgorithm = algoSelect.value;
});

window.addEventListener('load', () => {
  array = createArray(sizeRange.value);
  renderArray(array);
  sizeLabel.textContent = sizeRange.value;
  speedLabel.textContent = speedRange.value;
});
