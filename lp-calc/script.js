function toggleOperatorVisibility(player, display){
    if (display != "none" && display != "block") {
        display = "none"
    }
    let playerDiv = document.getElementById(player);
    let operatorDiv = playerDiv.querySelector('.operator');
    operatorDiv.style.display = display;
}

function toggleInputDisplayVisibility(player, display){
    let inputDisplayDiv = document.getElementById(player + "Display");
    if (display != "none" && display != "block") {
        display = "none"
    }
    inputDisplayDiv.style.display = display;
}

function appendToInput(player, num) {
    toggleOperatorVisibility(player, "block")
    toggleInputDisplayVisibility(player, "block")
    let display = document.getElementById(player + "Display");
    if (display.innerText === "0" && num !== "00") {
        display.innerText = num;
    } else {
        display.innerText += num;
    }
}

function clearInput(player) {
    let display = document.getElementById(player + "Display");
    display.innerText = "0";
    toggleOperatorVisibility(player, "none")
    toggleInputDisplayVisibility(player, "none")
}

function applyChange(player) {
    let display = document.getElementById(player + "Display");
    let value = parseInt(display.innerText);
    if (isSubtraction[player]) {
        value = -value;
    }
    changePoints(player, value);
    toggleOperatorVisibility(player, "none")
    toggleInputDisplayVisibility(player, "none")
    display.innerText = "0";
}

function changePoints(player, amount) {
    let playerDiv = document.getElementById(player);
    let pointDiv = playerDiv.querySelector('.points');
    let currentPoints = parseInt(pointDiv.getAttribute('data-points'));
    currentPoints += amount;
    pointDiv.setAttribute('data-points', currentPoints);
    pointDiv.textContent = currentPoints;
}

function resetOperator(player) {
    let playerDiv = document.getElementById(player);
    let operatorDiv = playerDiv.querySelector('.operator');
    operatorDiv.textContent = "-"; 
}

function reset() {
    let players = document.querySelectorAll('.player .points');
    players.forEach(player => {
        player.setAttribute('data-points', 8000);
        player.textContent = 8000;
        toggleOperatorVisibility(player, "none");
        toggleInputDisplayVisibility(player, "none");
    });
    clearInput("player1");
    clearInput("player2");
    resetOperator("player1");
    resetOperator("player2"); 
}

let isSubtraction = {
    'player1': true,
    'player2': true
};

function toggleMode(player) {
    isSubtraction[player] = !isSubtraction[player];
    let playerDiv = document.getElementById(player);
    let operatorDiv = playerDiv.querySelector('.operator');
    if (isSubtraction[player]) {
        operatorDiv.textContent = "-";
    } else {
        operatorDiv.textContent = "+";
    }
    toggleOperatorVisibility(player, "block")
    toggleInputDisplayVisibility(player, "block")
}

function multiply(player, factor) {
    let playerDiv = document.getElementById(player);
    let pointDiv = playerDiv.querySelector('.points');
    let operatorDiv = playerDiv.querySelector('.operator');
    operatorDiv.textContent = "+";
    isSubtraction[player] = false;
    let currentPoints = parseInt(pointDiv.getAttribute('data-points'));
    let num = currentPoints;
    clearInput(player)
    appendToInput(player, num);
}

function divide(player, divisor) {
    let playerDiv = document.getElementById(player);
    let pointDiv = playerDiv.querySelector('.points');
    let operatorDiv = playerDiv.querySelector('.operator');
    operatorDiv.textContent = "-";
    isSubtraction[player] = true;
    let currentPoints = parseInt(pointDiv.getAttribute('data-points'));
    let num = Math.floor(currentPoints / divisor);
    clearInput(player)
    appendToInput(player, num);
}

// This is just initialization
window.onload = () => {
    let players = ['player1', 'player2'];
    players.forEach(player => {
        let numpad = document.querySelector(`#${player} .numpad`);
        for (let i = 1; i <= 9; i++) {
            let btn = document.createElement('button');
            btn.textContent = i;
            btn.onclick = () => appendToInput(player, i.toString());
            numpad.appendChild(btn);
        }
        let btn0 = document.createElement('button');
        btn0.textContent = '0';
        btn0.onclick = () => appendToInput(player, '0');
        numpad.appendChild(btn0);

        let btn00 = document.createElement('button');
        btn00.textContent = '00';
        btn00.onclick = () => appendToInput(player, '00');
        numpad.appendChild(btn00);

        let btnClear = document.createElement('button');
        btnClear.textContent = 'C';
        btnClear.onclick = () => clearInput(player);
        numpad.appendChild(btnClear);

        let btnMultiply = document.createElement('button');
        btnMultiply.textContent = 'x2';
        btnMultiply.onclick = () => multiply(player, 2);
        document.getElementById(player).querySelector('.operator-select').appendChild(btnMultiply);

        let btnDivide = document.createElement('button');
        btnDivide.textContent = '/2';
        btnDivide.onclick = () => divide(player, 2);
        document.getElementById(player).querySelector('.operator-select').appendChild(btnDivide);

        let btnApply = document.createElement('button');
        btnApply.textContent = 'Apply';
        btnApply.onclick = () => applyChange(player);
        document.getElementById(player).appendChild(btnApply);
    });
};
