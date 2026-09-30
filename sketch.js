console.log("NEW RPS VERSION LOADED");

let video;

let handPose;
let hands = [];


// -------------------------------------
// PLAYER INFORMATION
// -------------------------------------

let player1Name = "PLAYER 1";
let player2Name = "PLAYER 2";

let bet = "Just for fun!";


// -------------------------------------
// GAME VARIABLES
// -------------------------------------

let gameState = "waiting";

let countdownText = "";

let player1Choice = "";
let player2Choice = "";

let player1Score = 0;
let player2Score = 0;

let roundWinner = "";


// -------------------------------------
// HAND READING
// -------------------------------------

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
    function(results) {

      hands = results;

    }
  );
}


// -------------------------------------
// UPDATE PLAYER INFORMATION
// -------------------------------------

function updatePlayerInfo() {

  let p1Input =
    document.getElementById("player1Name").value.trim();


  let p2Input =
    document.getElementById("player2Name").value.trim();


  let betInput =
    document.getElementById("betInput").value.trim();


  if (p1Input !== "") {

    player1Name =
      p1Input.toUpperCase();

  }

  else {

    player1Name =
      "PLAYER 1";

  }


  if (p2Input !== "") {

    player2Name =
      p2Input.toUpperCase();

  }

  else {

    player2Name =
      "PLAYER 2";

  }


  if (betInput !== "") {

    bet =
      betInput;

  }

  else {

    bet =
      "Just for fun!";

  }
}


// -------------------------------------
// DRAW
// -------------------------------------

function draw() {

  background(220);


  // =====================================
  // MIRRORED CAMERA
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


  // =====================================
  // CENTER LINE
  // =====================================

  stroke(255);

  strokeWeight(3);


  line(
    width / 2,
    0,
    width / 2,
    height
  );


  // =====================================
  // PLAYER LABELS
  // =====================================

  noStroke();

  fill(255);

  textAlign(CENTER);

  textSize(20);


  text(
    player1Name,
    width / 4,
    30
  );


  text(
    player2Name,
    width * 0.75,
    30
  );


  // DRAW HAND POINTS
  drawHands();


  // SHOW CURRENT GESTURES
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


  // RESULTS
  if (gameState === "result") {

    drawResult();

  }
}


// -------------------------------------
// DRAW HAND POINTS
// -------------------------------------

function drawHands() {

  for (let hand of hands) {

    for (let keypoint of hand.keypoints) {


      // Mirror the tracking coordinates
      // to match the mirrored camera

      let invertedX =
        width - keypoint.x;


      fill(255, 0, 0);

      noStroke();


      circle(
        invertedX,
        keypoint.y,
        8
      );
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


    // Mirror hand position

    let invertedX =
      width - wrist.x;


    // LEFT SIDE = PLAYER 1

    if (invertedX < width / 2) {

      player1Hand = hand;

    }


    // RIGHT SIDE = PLAYER 2

    else {

      player2Hand = hand;

    }
  }


  return {

    player1Hand: player1Hand,

    player2Hand: player2Hand

  };
}


// -------------------------------------
// DISTANCE FUNCTION
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


  let p =
    hand.keypoints;


  let wrist =
    p[0];


  // FINGER BASES

  let indexBase =
    p[5];

  let middleBase =
    p[9];

  let ringBase =
    p[13];

  let pinkyBase =
    p[17];


  // FINGER TIPS

  let indexTip =
    p[8];

  let middleTip =
    p[12];

  let ringTip =
    p[16];

  let pinkyTip =
    p[20];


  // =====================================
  // CHECK FINGERS
  // =====================================

  let indexExtended =

    pointDistance(
      indexTip,
      wrist
    )

    >

    pointDistance(
      indexBase,
      wrist
    ) * 1.35;



  let middleExtended =

    pointDistance(
      middleTip,
      wrist
    )

    >

    pointDistance(
      middleBase,
      wrist
    ) * 1.35;



  let ringExtended =

    pointDistance(
      ringTip,
      wrist
    )

    >

    pointDistance(
      ringBase,
      wrist
    ) * 1.35;



  let pinkyExtended =

    pointDistance(
      pinkyTip,
      wrist
    )

    >

    pointDistance(
      pinkyBase,
      wrist
    ) * 1.30;


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
    player1Name +
    ": " +
    player1Score +
    "     " +
    player2Name +
    ": " +
    player2Score,
    width / 2,
    65
  );


  // WHAT'S ON THE LINE

  textSize(15);


  text(
    "On the line: " + bet,
    width / 2,
    90
  );
}


// -------------------------------------
// MOUSE CLICK
// -------------------------------------

function mousePressed() {

  if (
    gameState === "waiting" ||
    gameState === "result"
  ) {

    updatePlayerInfo();

    startRound();

  }
}


// -------------------------------------
// START ROUND
// -------------------------------------

