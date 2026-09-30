let video;

let faceMesh;
let faceOptions = {
  maxFaces: 1,
  refineLandmarks: false,
  flipped: false
};
let faces = [];

let handPose;
let hands = [];

// GAME VARIABLES
let gameState = "waiting";

let countdownText = "";

let player1Choice = "";
let player2Choice = "";

let player1Score = 0;
let player2Score = 0;

let roundWinner = "";


// -------------------------------------
// SETUP
// -------------------------------------

async function setup() {

  createCanvas(640, 480);

  // CAMERA
  video = createCapture(VIDEO);

  video.size(640, 480);

  video.hide();


  // FACE TRACKING
  faceMesh = await ml5.faceMesh(faceOptions);

  faceMesh.detectStart(
    video,
    (results) => {
      faces = results;
    }
  );


  // HAND TRACKING
  handPose = await ml5.handPose();

  handPose.detectStart(
    video,
    (results) => {
      hands = results;
    }
  );
}


// -------------------------------------
// DRAW
// -------------------------------------

function draw() {

  background(220);

  // CAMERA
  image(video, 0, 0);


  // CENTER LINE
  stroke(255);
  strokeWeight(3);

  line(
    width / 2,
    0,
    width / 2,
    height
  );


  // PLAYER LABELS
  noStroke();

  fill(255);

  textAlign(CENTER);

  textSize(20);

  text(
    "PLAYER 1",
    width / 4,
    30
  );

  text(
    "PLAYER 2",
    width * 0.75,
    30
  );


  // DRAW HAND POINTS
  drawHands();


  // SHOW LIVE GESTURES
  showGestures();


  // WAITING SCREEN
  if (gameState === "waiting") {

    drawStartButton();

  }


  // COUNTDOWN
  if (gameState === "countdown") {

    drawCountdown();

  }


  // RESULT
  if (gameState === "result") {

    drawResult();

  }
}


// -------------------------------------
// DRAW HAND TRACKING
// -------------------------------------

function drawHands() {

  if (hands.length > 0) {

    for (let hand of hands) {

      for (let keypoint of hand.keypoints) {

        fill(255, 0, 0);

        noStroke();

        circle(
          keypoint.x,
          keypoint.y,
          8
        );
      }
    }
  }
}


// -------------------------------------
// FIND PLAYER 1 AND PLAYER 2 HAND
// -------------------------------------

function getPlayerHands() {

  let player1Hand = null;

  let player2Hand = null;


  for (let hand of hands) {

    // Wrist
    let wrist = hand.keypoints[0];


    // LEFT SIDE OF CAMERA
    if (wrist.x < width / 2) {

      player1Hand = hand;

    }

    // RIGHT SIDE OF CAMERA
    else {

      player2Hand = hand;

    }
  }


  return {
    player1Hand,
    player2Hand
  };
}


// -------------------------------------
// DISTANCE BETWEEN TWO POINTS
// -------------------------------------

function pointDistance(point1, point2) {

  return dist(
    point1.x,
    point1.y,
    point2.x,
    point2.y
  );
}


// -------------------------------------
// DETECT ROCK / PAPER / SCISSORS
// -------------------------------------

function getGesture(hand) {

  if (!hand) {

    return "";

  }


  let p = hand.keypoints;


  // WRIST
  let wrist = p[0];


  // BASE OF EACH FINGER

  let indexBase = p[5];

  let middleBase = p[9];

  let ringBase = p[13];

  let pinkyBase = p[17];


  // FINGER TIPS

  let indexTip = p[8];

  let middleTip = p[12];

  let ringTip = p[16];

  let pinkyTip = p[20];


  /*
    Compare each fingertip's distance from the wrist
    to the finger base's distance from the wrist.

    This works better than just checking Y position
    because the hand can be tilted.
  */


  let indexExtended =
    pointDistance(indexTip, wrist) >
    pointDistance(indexBase, wrist) * 1.35;


  let middleExtended =
    pointDistance(middleTip, wrist) >
    pointDistance(middleBase, wrist) * 1.35;


  let ringExtended =
    pointDistance(ringTip, wrist) >
    pointDistance(ringBase, wrist) * 1.35;


  let pinkyExtended =
    pointDistance(pinkyTip, wrist) >
    pointDistance(pinkyBase, wrist) * 1.30;



  // ---------------------------------
  // SCISSORS ✌
  // ---------------------------------

  if (
    indexExtended &&
    middleExtended &&
    !ringExtended &&
    !pinkyExtended
  ) {

    return "Scissors";

  }


  // ---------------------------------
  // PAPER ✋
  // ---------------------------------

  if (
    indexExtended &&
    middleExtended &&
    ringExtended &&
    pinkyExtended
  ) {

    return "Paper";

  }


  // ---------------------------------
  // ROCK ✊
  // ---------------------------------

  if (
    !indexExtended &&
    !middleExtended &&
    !ringExtended &&
    !pinkyExtended
  ) {

    return "Rock";

  }


  // HAND IS BETWEEN GESTURES
  return "";
}


