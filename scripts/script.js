const displayText = document.querySelector('.display__text');
const buttons = document.querySelectorAll('.button');

let expressionText = '';

buttons.forEach(n => {n.addEventListener("click", function(e) {
        btn = e.target;
        if (btn.dataset.value === '='){
            let result = solveExpression(expressionText);
            expressionText = result;
        }
        else if (btn.dataset.value === 'C') {
            expressionText = expressionText.slice(0,-1);
        }
        else if (btn.dataset.value === 'CE') {
            expressionText = '';
        }
        else {
            expressionText += btn.dataset.value;
        }
        updateDisplay();
    });
});


function updateDisplay() {
    displayText.textContent = expressionText;
}

// SUPORT FUNCTIONS //
/** Returns true if character is an operator */
const isOperator = char => ['√','!','^','%','/','*','+','-'].includes(char);

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
    switch (op) {
        case "+": return a+b;
        case "-": return a-b;
        case "*": return a*b;
        case "/": return a/b;
        case "%": return a%b;
        case "^": return a**b;
        default: return NaN;
    }
}

/** Returns the factorial of a number */
function factorial(n) {
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
        if (isOperator(expr[i])) {      //if it is an operator, push to array

            exprArray.push(expr[i]);
            i++;

        }
        else if (!isNaN(expr[i])) {     //if it is a number, find whole number and push

            let currentNum = '';
            while (!isNaN(expr[i]) || expr[i]==='.') {
                currentNum += expr[i];
                i++;
            }
            exprArray.push(+currentNum);

        } 
        else if (expr[i] === '(') {     //if it is a parenthesis, solve expression inside

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
    const operations = [['^'],['%','*',"/"],["+","-"]];

    //handles unary operations
    for (let i=0; i < arr.length; i++) {
        if (arr[i] === '!') {
            arr.splice(i, 2, factorial(arr[i+1]));
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