// filepath: /workspaces/guessing-game-project-dylankim12/script.js
// Safe DOM cache + initial state (prevents early ReferenceError that stopped script)
const playBtn = document.getElementById('playBtn');
const guessBtn = document.getElementById('guessBtn');
const nameBtn = document.getElementById('nameBtn');
const giveUpBtn = document.getElementById('giveUpBtn');
const hintBtn = document.getElementById('hintBtn');
const userName = document.getElementById('userName');
const nameMsg = document.getElementById('nameMsg');
const date = document.getElementById('date');
const curTime = document.getElementById('curTime');
const msg = document.getElementById('msg');
const wins = document.getElementById('wins');
const avgScore = document.getElementById('avgScore');
const averageTime = document.getElementById('averageTime');
const hintCountEl = document.getElementById('hintCount');
const hintEl = document.getElementById('hint');

let inGame = false;
let score, answer, level, totalScore=0, totalTime = 0, curT, startT, elapsed;
let user = "";
const levelArr = document.getElementsByName("level");
const scoreArr = [], timeArr = [];

initT();

// wire listeners safely (only if elements exist)
if (playBtn) playBtn.addEventListener("click", play);
if (guessBtn) guessBtn.addEventListener("click", makeGuess);
if (nameBtn) nameBtn.addEventListener("click", nameInput);
if (giveUpBtn) giveUpBtn.addEventListener("click", giveUp);
// remove the earlier unguarded hint wiring to avoid confusing/no-op handlers

// Heatmap settings
const HEAT_SEGMENTS = 11; // odd number visually centered
const heatmap = document.getElementById("heatmap");

// create heatmap segments
function createHeatmap(){
    if(!heatmap) return;
    heatmap.innerHTML = "";
    for(let i=0;i<HEAT_SEGMENTS;i++){
        const seg = document.createElement("div");
        seg.className = "segment";
        seg.dataset.index = i;
        seg.style.setProperty('--glow-opacity', 0);
        heatmap.appendChild(seg);
    }
}

// update heatmap based on guess proximity
// closer -> higher ratio -> more segments lit (centered)
function updateHeatmap(guessVal){
    if(!heatmap) return;
    const segments = Array.from(heatmap.children);
    if(!level || level <= 1) {
        clearHeatmap();
        return;
    }

    // distance ratio: 1 = exact match, 0 = farthest
    const dist = Math.abs(guessVal - answer);
    const maxDist = Math.max(1, (level - 1));
    const ratio = 1 - Math.min(dist, maxDist) / maxDist;

    // determine how many segments to light based on ratio
    const activeCount = Math.max(1, Math.ceil(ratio * HEAT_SEGMENTS));
    const center = Math.floor(HEAT_SEGMENTS / 2);
    const half = Math.floor(activeCount / 2);

    // compute start/end indices so segments light symmetrically around center
    let start = center - half;
    let end = start + activeCount - 1;
    if (start < 0) { start = 0; end = activeCount - 1; }
    if (end > HEAT_SEGMENTS - 1) { end = HEAT_SEGMENTS - 1; start = end - activeCount + 1; }

    segments.forEach((seg, i) => {
        if (i >= start && i <= end) {
            seg.classList.add("glow");
            // intensity falls off from center
            const d = Math.abs(i - center);
            const maxFall = Math.max(1, Math.floor(HEAT_SEGMENTS / 2));
            const intensity = Math.max(0.12, 1 - d / (maxFall + 0.2)); // keep a visible minimum
            seg.style.setProperty('--glow-opacity', intensity.toFixed(2));
            // burst the center segment for emphasis
            if (i === center) {
                seg.classList.add("burst");
                setTimeout(() => seg.classList.remove("burst"), 520);
            } else {
                seg.classList.remove("burst");
            }
        } else {
            seg.classList.remove("glow", "burst");
            seg.style.setProperty('--glow-opacity', 0);
        }
    });
}

// clear heatmap visuals
function clearHeatmap(){
    if(!heatmap) return;
    const segments = Array.from(heatmap.children);
    segments.forEach(seg => {
        seg.classList.remove("glow", "burst");
        seg.style.setProperty('--glow-opacity', 0);
    });
}

function giveUp(){
    msg.textContent = "You gave up, " + user + ". Your score for this game is set to " + level + ".";
    score = level;
    inGame = false;
    updateScore();
    reset();
    clearHeatmap();
}

function nameInput(){
    user = userName.value;
    if(user == ""){
        nameMsg.textContent = "Name Invalid";
        return;
    }
    user = user[0].toUpperCase() + user.substring(1);
    nameMsg.textContent = "Hi " + user + ". Select a difficulty to play.";
    userName.disabled = true;
    nameBtn.disabled = true;
    for(let i=0; i<levelArr.length; i++){
        levelArr[i].disabled = false;
    }
    playBtn.disabled = false;
}

function initT(){
    time();
    interval=setInterval(time,1);
}

