const displayTextTop = document.querySelector('.display__top-text');
const displayTextBot = document.querySelector('.display__bot-text');

const buttons = document.querySelectorAll('.button');


let savedNum = '';
let operator = '';
let inputNum = '';
let equalOperatorDisplay = '';

function handleInput(e) {
    let btn = e.target;
    let pressed = btn.dataset.value;
    let type = btn.dataset.type;
    
    if (!isNaN(pressed)) {
        if (!(pressed==='0' && (inputNum=='0' || !inputNum))) inputNum += pressed;
        
    }
    else if (pressed === '.') {
        if (!inputNum.includes('.')) inputNum += (inputNum) ? '.' : '0.';

    }
    else if (pressed === '+-') {
        if (operator==='='){
            inputNum = savedNum;
            savedNum = '';
            operator = '';
        }
        if (inputNum.charAt(0)==='-') inputNum = inputNum.slice(1);
            else if (+inputNum!==0) inputNum = '-' + inputNum;

    }
    else if (pressed === '√' && inputNum) {
        if (!savedNum) equalOperatorDisplay = `√${inputNum} =`;
        inputNum = Math.sqrt(+inputNum).toString();

    }
    else if (pressed === '!' && inputNum) {
        if (!savedNum) equalOperatorDisplay = `${inputNum}! =`;
        inputNum = factorial(+inputNum).toString();

    }
    else if (pressed === '%' && inputNum) {
        if (!savedNum) {
            equalOperatorDisplay = `${inputNum}% =`;
            inputNum = (inputNum/100).toString();
        }
        else if (['×','*','+','-'].includes(operator)) {
            equalOperatorDisplay = `${savedNum} ${operator} ${inputNum}% =`;
            if (operator==='-') inputNum = savedNum - (inputNum/100)*savedNum;
            if (operator==='+') inputNum = savedNum + (inputNum/100)*savedNum;
            if (operator==='×'||operator==='*') inputNum = (inputNum/100)*savedNum;
        }

    }
    else if (['^','×','/','+','-'].includes(pressed) && (savedNum || inputNum)) {
        if (savedNum && operator && inputNum) {
            savedNum = operate(+savedNum, +inputNum, operator).toString();
            inputNum = '';
        }
        else if (operator) {
            operator = pressed;
        }
        else {
            savedNum = inputNum;
            inputNum = '';
        }
        operator = pressed;

    }
    else if (pressed === '=') {
        if (savedNum && operator && inputNum) {
            equalOperatorDisplay = `${savedNum} ${operator} ${inputNum} =`;
            inputNum = operate(+savedNum, +inputNum, operator).toString();
            savedNum = '';
            operator = '';
        }
    }
    else if (pressed === 'C') {
        inputNum = inputNum.slice(0,-1);

    }
    else if (pressed === 'CE') {
        inputNum = '';
        savedNum = '';
        operator = '';
    }


    if (equalOperatorDisplay) {
        displayTextTop.textContent = equalOperatorDisplay;
        equalOperatorDisplay = '';
    }
    else {
        displayTextTop.textContent = `${savedNum} ${operator}`;
    }
    displayTextBot.textContent = (inputNum) ? `${inputNum}` : (savedNum) ? `${savedNum}` : '0';

    if (inputNum==="Infinity" || inputNum==="NaN" || savedNum==="Infinity" || savedNum==="NaN") {
        inputNum = '';
        savedNum = '';
        operator = '';
    }
}

buttons.forEach(n => n.addEventListener("click", e => handleInput(e)));



// SUPORT FUNCTIONS //
/** Returns true if character is an operator */
const isOperator = char => ['√','!','^','%','÷','/','×','*','+','-'].includes(char);

/** Returns true if it's a negative symbol before a number (not an operator) */
const isNegativePrefix = (expr, i) => {
    if (expr.length-1 < i+1) return false;
    return ( (i-1<0 || isOperator(expr[i-1])) && expr[i]==='-' && !isNaN(expr[i+1]) )
}

/** Returns position of matching parentheses */
const findMatchingParenthesis = (expr, start) => {
    let count = 1;

    for (let i = start + 1; i < expr.length; i++) {
        if (expr[i] === '(') {
            count++;
        } else if (expr[i] === ')') {
            count--;

            if (count === 0) return i;
        }
    }
};

/** Performs a basic operations between two numbers */
function operate(a, b, op) {
    if (op==='+') return a+b;
    else if (op==='-') return a-b;
    else if (op==='×'||op==='*') return a*b;
    else if (op==='÷'||op==='/') return a/b;
    else if (op==='%') return a%b;
    else if (op==='^') return a**b;
    else return NaN;
    
}

/** Returns the factorial of a number */
function factorial(n) {
    if (n%1!==0) return NaN;
    if (n < 0) return;
    if (n < 2) return 1;
    return n * factorial(n - 1);
}

//  CALCULATOR FUNCTIONS //
/** Solves an expression in string format */
function solveExpression(expr) {
    let exprArray = exprToArray(expr);
    return calculateExpression(exprArray);
}

/** Transforms a string into an array with numbers and operators - solves all expressions in parenthesis */
function exprToArray(expr) {
    let exprArray = []
    let i = 0, l=expr.length;

    while (i<l) {
        //if it is an operator, push to array
        if (isOperator(expr[i]) && !isNegativePrefix(expr, i)) {

            exprArray.push(expr[i]);
            i++;

        } 
        //if it is a number (negative or not), find whole number and push
        else if (!isNaN(expr[i]) || isNegativePrefix(expr, i)) { 

            let currentNum = '';
            while (!isNaN(expr[i]) || expr[i]==='.' || isNegativePrefix(expr, i)) {
                currentNum += expr[i];
                i++;
            }
            exprArray.push(+currentNum);

        } 
        //if it is a parenthesis, solve expression inside
        else if (expr[i] === '(') {

            let lastPar = findMatchingParenthesis(expr, i);
            let numberResult = solveExpression(expr.slice(i+1, lastPar));
            exprArray.push(numberResult);
            i = lastPar;

        }
        else i++;
    }
    return exprArray;
}

/** Calculates an expression inside an array - Uses P-E-MD-AS, from left to right when ambiguous */
function calculateExpression(arr) {
    const operations = [['^'],['%','×','*','/','÷'],['+','-']];

    //handles unary operations
    for (let i=0; i < arr.length; i++) {
        if (arr[i] === '!') {
            arr.splice(i-1, 2, factorial(arr[i-1]));
        }
        else if (arr[i] === '√') {
            arr.splice(i, 2, Math.sqrt(arr[i+1]));
        }
    }

    //handles binary operations
    operations.forEach(currentOps => {
        for (let i=0; i < arr.length; i++) {
            if (currentOps.includes(arr[i])) {
                arr.splice(i-1, 3, operate(arr[i-1], arr[i+1], arr[i]));
                i--;
            }
        }
    })
    return arr[0];
}