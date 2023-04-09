const displayTextTop = document.querySelector('.display__top-text');
const displayTextBot = document.querySelector('.display__bot-text');
const errorMsg = document.querySelector('.main__error-msg');

const buttons = document.querySelectorAll('.button');

let mode = 'quick';

let savedNum = '';
let operator = '';
let inputNum = '';
let expression = '';
let equalOperatorDisplay = '';

/** Handles logic for the 'quick' mode; 
 * You can only have one operation happening at a time on your display. 
 * Every time an operator is pressed, it performs the current operation 
 * and saves the result for the next one.
*/
function quickCalc(e) {
    let btn = e.target;
    let pressed = btn.dataset.value;
    
    //basic number input logic
    if (!isNaN(pressed)) {
        if (pressed!=='0' && inputNum==='0') inputNum = pressed;
        else if (inputNum!=='0') inputNum += pressed;
        
    }
    else if (pressed === '.') {
        if (!inputNum.includes('.')) inputNum += (inputNum) ? '.' : '0.';

    }
    else if (pressed === '+-') {
        if (inputNum.charAt(0)==='-') inputNum = inputNum.slice(1);
            else if (+inputNum!==0) inputNum = '-' + inputNum;

    }
    //the sqrt, factorial and percent operations are performed directly on the input number
    else if (pressed === '√' && inputNum) {
        if (!savedNum) equalOperatorDisplay = `√${inputNum} =`;
        inputNum = getSqrt(+inputNum).toString();

    }
    else if (pressed === '!' && inputNum) {
        if (!savedNum) equalOperatorDisplay = `${inputNum}! =`;
        inputNum = factorial(+inputNum).toString();

    }
    else if (pressed === '%' && inputNum) { // 50+10%=55; 50x10%=5
        if (!savedNum) {
            equalOperatorDisplay = `${inputNum}% =`;
            inputNum = (inputNum/100).toString();
        }
        else if (['×','*','+','-'].includes(operator)) {
            equalOperatorDisplay = `${savedNum} ${operator} ${inputNum}% =`;
            if (operator==='-') inputNum = +savedNum - (+inputNum/100)*+savedNum;
            if (operator==='+') inputNum = +savedNum + (+inputNum/100)*+savedNum;
            if (operator==='×'||operator==='*') inputNum = (+inputNum/100)*+savedNum;
        }

    }
    //calculate expression and save it for the next operation, update operator
    else if (['^','×','/','+','-'].includes(pressed) && (savedNum || inputNum)) {
        if (savedNum && operator && inputNum) {
            savedNum = operate(+savedNum, +inputNum, operator).toString();
            inputNum = '';
        }
        else if (!operator){
            savedNum = inputNum;
            inputNum = '';
        }
        operator = pressed;

    }
    //calculate expression and display result, reset operator
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

/** Handles logic for the 'expression' mode; 
 * You can type a longer expression with multiple operators, including parentheses. 
 * The expression is evaluated once you click the '=' button.
*/
function expressionCalc(e) {
    let btn = e.target;
    let pressed = btn.dataset.value;
    
    if (!isNaN(pressed)) {
        if (pressed!=='0' && inputNum==='0') inputNum = pressed;
        else if (inputNum!=='0') inputNum += pressed;
        
    }
    else if (pressed === '.') {;
        if (!inputNum.includes('.')) inputNum += (inputNum) ? '.' : '0.';

    }
    else if (pressed === '+-') {
        if (inputNum.charAt(0)==='-') inputNum = inputNum.slice(1);
            else if (+inputNum!==0) inputNum = '-' + inputNum;

    }
    else if (pressed === '√') {
        if (inputNum) {
            expression += '√';
            expression += inputNum;
            inputNum = '';
        }
        else expression += '√';

    }
    else if (pressed === '!') {
        if (inputNum) {
            expression += inputNum;
            expression += '!';
            inputNum = '';
        }
        else expression += '!';

    }
    else if (pressed === '%') {
        if (inputNum) {
            expression += inputNum;
            expression += '%';
            inputNum = '';
        }
        else expression += '%';

    }
    else if (pressed === ')') {
        expression += inputNum;
        expression += pressed;
        inputNum = '';
    }
    else if (pressed === '(') {
        let lastChar = (expression+inputNum).slice(-1);
        expression += inputNum;
        if (inputNum && (['!','%',')'].includes(lastChar) || !isNaN(lastChar)) ) expression += '×';
        expression += pressed;
        inputNum = '';
    }
    else if (['^','×','/','+','-','('].includes(pressed)) {
        let lastChar = (expression+inputNum).slice(-1);
        if (!['^','×','/','+','-','('].includes(lastChar)) {
            expression += inputNum;
            expression += pressed;
            inputNum = '';
        }
    }
    else if (pressed === '=') {
        expression += inputNum;
        equalOperatorDisplay = `${beautifyExpression(expression)} =`
        inputNum = solveExpression(expression.replace(/\s+/g, '')).toString();
        expression = '';
    }
    else if (pressed === 'C') {
        if (inputNum) inputNum = inputNum.slice(0,-1);
        else expression = expression.slice(0,-1);

    }
    else if (pressed === 'CE') {
        inputNum = '';
        expression = '';
    }


    if (equalOperatorDisplay) {
        displayTextTop.textContent = equalOperatorDisplay;
        equalOperatorDisplay = '';
    }
    else {
        displayTextTop.textContent = beautifyExpression(expression) + inputNum;
    }
    displayTextBot.textContent = (inputNum) ? inputNum : '0';
}

/** Add spaces around operators, unless it is a negation operator */
const beautifyExpression = str => {
    let result = '';
    
    for (let i = 0; i < str.length; i++) {
        if (['^','×','/','+','-'].includes(str[i])) {
            if (isNegationOp(str,i)) result += ` ${str[i]}`;
            else result += ` ${str[i]} `;
        } else {
            result += str[i];
        }
    }

    return result;
}

buttons.forEach(n => n.addEventListener("click", e => {
    errorMsg.textContent = '';
    try {
        if (mode==='quick') quickCalc(e);
        else if (mode==='expression') expressionCalc(e);

    } catch (e) {
        if (mode==='quick') {
            errorMsg.textContent = `ERROR: ${e.message}`;
            savedNum = '';
            operator = '';
            inputNum = '';
            equalOperatorDisplay = '';
            displayTextBot.textContent = 'ERROR';
            displayTextTop.textContent = '';
        }
        else if (mode==='expression') {
            errorMsg.textContent = `ERROR: ${e.message}`;
            equalOperatorDisplay = '';
            inputNum = '';
        }
    }
}));



// SUPORT FUNCTIONS //
/** Returns true if character is an operator */
const isOperator = char => ['√','!','^','%','÷','/','×','*','+','-'].includes(char);

/** Returns true if it is a negation operator */
const isNegationOp = (expr, i) => {
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

    throw new Error('Invalid expression')
};

/** Performs a basic operations between two numbers */
function operate(a, b, op) {
    if (op==='+') return a+b;
    else if (op==='-') return a-b;
    else if (op==='×'||op==='*') return a*b;
    else if (op==='÷'||op==='/') {
        if (b!==0) return a/b;
        else throw new Error('Tried to divide by 0')
    }
    else if (op==='%') return a%b;
    else if (op==='^') return a**b;
    else return NaN;
    
}

/** Returns the factorial of a number */
function factorial(n) {
    if (n%1!==0) throw new Error('Tried to find factorial of a decimal number');
    if (n < 0) throw new Error('Tried to find factorial of a negative number');
    if (n < 2) return 1;
    return n * factorial(n - 1);
}

/** Calculates sqrt, throws error if recieves negative number */
function getSqrt(n) {
    if (n<0) throw new Error('Tried to find square root of a negative number')
    return Math.sqrt(n);
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
        if (isOperator(expr[i]) && !isNegationOp(expr, i)) {

            exprArray.push(expr[i]);
            i++;

        } 
        //if it is a number (negative or not), find whole number and push
        else if (!isNaN(expr[i]) || isNegationOp(expr, i)) { 

            let currentNum = '';
            while (!isNaN(expr[i]) || expr[i]==='.' || isNegationOp(expr, i)) {
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
    const operations = [['^'],['×','*','/','÷'],['+','-']];

    //handles unary operations
    for (let i=0; i < arr.length; i++) {
        if (arr[i] === '!') {
            arr.splice(i-1, 2, factorial(arr[i-1]));
        }
        else if (arr[i] === '√') {
            arr.splice(i, 2, getSqrt(arr[i+1]));
        }
        else if (arr[i] === '%') {
            arr.splice(i-1, 2, arr[i-1]/100);
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