function time(){
    let d = new Date();
    curT = new Date();
    const months = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let currDate = months[d.getMonth()] + " " + d.getDate();
    if(d.getDate%10==1) currDate += "st";
    else if(d.getDate%10==2) currDate += "nd";
    else if(d.getDate%10==3) currDate += "rd";
    else currDate += "th";
    currDate += " " + d.getFullYear();
    date.textContent = currDate;

    let currHour = d.getHours();
    let currMin = d.getMinutes();
    let currSec = d.getSeconds();

    if(currHour<10) currHour = "0" + currHour;
    if(currMin<10) currMin = "0" + currMin;
    if(currSec<10) currSec = "0" + currSec;


    curTime.textContent = "Current Time: " + currHour + ":" + currMin + ":" + currSec;
    if(inGame){
        elapsed = (curT - startT);
        const playTime = document.getElementById("playTime");
        playTime.textContent = "Time: " + Math.floor(elapsed/1000) + "." + Math.floor((elapsed%1000)/10);
    }
}

function play(){
    inGame = true;
    startT = new Date();
    let elapsed = Math.floorcurT - startT;
    const playTime = document.getElementById("playTime");
    playTime.textContent = "Time: " + elapsed + " seconds";
    playBtn.disabled = true;
    guessBtn.disabled = false;
    giveUpBtn.disabled = false;
    guess.disabled = false;
    for(let i=0; i<levelArr.length; i++){
        levelArr[i].disabled = true;
        if(levelArr[i].checked) level = levelArr[i].value;
    }
    answer = Math.floor(Math.random()*level)+1;
    msg.textContent = "Guess a number 1-" + level;
    guess.placeholder = answer;
    score = 0;
    clearHeatmap();

    // Ensure hints are reset and button enabled when a game starts.
    if (typeof window.resetHints === "function") {
      window.resetHints();
    }
    // fallback if resetHints not exposed by hint module
    else {
      if (typeof hintCountEl !== 'undefined' && hintCountEl) hintCountEl.textContent = `Hints: 2`;
      if (hintBtn) hintBtn.disabled = false;
      if (hintEl) hintEl.textContent = "No hint yet.";
    }
}

function reset(){
    guessBtn.disabled = true;
    giveUpBtn.disabled = true;
    guess.value = "";
    guess.placeholder = "";
    guess.disabled = true;
    playBtn.disabled = false;
    for(let i=0;i<levelArr.length;i++){
        levelArr[i].disabled = false;
    }
}

function updateScore(){
    scoreArr.push(score);
    scoreArr.sort((a, b) => a - b);
    timeArr.push(elapsed);
    timeArr.sort((a, b) => a - b);

    const lb = document.getElementsByName("leaderboard");
    const timeLb = document.getElementsByName("timeLeaderboard");

    totalScore += score;
    totalTime += elapsed;

    wins.textContent = "Total wins: " + scoreArr.length;
    const avg = totalScore / scoreArr.length;
    avgScore.textContent = "Average Score: " + avg.toFixed(2);
    const avgT = totalTime / scoreArr.length / 1000;
    averageTime.textContent = "Average Time: " + avgT.toFixed(2) + "s";

    const maxScores = Math.min(lb.length, scoreArr.length);
    for (let i = 0; i < maxScores; i++) {
        lb[i].textContent = scoreArr[i];
    }

    const maxTimes = Math.min(timeLb.length, timeArr.length);
    for (let i = 0; i < maxTimes; i++) {
        timeLb[i].textContent = (timeArr[i] / 1000).toFixed(2) + "s";
    }
}

function makeGuess(){
    let userGuess = parseInt(guess.value);
    if(isNaN(userGuess) || userGuess < 1 || userGuess > level){
        msg.textContent = "INVALID, guess a number!";
        return;
    } 
    score++;
    // update heatmap visually for this guess
    updateHeatmap(userGuess);

    if(userGuess > answer){
        msg.textContent = "Too high, guess again " + user + ".";
        if(Math.abs(userGuess - answer) > 10){
            msg.textContent += " You're cold.";
        } else if(Math.abs(userGuess - answer) > 3){
            msg.textContent += " You're warm.";
        } else{
            msg.textContent += " You're hot.";
        }
    } else if(userGuess < answer){
        msg.textContent = "Too low, guess again " + user + ".";
        if(Math.abs(userGuess - answer) > 10){
            msg.textContent += " You're cold.";
        } else if(Math.abs(userGuess - answer) > 3){
            msg.textContent += " You're warm.";
        } else{
            msg.textContent += " You're hot.";
        }
    } else{
        msg.textContent = "Correct! It took " + score + " tries. Congrats, " + user + "!";
        if(score == Math.ceil(Math.log2(level))) msg.textContent += " This is an okay score.";
        if(score > Math.ceil(Math.log2(level))) msg.textContent += " This is a bad score.";
        else msg.textContent += " This is a good score.";
        inGame = false;
        reset();
        updateScore();
        // highlight the exact segment on win briefly
        updateHeatmap(userGuess);
        setTimeout(()=> clearHeatmap(), 900);
    }
}

