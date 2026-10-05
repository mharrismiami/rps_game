console.log("SNAPSHOT RPS VERSION LOADED");

let video;

let handPose;
let modelReady = false;


// -------------------------------------
// SNAPSHOT VARIABLES
// -------------------------------------

let snapCanvas = null;

let snapHands = [];

let flashStart = -10000;


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
// SETUP
// -------------------------------------

async function setup() {

  createCanvas(640, 480);


  // CAMERA

  video = createCapture(VIDEO);

  video.size(640, 480);

  video.hide();


  // HANDPOSE MODEL
  // IMPORTANT:
  // We are NOT using detectStart.
  // Detection only happens on the snapshot.

  handPose = await ml5.handPose({
    maxHands: 2
  });


  modelReady = true;


  console.log("HANDPOSE READY");
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
  // CAMERA / FROZEN SNAPSHOT
  // =====================================

  push();

  translate(width, 0);

  scale(-1, 1);


  // SHOW FROZEN PHOTO AFTER SHOOT

  if (
    (
      gameState === "processing" ||
      gameState === "result"
    ) &&
    snapCanvas
  ) {

    drawingContext.drawImage(
      snapCanvas,
      0,
      0,
      width,
      height
    );

  }


  // OTHERWISE SHOW LIVE CAMERA

  else {

    image(
      video,
      0,
      0,
      width,
      height
    );

  }


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


  // =====================================
  // SNAPSHOT HAND POINTS
  // =====================================

  if (gameState === "result") {

    drawSnapshotHands();

  }


  // =====================================
  // GAME SCREENS
  // =====================================

  if (gameState === "waiting") {

    drawStartButton();

  }


  if (gameState === "countdown") {

    drawCountdown();

  }


  if (gameState === "processing") {

    drawProcessing();

  }


  if (gameState === "result") {

    drawResult();

  }


  // CAMERA FLASH

  drawFlash();
}


// -------------------------------------
// FIND PLAYER HAND
// -------------------------------------

function handForPlayer(list, player) {

  for (let hand of list) {

    let wrist =
      hand.keypoints[0];


    // Mirror the X coordinate because
    // the camera is displayed mirrored

    let invertedX =
      width - wrist.x;


    // PLAYER 1 = LEFT

    if (
      player === 0 &&
      invertedX < width / 2
    ) {

      return hand;

    }


    // PLAYER 2 = RIGHT

    if (
      player === 1 &&
      invertedX >= width / 2
    ) {

      return hand;

    }
  }


  return null;
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


  if (modelReady) {

    textSize(28);


    text(
      "START GAME",
      width / 2,
      height / 2
    );

  }

  else {

    textSize(20);


    text(
      "LOADING...",
      width / 2,
      height / 2
    );

  }


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


  // BET

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

  // ONLY RESPOND TO CLICKS
  // INSIDE THE GAME CANVAS

  if (
    mouseX >= 0 &&
    mouseX <= width &&
    mouseY >= 0 &&
    mouseY <= height
  ) {

    if (
      (
        gameState === "waiting" ||
        gameState === "result"
      ) &&
      modelReady
    ) {

      updatePlayerInfo();

      startRound();

    }
  }
}


// -------------------------------------
// START ROUND
// -------------------------------------

