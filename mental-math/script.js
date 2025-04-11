let score = 0;
let maxScore = 0;
let timerInterval;
let answer = 0;
let left = 0;
let right = 0;
let operator = "x";
let choice = new Array(0, 1, 2, 3);

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('startButton').addEventListener('click', switchToDisplayB);
    document.getElementById('stopButton').addEventListener('click', goBackToA);
    for (let index = 0; index < 4; index++) {
        document.getElementById('choice' + String(index)).addEventListener('mousedown', (event) => handleDown(index));
        document.getElementById('choice' + String(index)).addEventListener('touchstart', (event) => handleDown(index));
        document.getElementById('choice' + String(index)).addEventListener('mouseup', handleUp);
        document.getElementById('choice' + String(index)).addEventListener('touchend', handleUp);
    }
    adjustButtonFontSize();
});

function switchToDisplayB() {
    score = 0;
    document.getElementById('currentScore').textContent = score;
    handleUp();
    document.getElementById('displayA').classList.remove('active');
    document.getElementById('displayB').classList.add('active');

    // Reset timer and start countdown
    let timeLeft = 60;
    document.getElementById('timer').textContent = timeLeft;

    timerInterval = setInterval(() => {
        if (timeLeft <= 1) {
            clearInterval(timerInterval);
            goBackToA();
        } else {
            timeLeft--;
            document.getElementById('timer').textContent = timeLeft;
        }
    }, 1000);
    adjustButtonFontSize();
}

function goBackToA() {
    // Clear the interval to stop the timer
    clearInterval(timerInterval);

    document.getElementById('displayB').classList.remove('active');
    document.getElementById('displayA').classList.add('active');

    // Check the maxScore
    maxScore = Math.max(score, maxScore);
    document.getElementById('maxScore').textContent = maxScore;
    document.getElementById('score').textContent = score;
    adjustButtonFontSize();
}

function handleDown(selected) {
    if (answer == choice[selected]) {
        score++;
        document.getElementById('currentScore').textContent = score;
    }
    for (let index = 0; index < choice.length; index++) {
        if (answer == choice[index]) {
            document.getElementById('choice' + String(index)).style.backgroundColor = 'green';
        } else {
            document.getElementById('choice' + String(index)).style.backgroundColor = 'red';
        }
    }
}

function handleUp() {
    disableAll();
    for (let index = 0; index < choice.length; index++) {
        document.getElementById('choice' + String(index)).style.backgroundColor = '#3498db';
    }
    generateCongak();
    enableAll();
}

function generateCongak() {
    switch (getRandomNumberBetween(0, 3)) {
        case 0:
            console.log("Addition");
            generateAddition();
            break;
        case 1:
            console.log("Substraction");
            generateSubstraction();
            break;
        case 2:
            console.log("Multiplication");
            generateMultiplication();
            break;
        case 3:
            console.log("Division");
            generateDivision();
            break;
        default:
            console.log("Substraction");
            generateSubstraction();
            break;
    }
    document.getElementById('left').textContent = left;
    document.getElementById('operator').textContent = operator;
    document.getElementById('right').textContent = right;
    for (let index = 0; index < choice.length; index++) {
        document.getElementById('choice' + String(index)).textContent = String(choice[index]);
    }
}

function generateMultiplication() {
    left = getRandomNumberBetween(1, 9); operator = 'x'; right = getRandomNumberBetween(1, 9); answer = left * right;
    let rightAnswer = getRandomNumberBetween(0, 3);
    let wrongAnswers = new Array(answer, answer, answer);

    while (wrongAnswers[0] == answer) {
        wrongAnswers[0] = left * getRandomNumberBetween(1, 9);
    }
    while (wrongAnswers[1] == answer || wrongAnswers[1] == wrongAnswers[0]) {
        wrongAnswers[1] = right * getRandomNumberBetween(1, 9);
    }
    while (wrongAnswers[2] == answer || wrongAnswers[2] == wrongAnswers[0] || wrongAnswers[2] == wrongAnswers[1]) {
        wrongAnswers[2] = getRandomNumberBetween(1, 9) * getRandomNumberBetween(1, 9);
    }

    let currWrongAnswer = 0;
    for (let index = 0; index < choice.length; index++) {
        if (index == rightAnswer) {
            choice[index] = answer;
        } else {
            choice[index] = wrongAnswers[currWrongAnswer];
            currWrongAnswer++;
        }
    }
}

