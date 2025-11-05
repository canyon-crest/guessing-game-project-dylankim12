// add javascript here

let inGame = false;
let score, answer, level, totalScore=0, totalTime = 0, curT, startT, elapsed;
let user = "";
const levelArr = document.getElementsByName("level");
const scoreArr = [], timeArr = [];

// const nameBtn = document.getElementById("nameBtn");
// const userName = document.getElementById("userName");
// const nameMsg = document.getElementById("nameMsg");
// const playBtn = document.getElementById("playBtn");
// const guessBtn = document.getElementById("guessBtn");
// const giveUpBtn = document.getElementById("giveUpBtn");
// const date = document.getElementById("date");
// const curTime = document.getElementById("curTime");
// const msg = document.getElementById("msg");
// const guess = document.getElementById("guess");
// const wins = document.getElementById("wins");
// const avgScore = document.getElementById("avgScore");

initT();

playBtn.addEventListener("click", play);
guessBtn.addEventListener("click", makeGuess);
nameBtn.addEventListener("click", nameInput);
giveUpBtn.addEventListener("click", giveUp);

function giveUp(){
    msg.textContent = "You gave up, " + user + ". Your score for this game is set to " + level + ".";
    score = level;
    updateScore();
    reset();
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
    // record this game's score and time
    scoreArr.push(score);
    scoreArr.sort((a, b) => a - b);
    timeArr.push(elapsed);
    timeArr.sort((a, b) => a - b);

    const lb = document.getElementsByName("leaderboard");
    const timeLb = document.getElementsByName("timeLeaderboard");

    // update running totals first (used to compute averages)
    totalScore += score;
    totalTime += (typeof elapsed === 'number' ? elapsed : 0);

    // update wins and averages (guard against division by zero)
    wins.textContent = "Total wins: " + scoreArr.length;
    const avg = scoreArr.length > 0 ? (totalScore / scoreArr.length) : 0;
    avgScore.textContent = "Average Score: " + avg.toFixed(2);
    const avgT = scoreArr.length > 0 ? (totalTime / scoreArr.length / 1000) : 0;
    averageTime.textContent = "Average Time: " + avgT.toFixed(2) + " seconds";

    // populate score leaderboard (top entries)
    const maxScores = Math.min(lb.length, scoreArr.length);
    for (let i = 0; i < maxScores; i++) {
        lb[i].textContent = scoreArr[i];
    }

    // populate time leaderboard (display in seconds)
    const maxTimes = Math.min(timeLb.length, timeArr.length);
    for (let i = 0; i < maxTimes; i++) {
        timeLb[i].textContent = (timeArr[i] / 1000).toFixed(2) + " seconds";
    }
}

function makeGuess(){
    let userGuess = parseInt(guess.value);
    if(isNaN(userGuess) || userGuess < 1 || userGuess > level){
        msg.textContent = "INVALID, guess a number!";
        return;
    } 
    score++;
    if(userGuess > answer){
        msg.textContent = "Too high, guess again " + user + ".";
    } else if(userGuess < answer){
        msg.textContent = "Too low, guess again " + user + ".";
    } else{
        msg.textContent = "Correct! It took " + score + " tries. Congrats, " + user + "!";
        if(score == Math.ceil(Math.log2(level))) msg.textContent += " This is an okay score.";
        if(score > Math.ceil(Math.log2(level))) msg.textContent += " This is a bad score.";
        else msg.textContent += " This is a good score.";
        inGame = false;
        reset();
        updateScore();
    }
}