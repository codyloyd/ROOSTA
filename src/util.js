const random = function (x, y) {
  return Math.floor(Math.random() * (y - x)) + x;
};

const randomFromArray = function (array) {
  return array[Math.floor(Math.random() * array.length)];
};
export { random, randomFromArray };