function startRound() {

  console.log("NEW ROUND STARTED");


  gameState =
    "countdown";


  player1Choice = "";

  player2Choice = "";

  roundWinner = "";


  snapCanvas = null;

  snapHands = [];


  // =====================================
  // ROCK
  // =====================================

  countdownText =
    "ROCK";


  // =====================================
  // PAPER
  // =====================================

  setTimeout(function() {

    if (gameState === "countdown") {

      countdownText =
        "PAPER";

    }

  }, 1250);


  // =====================================
  // SCISSORS
  // =====================================

  setTimeout(function() {

    if (gameState === "countdown") {

      countdownText =
        "SCISSORS";

    }

  }, 2500);


  // =====================================
  // SHOOT
  // =====================================

  setTimeout(function() {

    if (gameState === "countdown") {

      countdownText =
        "SHOOT!";

    }

  }, 3750);


  // =====================================
  // TAKE THE PHOTO
  // =====================================

  setTimeout(function() {

    if (gameState === "countdown") {

      takeSnapshot();

    }

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
// TAKE SNAPSHOT
// -------------------------------------

function takeSnapshot() {

  console.log("TAKING SNAPSHOT");


  gameState =
    "processing";


  flashStart =
    millis();


  // =====================================
  // CREATE A NORMAL HTML CANVAS
  // =====================================

  snapCanvas =
    document.createElement("canvas");


  snapCanvas.width =
    width;


  snapCanvas.height =
    height;


  // =====================================
  // COPY CURRENT VIDEO FRAME
  // INTO THE CANVAS
  // =====================================

  let ctx =
    snapCanvas.getContext("2d");


  ctx.drawImage(
    video.elt,
    0,
    0,
    width,
    height
  );


  // =====================================
  // ANALYZE THAT PHOTO
  // =====================================

  readSnapshot(
    snapCanvas
  );
}


// -------------------------------------
// READ SNAPSHOT
// -------------------------------------

async function readSnapshot(canvas) {

  console.log("READING SNAPSHOT");


  try {

    let results =
      await handPose.detect(canvas);


    // Sometimes first detection can miss
    // one of the two hands.
    // Try the SAME PHOTO one more time.

    if (
      !handForPlayer(results, 0) ||
      !handForPlayer(results, 1)
    ) {

      console.log(
        "TRYING SNAPSHOT AGAIN"
      );


      results =
        await handPose.detect(canvas);

    }


    snapHands =
      results || [];

  }

  catch (error) {

    console.error(
      "SNAPSHOT ERROR:",
      error
    );


    snapHands = [];

  }


  finishRound();
}


// -------------------------------------
// DRAW SNAPSHOT HAND POINTS
// -------------------------------------

function drawSnapshotHands() {

  for (let hand of snapHands) {

    for (let keypoint of hand.keypoints) {

      let invertedX =
        width - keypoint.x;


      fill(
        255,
        0,
        0
      );


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
// PROCESSING SCREEN
// -------------------------------------

function drawProcessing() {

  fill(255, 245);

  stroke(0);

  strokeWeight(5);

  rectMode(CENTER);


  rect(
    width / 2,
    height / 2,
    400,
    170,
    15
  );


  noStroke();


  fill(
    255,
    0,
    0
  );


  textAlign(
    CENTER,
    CENTER
  );


  textSize(55);


  text(
    "SHOOT!",
    width / 2,
    height / 2 - 30
  );


  fill(0);

  textSize(18);


  text(
    "Checking photo...",
    width / 2,
    height / 2 + 35
  );


  rectMode(CORNER);
}


// -------------------------------------
// CAMERA FLASH
// -------------------------------------

function drawFlash() {

  let timeSinceFlash =
    millis() - flashStart;


  if (
    timeSinceFlash < 350
  ) {

    fill(
      255,
      255 * (
        1 -
        timeSinceFlash / 350
      )
    );


    noStroke();


    rect(
      0,
      0,
      width,
      height
    );
  }
}


// -------------------------------------
// FINISH ROUND
// -------------------------------------

function finishRound() {

  console.log(
    "PHOTO HANDS:",
    snapHands
  );


  let player1Hand =
    handForPlayer(
      snapHands,
      0
    );


  let player2Hand =
    handForPlayer(
      snapHands,
      1
    );


  player1Choice =
    getGesture(
      player1Hand
    );


  player2Choice =
    getGesture(
      player2Hand
    );


  console.log(
    "PLAYER 1:",
    player1Choice
  );


  console.log(
    "PLAYER 2:",
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
    (
      player1Choice ||
      "Not Read"
    ) +
    "   |   " +
    player2Name +
    ": " +
    (
      player2Choice ||
      "Not Read"
    ),
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
    "Click the game for next round",
    width / 2,
    height / 2 + 90
  );


  rectMode(CORNER);
}