function generateDivision() {
    left = getRandomNumberBetween(1, 9); operator = ':'; right = getRandomNumberBetween(1, 9); answer = left * right;
    let temp = left; left = answer; answer = temp;
    let rightAnswer = getRandomNumberBetween(0, 3);
    let wrongAnswers = new Array(answer, answer, answer);

    while (wrongAnswers[0] == answer) {
        wrongAnswers[0] = getRandomNumberBetween(1,9);
    }
    while (wrongAnswers[1] == answer || wrongAnswers[1] == wrongAnswers[0]) {
        wrongAnswers[1] = ((wrongAnswers[1] + 1) % 9) + 1;
    }
    while (wrongAnswers[2] == answer || wrongAnswers[2] == wrongAnswers[0] || wrongAnswers[2] == wrongAnswers[1]) {
        wrongAnswers[2] = getRandomNumberBetween(1,9);
    }

    let currWrongAnswer = 0;
    for (let index = 0; index < choice.length; index++) {
        if (index == rightAnswer) {
            choice[index] = answer;
        } else {
            choice[index] = wrongAnswers[currWrongAnswer];
            currWrongAnswer++;
        }
    }
}

function generateAddition() {
    answer = getRandomNumberBetween(19, 95); left = getRandomNumberBetween(1, answer - 1); operator = '+'; right = answer - left;
    let rightAnswer = getRandomNumberBetween(0, 3);
    let wrongAnswers = new Array(answer, answer, answer);
    let bigger = Math.max(left,right);
    while (wrongAnswers[0] == answer) {
        wrongAnswers[0] = getRandomNumberBetween(answer + 1, 100);
    }
    while (wrongAnswers[1] == answer || wrongAnswers[1] == wrongAnswers[0]) {
        wrongAnswers[1] = getRandomNumberBetween(bigger, 100);
        if (wrongAnswers[1] > 3 * answer) {
            wrongAnswers[1] = answer;
        }
    }
    while (wrongAnswers[2] == answer || wrongAnswers[2] == wrongAnswers[0] || wrongAnswers[2] == wrongAnswers[1]) {
        wrongAnswers[2] = getRandomNumberBetween(bigger, 100);
        if (wrongAnswers[2] > 3 * answer) {
            wrongAnswers[2] = answer;
        }
    }

    let currWrongAnswer = 0;
    for (let index = 0; index < choice.length; index++) {
        if (index == rightAnswer) {
            choice[index] = answer;
        } else {
            choice[index] = wrongAnswers[currWrongAnswer];
            currWrongAnswer++;
        }
    }
}

function generateSubstraction() {
    answer = getRandomNumberBetween(19, 95); left = getRandomNumberBetween(3, answer - 1); operator = '-'; right = answer - left;
    let temp = left; left = answer; answer = temp;
    let rightAnswer = getRandomNumberBetween(0, 3);
    let wrongAnswers = new Array(answer, answer, answer);
    let bigger = Math.max(left,right);
    while (wrongAnswers[0] == answer) {
        wrongAnswers[0] = getRandomNumberBetween(1, answer - 1);
    }
    while (wrongAnswers[1] == answer || wrongAnswers[1] == wrongAnswers[0]) {
        wrongAnswers[1] = getRandomNumberBetween(1, bigger);
    }
    while (wrongAnswers[2] == answer || wrongAnswers[2] == wrongAnswers[0] || wrongAnswers[2] == wrongAnswers[1]) {
        wrongAnswers[2] = getRandomNumberBetween(1, bigger);
    }

    let currWrongAnswer = 0;
    for (let index = 0; index < choice.length; index++) {
        if (index == rightAnswer) {
            choice[index] = answer;
        } else {
            choice[index] = wrongAnswers[currWrongAnswer];
            currWrongAnswer++;
        }
    }
}

function getRandomNumberBetween(x, y) {
    return Math.floor(Math.random() * (y - x + 1)) + x;
}

function adjustButtonFontSize() {
    const buttons = document.querySelectorAll('.choice-container button');

    let biggest = 0
    buttons.forEach(button => {
        const width = button.offsetWidth;
        const height = button.offsetHeight;
        // Calculate a font size based on the smaller dimension of the button
        const fontSize = Math.min(width, height) * 0.3; // You can adjust the multiplier as needed
        biggest = Math.max(biggest, fontSize);
        button.style.fontSize = `${fontSize}px`;
    });

    document.getElementById('left').style.fontSize = `${biggest*3}px`;
    document.getElementById('operator').style.fontSize = `${biggest*3}px`;
    document.getElementById('right').style.fontSize = `${biggest*3}px`;
}

// Disable all buttons
function disableAll() {
    Array.prototype.forEach.call(document.querySelectorAll('button'), function (button) {
        button.disabled = true;
    });
}

// Enable all buttons
function enableAll() {
    Array.prototype.forEach.call(document.querySelectorAll('button'), function (button) {
        button.disabled = false;
    });
}