// initialize heatmap on load
createHeatmap();

/* --- Hint economy implementation (appended safely) --- */
(function(){
  // safe DOM refs
  const hintBtn = document.getElementById('hintBtn');
  const hintCountEl = document.getElementById('hintCount');
  const hintEl = document.getElementById('hint');

  // config / strings
  const HINT_TOKENS = 2;
  const STRINGS = {
    NO_HINT_YET: "No hint yet.",
    OUT_OF_HINTS: "You're out of hints.",
    GAME_OVER_HINT: "No more hints—game is over.",
    NEED_GUESS: "Make at least one guess first.",
    HINT_PREFIX: "Hint:",
  };

  // local state (kept here so getHint stays pure)
  let tokensLeft = 0;
  // track last guess (wraps existing makeGuess)
  let lastGuess = null;

  // small UI helper
  function flashHint(text){
    if(!hintEl) return;
    hintEl.textContent = text;
    hintEl.classList.add('show');
    setTimeout(()=> hintEl.classList.remove('show'), 900);
  }

  // Pure function as required
  function getHint({ secret, lastGuess, tokensLeft }){
    // returns { message, spendToken }
    const choices = ['parity','proximity','divisibility'];
    // random order
    for(let i = choices.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }

    for(const c of choices){
      if(c === 'proximity'){
        if(lastGuess == null) return { message: STRINGS.NEED_GUESS, spendToken: false };
        const diff = Math.abs(secret - lastGuess);
        return { message: diff <= 10 ? "You're within ±10 of the number." : "You're more than 10 away.", spendToken: true };
      }
      if(c === 'parity'){
        return { message: (secret % 2 === 0) ? "The number is even." : "The number is odd.", spendToken: true };
      }
      if(c === 'divisibility'){
        const d = [3,5,7][Math.floor(Math.random()*3)];
        return { message: (secret % d === 0) ? `The number is divisible by ${d}.` : `The number is not divisible by ${d}.`, spendToken: true };
      }
    }
    return { message: STRINGS.NO_HINT_YET, spendToken: false };
  }

  // render tokens / button state
  function renderHintUI(){
    if(hintCountEl) hintCountEl.textContent = `Hints: ${tokensLeft}`;
    if(hintBtn) hintBtn.disabled = (!inGame || tokensLeft <= 0);
  }

  // called when user clicks hint
  function onHintClick(){
    console.log('hint clicked', { inGame, tokensLeft }); // debug log
    if(!hintBtn) return;
    if(!inGame){
      flashHint(STRINGS.GAME_OVER_HINT);
      return;
    }
    if(tokensLeft <= 0){
      flashHint(STRINGS.OUT_OF_HINTS);
      return;
    }
    const result = getHint({ secret: answer, lastGuess: lastGuess, tokensLeft });
    if(!result.spendToken){
      flashHint(result.message);
      return;
    }
    tokensLeft = Math.max(0, tokensLeft - 1);
    renderHintUI();
    flashHint(`${STRINGS.HINT_PREFIX} ${result.message}`);
  }

  // reset tokens on new game
  function resetHints(){
    tokensLeft = HINT_TOKENS;
    if(hintEl) hintEl.textContent = STRINGS.NO_HINT_YET;
    renderHintUI();
  }

  // expose handlers so outer code can call/reset (play() uses this)
  window.onHintClick = onHintClick;
  window.resetHints = resetHints;
  window.getHintPure = getHint; // optional for debugging/tests

  // wire hint button
  if(hintBtn) {
    // ensure only one listener attached
    hintBtn.removeEventListener('click', onHintClick);
    hintBtn.addEventListener('click', onHintClick);
  }

  // wrap makeGuess to capture lastGuess (preserve original)
  if(typeof makeGuess === 'function'){
    const _makeGuess = makeGuess;
    makeGuess = function(...args){
      // attempt to read guess input (non-mutative)
      const gEl = document.getElementById('guess');
      const parsed = gEl ? parseInt(gEl.value, 10) : NaN;
      if(!isNaN(parsed)) lastGuess = parsed;
      return _makeGuess.apply(this, args);
    };
  }

  // wrap reset/giveUp to clear tokens and UI
  if(typeof reset === 'function'){
    const _reset = reset;
    reset = function(...args){
      const res = _reset.apply(this, args);
      tokensLeft = 0;
      renderHintUI();
      if(hintEl) hintEl.textContent = STRINGS.NO_HINT_YET;
      return res;
    };
  }
  if(typeof giveUp === 'function'){
    const _giveUp = giveUp;
    giveUp = function(...args){
      const res = _giveUp.apply(this, args);
      tokensLeft = 0;
      renderHintUI();
      if(hintEl) hintEl.textContent = STRINGS.NO_HINT_YET;
      return res;
    };
  }

  // initial UI state
  resetHints();

  // expose for debugging/tests (optional)
  window._getHint = getHint;
  window._hintTokensLeft = ()=> tokensLeft;
})();