// -------------------------------------
// SHOW CURRENT GESTURES
// -------------------------------------

function showGestures() {

  let playerHands = getPlayerHands();


  let p1Gesture =
    getGesture(playerHands.player1Hand);


  let p2Gesture =
    getGesture(playerHands.player2Hand);


  // PLAYER 1 BOX

  fill(255, 240);

  stroke(0);

  strokeWeight(2);

  rect(
    20,
    height - 60,
    170,
    40,
    8
  );


  // PLAYER 2 BOX

  rect(
    width - 190,
    height - 60,
    170,
    40,
    8
  );


  noStroke();

  fill(0);

  textAlign(CENTER, CENTER);

  textSize(17);


  text(
    p1Gesture || "Show Hand",
    105,
    height - 40
  );


  text(
    p2Gesture || "Show Hand",
    width - 105,
    height - 40
  );
}


// -------------------------------------
// START BUTTON
// -------------------------------------

function drawStartButton() {

  fill(255, 240);

  stroke(0);

  strokeWeight(4);

  rectMode(CENTER);

  rect(
    width / 2,
    height / 2,
    200,
    80,
    15
  );


  noStroke();

  fill(0);

  textAlign(CENTER, CENTER);

  textSize(28);

  text(
    "START GAME",
    width / 2,
    height / 2
  );


  rectMode(CORNER);


  // SCORE

  fill(255);

  textSize(18);

  textAlign(CENTER);

  text(
    "Player 1: " +
    player1Score +
    "     Player 2: " +
    player2Score,
    width / 2,
    65
  );
}


// -------------------------------------
// CLICK
// -------------------------------------

function mousePressed() {

  if (gameState === "waiting") {

    startRound();

  }

  else if (gameState === "result") {

    startRound();

  }
}


// -------------------------------------
// START ROUND
// -------------------------------------

function startRound() {

  gameState = "countdown";

  player1Choice = "";

  player2Choice = "";

  roundWinner = "";


  countdownText = "ROCK";


  setTimeout(function() {

    countdownText = "PAPER";

  }, 700);


  setTimeout(function() {

    countdownText = "SCISSORS";

  }, 1400);


  setTimeout(function() {

    countdownText = "SHOOT!";

  }, 2100);


  setTimeout(function() {

    detectRound();

  }, 2700);
}


// -------------------------------------
// COUNTDOWN
// -------------------------------------

function drawCountdown() {

  fill(255, 245);

  stroke(0);

  strokeWeight(5);

  rectMode(CENTER);


  rect(
    width / 2,
    height / 2,
    300,
    100,
    15
  );


  noStroke();

  fill(0);

  textAlign(CENTER, CENTER);

  textSize(45);


  text(
    countdownText,
    width / 2,
    height / 2
  );


  rectMode(CORNER);
}


// -------------------------------------
// CHECK WINNER
// -------------------------------------

function detectRound() {

  let playerHands = getPlayerHands();


  player1Choice =
    getGesture(playerHands.player1Hand);


  player2Choice =
    getGesture(playerHands.player2Hand);



  // COULD NOT READ HANDS

  if (
    player1Choice === "" ||
    player2Choice === ""
  ) {

    roundWinner =
      "Couldn't read both hands";

    gameState = "result";

    return;
  }



  // TIE

  if (
    player1Choice === player2Choice
  ) {

    roundWinner = "TIE!";

  }



  // PLAYER 1 WINS

  else if (

    (
      player1Choice === "Rock" &&
      player2Choice === "Scissors"
    )

    ||

    (
      player1Choice === "Paper" &&
      player2Choice === "Rock"
    )

    ||

    (
      player1Choice === "Scissors" &&
      player2Choice === "Paper"
    )

  ) {

    roundWinner =
      "PLAYER 1 WINS!";

    player1Score++;

  }



  // PLAYER 2 WINS

  else {

    roundWinner =
      "PLAYER 2 WINS!";

    player2Score++;

  }


  gameState = "result";
}


// -------------------------------------
// RESULT SCREEN
// -------------------------------------

function drawResult() {

  fill(255, 245);

  stroke(0);

  strokeWeight(5);

  rectMode(CENTER);


  rect(
    width / 2,
    height / 2,
    430,
    200,
    15
  );


  noStroke();

  fill(0);

  textAlign(CENTER, CENTER);


  // WINNER

  textSize(32);

  text(
    roundWinner,
    width / 2,
    height / 2 - 55
  );


  // CHOICES

  textSize(20);

  text(
    "P1: " +
    player1Choice +
    "     |     P2: " +
    player2Choice,
    width / 2,
    height / 2
  );


  // SCORE

  textSize(26);

  text(
    player1Score +
    "  -  " +
    player2Score,
    width / 2,
    height / 2 + 45
  );


  // NEXT ROUND

  textSize(14);

  text(
    "Click anywhere for next round",
    width / 2,
    height / 2 + 78
  );


  rectMode(CORNER);
}