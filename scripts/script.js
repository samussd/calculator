function operate(a, b, op) {
    switch (op) {
        case "+": return a+b;
        case "-": return a-b;
        case "*": return a*b;
        case "/": return a/b;
        case "^": return a**b;
        default: return NaN;
    }
}