function startRound() {

  console.log("NEW COUNTDOWN STARTED");


  gameState =
    "countdown";


  player1Choice = "";

  player2Choice = "";

  roundWinner = "";


  p1Samples = [];

  p2Samples = [];


  // =====================================
  // ROCK
  // =====================================

  countdownText =
    "ROCK";


  // =====================================
  // PAPER AFTER 1.25 SECONDS
  // =====================================

  setTimeout(function() {

    countdownText =
      "PAPER";

  }, 1250);


  // =====================================
  // SCISSORS AFTER 2.5 SECONDS
  // =====================================

  setTimeout(function() {

    countdownText =
      "SCISSORS";

  }, 2500);


  // =====================================
  // SHOOT AFTER 3.75 SECONDS
  // =====================================

  setTimeout(function() {

    countdownText =
      "SHOOT!";

  }, 3750);


  // =====================================
  // START READING AT 4.4 SECONDS
  // =====================================

  setTimeout(function() {

    startReadingHands();

  }, 4400);
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


  // SHOOT = RED

  if (
    countdownText === "SHOOT!"
  ) {

    fill(
      255,
      0,
      0
    );


    textSize(72);

  }


  // OTHER WORDS = BLACK

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

  console.log("READING HANDS");


  gameState =
    "reading";


  p1Samples = [];

  p2Samples = [];


  // READ HANDS EVERY 100 MILLISECONDS

  sampleInterval =
    setInterval(function() {

      sampleHands();

    }, 100);


  // =====================================
  // READ FOR 1.75 SECONDS
  // =====================================

  setTimeout(function() {

    clearInterval(
      sampleInterval
    );


    finishReadingHands();

  }, 1750);
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


  // SAVE PLAYER 1 GESTURE

  if (
    p1Gesture !== ""
  ) {

    p1Samples.push(
      p1Gesture
    );

  }


  // SAVE PLAYER 2 GESTURE

  if (
    p2Gesture !== ""
  ) {

    p2Samples.push(
      p2Gesture
    );

  }
}


// -------------------------------------
// READING HANDS SCREEN
// -------------------------------------

function drawReading() {

  fill(255, 245);

  stroke(0);

  strokeWeight(5);

  rectMode(CENTER);


  rect(
    width / 2,
    height / 2,
    400,
    160,
    15
  );


  noStroke();


  // HOLD

  fill(
    255,
    0,
    0
  );


  textAlign(
    CENTER,
    CENTER
  );


  textSize(48);


  text(
    "HOLD!",
    width / 2,
    height / 2 - 25
  );


  // READING MESSAGE

  fill(0);

  textSize(18);


  text(
    "Reading both hands...",
    width / 2,
    height / 2 + 30
  );


  rectMode(CORNER);
}


// -------------------------------------
// FIND MOST COMMON GESTURE
// -------------------------------------

function mostCommonGesture(samples) {

  if (
    samples.length === 0
  ) {

    return "";

  }


  let rockCount = 0;

  let paperCount = 0;

  let scissorsCount = 0;


  for (
    let gesture of samples
  ) {


    if (
      gesture === "Rock"
    ) {

      rockCount++;

    }


    if (
      gesture === "Paper"
    ) {

      paperCount++;

    }


    if (
      gesture === "Scissors"
    ) {

      scissorsCount++;

    }
  }


  // ROCK

  if (
    rockCount >= paperCount &&
    rockCount >= scissorsCount
  ) {

    return "Rock";

  }


  // PAPER

  if (
    paperCount >= rockCount &&
    paperCount >= scissorsCount
  ) {

    return "Paper";

  }


  // SCISSORS

  return "Scissors";
}


// -------------------------------------
// FINISH READING
// -------------------------------------

function finishReadingHands() {

  player1Choice =
    mostCommonGesture(
      p1Samples
    );


  player2Choice =
    mostCommonGesture(
      p2Samples
    );


  console.log(
    "Player 1:",
    player1Choice
  );


  console.log(
    "Player 2:",
    player2Choice
  );


  determineWinner();
}


// -------------------------------------
// DETERMINE WINNER
// -------------------------------------

function determineWinner() {


  // COULD NOT READ BOTH HANDS

  if (
    player1Choice === "" ||
    player2Choice === ""
  ) {

    roundWinner =
      "Couldn't read both hands";


    gameState =
      "result";


    return;
  }


  // TIE

  if (
    player1Choice ===
    player2Choice
  ) {

    roundWinner =
      "TIE!";

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
      player1Name + " WINS!";


    player1Score++;

  }


  // PLAYER 2 WINS

  else {

    roundWinner =
      player2Name + " WINS!";


    player2Score++;

  }


  gameState =
    "result";
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
    460,
    240,
    15
  );


  noStroke();

  fill(0);

  textAlign(
    CENTER,
    CENTER
  );


  // WINNER

  textSize(32);


  text(
    roundWinner,
    width / 2,
    height / 2 - 75
  );


  // PLAYER CHOICES

  textSize(18);


  text(
    player1Name +
    ": " +
    player1Choice +
    "   |   " +
    player2Name +
    ": " +
    player2Choice,
    width / 2,
    height / 2 - 25
  );


  // SCORE

  textSize(28);


  text(
    player1Score +
    "  -  " +
    player2Score,
    width / 2,
    height / 2 + 20
  );


  // BET

  textSize(15);


  text(
    "On the line: " + bet,
    width / 2,
    height / 2 + 58
  );


  // NEXT ROUND

  textSize(13);


  text(
    "Click anywhere for next round",
    width / 2,
    height / 2 + 90
  );


  rectMode(CORNER);
}