let video;

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

// Used while reading hands after SHOOT
let p1Samples = [];
let p2Samples = [];
let sampleInterval;


// -------------------------------------
// SETUP
// -------------------------------------

async function setup() {

  createCanvas(640, 480);

  // CAMERA
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();


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


  // =====================================
  // MIRRORED / INVERTED CAMERA
  // =====================================

  push();

  translate(width, 0);
  scale(-1, 1);

  image(
    video,
    0,
    0,
    width,
    height
  );

  pop();


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


  // HAND TRACKING DOTS
  drawHands();


  // LIVE GESTURES
  showGestures();


  // START SCREEN
  if (gameState === "waiting") {

    drawStartButton();

  }


  // COUNTDOWN
  if (gameState === "countdown") {

    drawCountdown();

  }


  // READING HANDS
  if (gameState === "reading") {

    drawReading();

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

        /*
          IMPORTANT:

          The camera image is mirrored,
          so the hand tracking X coordinate
          must ALSO be mirrored.
        */

        let mirroredX =
          width - keypoint.x;


        fill(255, 0, 0);

        noStroke();

        circle(
          mirroredX,
          keypoint.y,
          8
        );
      }
    }
  }
}


// -------------------------------------
// FIND PLAYER HANDS
// -------------------------------------

function getPlayerHands() {

  let player1Hand = null;
  let player2Hand = null;


  for (let hand of hands) {

    let wrist =
      hand.keypoints[0];


    // Mirror the hand position
    let mirroredX =
      width - wrist.x;


    // PLAYER 1 = LEFT SIDE
    if (mirroredX < width / 2) {

      player1Hand = hand;

    }

    // PLAYER 2 = RIGHT SIDE
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
// DISTANCE
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
// ROCK / PAPER / SCISSORS DETECTION
// -------------------------------------

function getGesture(hand) {

  if (!hand) {

    return "";

  }


  let p = hand.keypoints;


  // WRIST
  let wrist = p[0];


  // FINGER BASES
  let indexBase = p[5];
  let middleBase = p[9];
  let ringBase = p[13];
  let pinkyBase = p[17];


  // FINGER TIPS
  let indexTip = p[8];
  let middleTip = p[12];
  let ringTip = p[16];
  let pinkyTip = p[20];


  // CHECK IF FINGERS ARE EXTENDED

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



  // =====================================
  // SCISSORS
  // =====================================

  if (
    indexExtended &&
    middleExtended &&
    !ringExtended &&
    !pinkyExtended
  ) {

    return "Scissors";

  }


  // =====================================
  // PAPER
  // =====================================

  if (
    indexExtended &&
    middleExtended &&
    ringExtended &&
    pinkyExtended
  ) {

    return "Paper";

  }


  // =====================================
  // ROCK
  // =====================================

  if (
    !indexExtended &&
    !middleExtended &&
    !ringExtended &&
    !pinkyExtended
  ) {

    return "Rock";

  }


  return "";
}


// -------------------------------------
// SHOW LIVE GESTURES
// -------------------------------------

function showGestures() {

  let playerHands =
    getPlayerHands();


  let p1Gesture =
    getGesture(
      playerHands.player1Hand
    );


  let p2Gesture =
    getGesture(
      playerHands.player2Hand
    );


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
    220,
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

  if (
    gameState === "waiting" ||
    gameState === "result"
  ) {

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

  p1Samples = [];
  p2Samples = [];


  // ROCK
  countdownText = "ROCK";


  // =====================================
  // PAPER - 4.5 SECONDS
  // =====================================

  setTimeout(function() {

    countdownText = "PAPER";

  }, 4500);


  // =====================================
  // SCISSORS - 9 SECONDS
  // =====================================

  setTimeout(function() {

    countdownText = "SCISSORS";

  }, 9000);


  // =====================================
  // SHOOT - 13.5 SECONDS
  // =====================================

  setTimeout(function() {

    countdownText = "SHOOT!";

  }, 13500);


  // =====================================
  // START READING HANDS
  //
  // SHOOT stays up for 1 second first.
  // Then we start sampling.
  // =====================================

  setTimeout(function() {

    startReadingHands();

  }, 14500);
}


// -------------------------------------
// COUNTDOWN DISPLAY
// -------------------------------------

function drawCountdown() {

  fill(255, 245);

  stroke(0);
  strokeWeight(5);

  rectMode(CENTER);


  rect(
    width / 2,
    height / 2,
    380,
    150,
    15
  );


  noStroke();

  textAlign(CENTER, CENTER);


  // SHOOT IS RED
  if (countdownText === "SHOOT!") {

    fill(255, 0, 0);

    textSize(75);

  }

  else {

    fill(0);

    textSize(52);

  }


  text(
    countdownText,
    width / 2,
    height / 2
  );


  rectMode(CORNER);
}


// -------------------------------------
// START READING HANDS
// -------------------------------------

function startReadingHands() {

  gameState = "reading";

  p1Samples = [];
  p2Samples = [];


  /*
    Check the players' hands every
    100 milliseconds.

    Instead of relying on ONE frame,
    we collect lots of readings.
  */

  sampleInterval =
    setInterval(function() {

      sampleHands();

    }, 100);


  /*
    Give the camera FOUR FULL SECONDS
    to identify both gestures.
  */

  setTimeout(function() {

    clearInterval(sampleInterval);

    finishReadingHands();

  }, 4000);
}


// -------------------------------------
// SAMPLE HANDS
// -------------------------------------

function sampleHands() {

  let playerHands =
    getPlayerHands();


  let p1Gesture =
    getGesture(
      playerHands.player1Hand
    );


  let p2Gesture =
    getGesture(
      playerHands.player2Hand
    );


  // Only save valid gestures

  if (p1Gesture !== "") {

    p1Samples.push(p1Gesture);

  }


  if (p2Gesture !== "") {

    p2Samples.push(p2Gesture);

  }
}


// -------------------------------------
// READING SCREEN
// -------------------------------------

function drawReading() {

  fill(255, 245);

  stroke(0);
  strokeWeight(5);

  rectMode(CENTER);


  rect(
    width / 2,
    height / 2,
    390,
    150,
    15
  );


  noStroke();

  fill(255, 0, 0);

  textAlign(CENTER, CENTER);

  textSize(42);


  text(
    "HOLD!",
    width / 2,
    height / 2 - 20
  );


  fill(0);

  textSize(18);


  text(
    "Reading your hands...",
    width / 2,
    height / 2 + 30
  );


  rectMode(CORNER);
}


// -------------------------------------
// FIND MOST COMMON GESTURE
// -------------------------------------

function mostCommonGesture(samples) {

  if (samples.length === 0) {

    return "";

  }


  let rockCount = 0;
  let paperCount = 0;
  let scissorsCount = 0;


  for (let gesture of samples) {

    if (gesture === "Rock") {

      rockCount++;

    }


    if (gesture === "Paper") {

      paperCount++;

    }


    if (gesture === "Scissors") {

      scissorsCount++;

    }
  }


  if (
    rockCount >= paperCount &&
    rockCount >= scissorsCount
  ) {

    return "Rock";

  }


  if (
    paperCount >= rockCount &&
    paperCount >= scissorsCount
  ) {

    return "Paper";

  }


  return "Scissors";
}


// -------------------------------------
// FINISH READING HANDS
// -------------------------------------

function finishReadingHands() {

  player1Choice =
    mostCommonGesture(p1Samples);


  player2Choice =
    mostCommonGesture(p2Samples);


  determineWinner();
}


// -------------------------------------
// DETERMINE WINNER
// -------------------------------------

function determineWinner() {

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


  // PLAYER CHOICES
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