function createMat(ROWS, COLS) {
  var mat = []
  for (var i = 0; i < ROWS; i++) {
      var row = []
      for (var j = 0; j < COLS; j++) {
          row.push({minesAroundCount: 4, isShown: true, isMine: false, isMarked: true})
      }
      mat.push(row)
  }
  return mat
}


function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}


