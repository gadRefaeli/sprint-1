`use strict`


const Flag = '🚩';
const BOOM = '💣';
var gBoard;
var gameLives=1;
var gLevel = { SIZE: 4, MINES: 2 };
var gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 };
var lives;
var firstClick;
var firstClickIndexes={i:0,j:0};
var intervalTimer;
var startTime;

function initGame() {
  clearInterval(intervalTimer);
  lives=gameLives;
  gBoard = buildBoard()
  renderBoard(gBoard)
  gGame.isOn = true
  gGame.shownCount = 0;
  gGame.markedCount = 0;
  firstClick = true;
  document.querySelector('h4 span').innerText = gLevel.MINES;
  document.querySelector('.smile').innerText = '🙂'
  document.querySelector('h3').innerText = 'Timer: 00 : 00';
  document.querySelector('.lives').innerText = 'Lives: '+lives;
}
function buildBoard() {
  var mat = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    var row = []
    for (var j = 0; j < gLevel.SIZE; j++) {
      row.push({ minesAroundCount: NaN, isShown: false, isMine: false, isMarked: false })
    }
    mat.push(row)
  }
  for (var i = 0; i < gLevel.MINES; i++) {
    randI = getRandomInt(0, mat.length - 1);
    randJ = getRandomInt(0, mat.length - 1);
   
   //check if we have boom in same random place
    
   if (mat[randI][randJ].isMine) {
      i--;
      continue;
    }
    
    //check if we have boom in first clicked place
    if(randI===firstClickIndexes.i&&randJ===firstClickIndexes.j){
      i--;
      continue;
    }
    mat[randI][randJ].isMine = true;
  };

  var neighborsArrey = setMinesNegsCount(mat);
  for (var index = 0; index < neighborsArrey.length; index++) {
    var iIndex = neighborsArrey[index].i;
    var jIndex = neighborsArrey[index].j;
    var negsCount = neighborsArrey[index].negsCount;
    mat[iIndex][jIndex].minesAroundCount = negsCount;
  }
  return mat
}

function renderBoard(board) {
  var strHtml = '';
  for (var i = 0; i < gLevel.SIZE; i++) {
    strHtml += '<tr>'
    for (var j = 0; j < gLevel.SIZE; j++) {
      var cell = '';
      if (board[i][j].isShown) {
        cell = (gBoard[i][j].isMine) ? BOOM : gBoard[i][j].minesAroundCount;
      }
      if (board[i][j].isMarked) {
        cell = Flag;
      }
      var cellClass = getClassName({ i: i, j: j })
      strHtml += `<td class="cell ${cellClass}"
      className ="${cell}" 
      onmousedown="cellClicked(event,${i},${j})"
          >${cell}</td>`
    }
    strHtml += '</tr>'
  }
  var elBoard = document.querySelector('.board');
  elBoard.innerHTML = strHtml
}

function setMinesNegsCount(board) {
  var noMineCells = [];
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var negsCount = countNeighbors(i, j, board);
      var currCellPos = { i, j, negsCount };
      var currCell = board[i][j];
      if (!currCell.isMine) {
        noMineCells.push(currCellPos);
      }
    }
  }
  return noMineCells;
}

function countNeighbors(cellI, cellJ, mat) {
  var neighborsCount = 0;
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= mat.length) continue;
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (i === cellI && j === cellJ) continue;
      if (j < 0 || j >= mat[i].length) continue;
      if (mat[i][j].isMine) neighborsCount++;
    }
  }
  return neighborsCount;

}

function cellClicked(event, i, j) {
  console.log(event)
  if (!gGame.isOn || gBoard[i][j].isShown) return
  document.addEventListener('contextmenu', event => event.preventDefault());
  if (firstClick) {
    startTime = Date.now();
    intervalTimer = setInterval(timer, 1000);
    firstClickIndexes.i=i;
    firstClickIndexes.j=j;
    //build a new board with no boom at first click
    gBoard=buildBoard()
    firstClick = false;
  }
  if (event.button === 0) {
    gBoard[i][j].isShown = true;
    if (!gBoard[i][j].isMine) gGame.shownCount++
    if(gBoard[i][j].minesAroundCount===0){
      openAllNeighbors(i, j,  gBoard,event)
    }
  }
  if (event.button === 2) {
    if (gBoard[i][j].isMarked) {
      gBoard[i][j].isMarked = false;
      gGame.markedCount--
    } else {
      gBoard[i][j].isMarked = true;
      gGame.markedCount++
    }
    console.log(gGame)
    var gDefuse = gLevel.MINES - gGame.markedCount;
    document.querySelector('h4 span').innerText = (gDefuse > 0) ? gDefuse : 0;
  }
  checkGameOver(gBoard,i,j)
  renderBoard(gBoard)
}

function timer() {
  var time = (Date.now() - startTime)
  gGame.secsPassed = time / 1000;
  var seconds = Math.floor(time / 1000) % 60;
  var minuts = Math.floor((time / 1000) / 60);
  if (seconds < 9) seconds = '0' + seconds;
  if (minuts < 9) minuts = '0' + minuts;
  document.querySelector('h3').innerText = 'timer: ' + minuts + ' : ' + seconds;
}

function checkGameOver(board,i,j) {
  console.log(lives)
  emptyCellsNum = gLevel.SIZE * gLevel.SIZE - gLevel.MINES;
  if (board[i][j].isShown && board[i][j].isMine) {
    if(lives!=0){
      lives--;
      document.querySelector('.lives').innerText = 'Lives: '+lives;
      return
  }
    console.log("you loos")
    gGame.isOn = false;
    showAll(gBoard)
    document.querySelector('.smile').innerText = '😭'
    clearInterval(intervalTimer);
  }
  if (gGame.markedCount === gLevel.MINES && gGame.shownCount === emptyCellsNum) {
    console.log("you win")
    gGame.isOn = false;
    document.querySelector('.smile').innerText = '🤗'
    clearInterval(intervalTimer);
  }
}

function showAll(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board.length; j++) {
      board[i][j].isShown = true
    }
  }
  renderBoard(board)
}
function changeLevel(elBtn) {
  elBtn.getAttribute("class")
  switch (elBtn.getAttribute("class")) {
    case 'Easy':
      gLevel.SIZE = 4;
      gLevel.MINES = 2;
      gameLives=1;
      document.querySelector('.board').style.fontSize='22px';
      break;
    case 'Hard':
      gLevel.SIZE = 8;
      gLevel.MINES = 12;
      gameLives=2;
      document.querySelector('.board').style.fontSize='20px';
      break;
    case 'Extreme':
      gLevel.SIZE = 12;
      gLevel.MINES = 30;
      gameLives=3;
      document.querySelector('.board').style.fontSize='15px';
  }
  initGame()
}
function restartGame() {
  initGame()
  document.querySelector('.lives').innerText = 'Lives: '+lives;
}
function openAllNeighbors(cellI, cellJ,  board,event){
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (i === cellI && j === cellJ) continue;
      if (j < 0 || j >= board[i].length) continue;
      cellClicked(event, i, j)
    }
  }
renderBoard(board);
}