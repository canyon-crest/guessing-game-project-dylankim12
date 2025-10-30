// add javascript here
date.textContent = time();

let score, answer, level, total=0;
const levelArr = document.getElementsByName("level");
const scoreArr = [];

playBtn.addEventListener("click", play);
guessBtn.addEventListener("click", makeGuess);

function time(){
    let d = new Date();
    let str = d.getMonth() + 1 + "/" + d.getDate() + "/" + d.getFullYear();

    return str;
}

function play(){
    playBtn.disabled = true;
    guessBtn.disabled = false;
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
    const lb = document.getElementsByName("leaderboard");
    for(let i=0;i<scoreArr.length;i++){
        if(i < lb.length){
            lb[i].textContent = scoreArr[i];
        }
    }
    total += score;
    wins.textContent = "Total wins: " + scoreArr.length;
    avgScore.textContent = "Average Score: " + (total/scoreArr.length).toFixed(2);
}

function makeGuess(){
    let userGuess = parseInt(guess.value);
    if(isNaN(userGuess) || userGuess < 1 || userGuess > level){
        msg.textContent = "INVALID, guess a number!";
        return;
    } 
    score++;
    if(userGuess > answer){
        msg.textContent = "Too high, guess again.";
    } else if(userGuess < answer){
        msg.textContent = "Too low, guess again.";
    } else{
        msg.textContent = "Correct! It took " + score + " tries.";
        reset();
        updateScore();
    }
}