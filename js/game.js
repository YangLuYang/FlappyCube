'use strict';
if(typeof(webExtensionWallet) === "undefined"){
    alert ("Extension wallet is not installed, please install it first.")
}else{
    alert("Extension wallet is installed")
}
var score = 0;
var heightObj = {};
var worldScore = 0;
var worldScoreAddr = "";
var worldScoreTime = "";
var NebPay = require("nebpay");     //https://github.com/nebulasio/nebPay
var nebPay = new NebPay();
$(function () {
    const to = "n1pkoCryWscT42vgDH1gfigAQWNYbjr8Noq";
    var value = 0;
    var callFunction = "getWR";
    var args = "[]";
    nebPay.simulateCall(to, value, callFunction, args, {
        callback: "https://pay.nebulas.io/api/mainnet/pay",
        listener: function (resp) {
            try{
                console.info('callback resp: '+resp);
                var record = JSON.parse(resp.result);
                if(record !== "null"){
                    worldScore = parseInt(record.score);
                    worldScoreAddr = record.address;
                    worldScoreTime = new Date(record.timestamp);
                    $('.top').text("TOP SCORE: "+worldScore);
                }
            }catch (e){
                console.log(e)
            }


        }
    });
})
$('.upload').click(function () {
    const to = "n1pkoCryWscT42vgDH1gfigAQWNYbjr8Noq";
    var to = to;
    var value = 0;
    var callFunction = "setR";
    var callArgs = "["+score+"]";
    nebPay.call(to, value, callFunction, callArgs,{
        listener: function (resp) {
            try{
                if(resp.txhash.toString().length>0){
                    alert("upload success");
                    return;
                }
                if(resp.startsWith("Error")){
                    alert("upload failed");
                    return;
                }
            }catch (e){
                alert("upload failed")
            }

        }
    })
});
$('.top').click(function () {
    alert("WroldRecordHolder: \n"+worldScoreAddr+"\nWorldRecordTime: \n"+worldScoreTime);

});



function createPipeHeight() {
  var upperPipeHeight = Math.floor(Math.random() * 3) + 1;
  var lowerPipeHeight = 4.9 - upperPipeHeight;

  return {
    upper: upperPipeHeight * 100,
    lower: lowerPipeHeight * 100
  };
}

function createPipeHtml(pipeHeight, i) {
  var upperPipeHtml = '<div class=pipe-'+ i  + ' style="height: ' + pipeHeight.upper + 'px; width: 50px"></div>';

  var lowerPipeHtml = '<div style="height: ' + pipeHeight.lower + 'px; width: 50px"></div>';

  heightObj[i] = pipeHeight.upper;

  var pipeHtml = '<div class="pipe">' + upperPipeHtml + lowerPipeHtml + '</div>';

  return pipeHtml;
}

function createPipes(n) {

  var pipesHtml = []

  for (var i = 0; i < n; i++) {
    pipesHtml.push(createPipeHtml(createPipeHeight(), i))
  }

  return pipesHtml;
}

$('.pipes').html(createPipes(50));


var initialState = {
  bird: {
    posY: 0,
    bottomY : 30,
    posX : 165,
    velocity: 2,
    directionTimeout: undefined
  },
  pipes: {
    posX: 300,
    velocity: -1
  },
  nextPipe : {
    value : 0,
    leftX : 0,
    rightX : 0,
    topPipeY : 0,
    bottomPipeY : 0
  },
  end: false,
  gameInterval: undefined
};

var state = JSON.parse(JSON.stringify(initialState));

function gameStart() {
  var frame = $('.frames');
  var i = 0;

  function renderLoop() {
    frame.text(i);
    i += 1;


    if (state.bird.posY === 570 || state.bird.posY < -30 || state.end) {
      return gameEnd();
    }

    movePipesPlane();

    moveBird();

    nextPipePos();

    collisionCheck();

    checkStop();
  }

  state.gameInterval = setInterval(renderLoop, 16);
}

function moveBird() {
  state.bird.posY += state.bird.velocity;
  state.bird.bottomY += state.bird.velocity;

  $('.bird').css({ transform: 'translate(35px, ' + state.bird.posY + 'px)' });
}

function movePipesPlane() {
  state.pipes.posX += state.pipes.velocity;

  $('.pipes').css({ transform: 'translateX(' + state.pipes.posX + 'px)' });
}


function nextPipePos() {

  var leftPad = 100;
  var baseLength = state.pipes.posX + leftPad;
  var value = state.nextPipe.value;
  var pipeWidth = 50;
  var nextPipe = state.nextPipe;
  var nextPipeHeight = heightObj[value];
  //var topPipe = $('.pipe-' + value);
  var pipeGap = 110;
  var spaceBetweenPipes = 200;

  //console.log(nextPipeHeight);

  if(value > 0){
    nextPipe.leftX = baseLength + (pipeWidth + spaceBetweenPipes) * value;
  } else {
    nextPipe.leftX = baseLength;
  }
  //console.log(state.bird.bottomY, state.nextPipe.value, state.nextPipe.bottomPipeY);
  nextPipe.rightX = nextPipe.leftX + pipeWidth;
  nextPipe.topPipeY = nextPipeHeight;
  nextPipe.bottomPipeY = nextPipeHeight + pipeGap;
}

function collisionCheck() {
  var bird = state.bird;
  var nextPipe = state.nextPipe;

  if (bird.posX >= nextPipe.leftX) {
    //console.log("X Meet");
    if (bird.posY <= nextPipe.topPipeY || bird.bottomY >= nextPipe.bottomPipeY) {
      // console.log("birdPosX : " + bird.posX, "pipeLeftX : " + nextPipe.leftX,   "birdPosY : " + bird.posY, "topPipeY : " + nextPipe.topPipeY,
      // "birdPosBottomY : " + bird.bottomY, "bottomPipeY : " + nextPipe.bottomPipeY);
      // console.log(document.querySelector(".pipe-" + state.nextPipe.value).getBoundingClientRect())
      gameEnd();
      state.end = true;
    }
    if (bird.posX - 30 > nextPipe.rightX) {
      score = state.nextPipe.value + 1;
      $(".score").text(score);
      updatePipe();
      //nextPipePos();
    }
  }
}

function updatePipe() {
  state.nextPipe.value += 1;
}

$(".start").click(function () {
    $(".start").css("display", "none");
    $(".upload").css("display","none");
    $(".top").css("display","none");

  if (state.end) {
      restartGame();
  } else {
      gameStart();
  }
});

function gameEnd() {
  $(".gameZone").css("opacity", 0.3);
  $(".start").text("RESTART");
  $(".start").css("display", "inline-flex");
  $(".upload").css("display", "inline-flex");
  $(".top").css("display","inline-flex");


    clearInterval(state.gameInterval);
  state.gameInterval = undefined;

  return;
}

function checkStop() {
  $('.stop').click(function () {
    state.end = true;
  });
}

$('.gameZone').click(function () {

  if (state.bird.directionTimeout) {
    clearTimeout(state.bird.directionTimeout);
    state.bird.directionTimeout = undefined;
  }

  state.bird.velocity = -3;

  state.bird.directionTimeout = setTimeout(function () {
    state.bird.velocity = 2;
  }, 300);
});

function restartGame() {
  state = JSON.parse(JSON.stringify(initialState));


  $(".gameZone").css("opacity", 1);
  $(".bird").css({transform : "translateY(0)"});
  $('.pipes').css({ transform: 'translateX(300px)' });

  score = 0;
  $(".score").text(score);

  gameStart();
}



