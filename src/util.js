const random = function (x, y) {
  return Math.floor(Math.random() * (y - x)) + x;
};

const randomFromArray = function (array) {
  return array[Math.floor(Math.random() * array.length)];
};

const shuffleArray = function (arr) {
  let temp;
  let r;
  for (let i = 1; i < arr.length; i++) {
    r = random(0, i);
    temp = arr[i];
    arr[i] = arr[r];
    arr[r] = temp;
  }
  return arr;
};

function tryTo(description, callback) {
  for (let timeout = 1000; timeout > 0; timeout--) {
    if (callback()) {
      return;
    }
  }
  throw `Timeout while trying to ${description}`;
}

export { tryTo, random, randomFromArray, shuffleArray };
