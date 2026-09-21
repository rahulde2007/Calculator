import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculate } from '../../src/engine/evaluator';
import { tokenize } from '../../src/engine/tokenizer';
import { parseExpressionToRPN } from '../../src/engine/parser';

describe('Scientific Calculation Engine', () => {
  describe('Mathematical Constants (pi, π, e)', () => {
    it('should tokenize and evaluate pi', () => {
      const tok = tokenize('pi + 1');
      assert.equal(tok.success, true);
      if (!tok.success) return;
      assert.equal(tok.tokens[0]?.type, 'number');
      assert.equal(tok.tokens[0]?.numericValue, Math.PI);

      const parsed = parseExpressionToRPN('sin(pi)');
      assert.equal(parsed.success, true);
      if (!parsed.success) return;
      assert.equal(parsed.rpn[0]?.type, 'number');
      assert.equal(parsed.rpn[1]?.type, 'function');

      const res = calculate('pi');
      assert.equal(res.success, true);
      if (!res.success) return;
      assert.equal(res.value, 3.1415926535898);
    });

    it('should tokenize and evaluate unicode π', () => {
      const res = calculate('π');
      assert.equal(res.success, true);
      if (!res.success) return;
      assert.equal(res.value, 3.1415926535898);
    });

    it('should tokenize and evaluate Euler\'s number e', () => {
      const res = calculate('e');
      assert.equal(res.success, true);
      if (!res.success) return;
      assert.equal(res.value, 2.718281828459);
    });

    it('should evaluate expressions with constants', () => {
      const res1 = calculate('2 * pi');
      assert.equal(res1.success, true);
      if (!res1.success) return;
      assert.equal(res1.value, 6.2831853071796);

      const res2 = calculate('e + 1');
      assert.equal(res2.success, true);
      if (!res2.success) return;
      assert.equal(res2.value, 3.718281828459);
    });
  });

  describe('Trigonometric Functions (DEG, RAD, GRAD)', () => {
    it('should evaluate sin, cos, tan in DEG mode by default', () => {
      const sin0 = calculate('sin(0)');
      assert.equal(sin0.success, true);
      assert.equal(sin0.value, 0);

      const sin30 = calculate('sin(30)');
      assert.equal(sin30.success, true);
      assert.equal(sin30.value, 0.5);

      const sin90 = calculate('sin(90)');
      assert.equal(sin90.success, true);
      assert.equal(sin90.value, 1);

      const cos0 = calculate('cos(0)');
      assert.equal(cos0.success, true);
      assert.equal(cos0.value, 1);

      const cos60 = calculate('cos(60)');
      assert.equal(cos60.success, true);
      assert.equal(cos60.value, 0.5);

      const tan0 = calculate('tan(0)');
      assert.equal(tan0.success, true);
      assert.equal(tan0.value, 0);

      const tan45 = calculate('tan(45)');
      assert.equal(tan45.success, true);
      assert.equal(tan45.value, 1);
    });

    it('should cleanly normalize floating-point artifacts near zero (e.g. sin(180) = 0, cos(90) = 0)', () => {
      const sin180 = calculate('sin(180)', { angleUnit: 'deg' });
      assert.equal(sin180.success, true);
      assert.equal(sin180.value, 0);

      const sin360 = calculate('sin(360)', { angleUnit: 'deg' });
      assert.equal(sin360.success, true);
      assert.equal(sin360.value, 0);

      const cos90 = calculate('cos(90)', { angleUnit: 'deg' });
      assert.equal(cos90.success, true);
      assert.equal(cos90.value, 0);

      const cos270 = calculate('cos(270)', { angleUnit: 'deg' });
      assert.equal(cos270.success, true);
      assert.equal(cos270.value, 0);

      const tan180 = calculate('tan(180)', { angleUnit: 'deg' });
      assert.equal(tan180.success, true);
      assert.equal(tan180.value, 0);
    });

    it('should evaluate trigonometry in RAD mode', () => {
      const sinHalfPi = calculate('sin(pi / 2)', { angleUnit: 'rad' });
      assert.equal(sinHalfPi.success, true);
      assert.equal(sinHalfPi.value, 1);

      const cosPi = calculate('cos(pi)', { angleUnit: 'rad' });
      assert.equal(cosPi.success, true);
      assert.equal(cosPi.value, -1);

      const tanQuarterPi = calculate('tan(pi / 4)', { angleUnit: 'rad' });
      assert.equal(tanQuarterPi.success, true);
      assert.equal(tanQuarterPi.value, 1);
    });

    it('should evaluate trigonometry in GRAD mode', () => {
      const sin100 = calculate('sin(100)', { angleUnit: 'grad' });
      assert.equal(sin100.success, true);
      assert.equal(sin100.value, 1);

      const cos100 = calculate('cos(100)', { angleUnit: 'grad' });
      assert.equal(cos100.success, true);
      assert.equal(cos100.value, 0);

      const tan50 = calculate('tan(50)', { angleUnit: 'grad' });
      assert.equal(tan50.success, true);
      assert.equal(tan50.value, 1);
    });
  });

  describe('Inverse Trigonometric Functions (asin, acos, atan)', () => {
    it('should evaluate inverse trig in DEG mode', () => {
      const asin1 = calculate('asin(1)', { angleUnit: 'deg' });
      assert.equal(asin1.success, true);
      assert.equal(asin1.value, 90);

      const asinHalf = calculate('asin(0.5)', { angleUnit: 'deg' });
      assert.equal(asinHalf.success, true);
      assert.equal(asinHalf.value, 30);

      const acos1 = calculate('acos(1)', { angleUnit: 'deg' });
      assert.equal(acos1.success, true);
      assert.equal(acos1.value, 0);

      const acos0 = calculate('acos(0)', { angleUnit: 'deg' });
      assert.equal(acos0.success, true);
      assert.equal(acos0.value, 90);

      const atan1 = calculate('atan(1)', { angleUnit: 'deg' });
      assert.equal(atan1.success, true);
      assert.equal(atan1.value, 45);
    });

    it('should evaluate inverse trig in RAD mode', () => {
      const asin1 = calculate('asin(1)', { angleUnit: 'rad' });
      assert.equal(asin1.success, true);
      if (!asin1.success) return;
      assert.equal(asin1.value, 1.5707963267949); // pi / 2

      const atan1 = calculate('atan(1)', { angleUnit: 'rad' });
      assert.equal(atan1.success, true);
      if (!atan1.success) return;
      assert.equal(atan1.value, 0.78539816339745); // pi / 4
    });

    it('should evaluate inverse trig in GRAD mode', () => {
      const asin1 = calculate('asin(1)', { angleUnit: 'grad' });
      assert.equal(asin1.success, true);
      assert.equal(asin1.value, 100);

      const atan1 = calculate('atan(1)', { angleUnit: 'grad' });
      assert.equal(atan1.success, true);
      assert.equal(atan1.value, 50);
    });
  });

  describe('Logarithms and Exponentials (ln, log, exp)', () => {
    it('should evaluate natural log ln', () => {
      const ln1 = calculate('ln(1)');
      assert.equal(ln1.success, true);
      assert.equal(ln1.value, 0);

      const lne = calculate('ln(e)');
      assert.equal(lne.success, true);
      assert.equal(lne.value, 1);
    });

    it('should evaluate base-10 log', () => {
      const log1 = calculate('log(1)');
      assert.equal(log1.success, true);
      assert.equal(log1.value, 0);

      const log10 = calculate('log(10)');
      assert.equal(log10.success, true);
      assert.equal(log10.value, 1);

      const log1000 = calculate('log(1000)');
      assert.equal(log1000.success, true);
      assert.equal(log1000.value, 3);
    });

    it('should evaluate exponential function exp', () => {
      const exp0 = calculate('exp(0)');
      assert.equal(exp0.success, true);
      assert.equal(exp0.value, 1);

      const exp1 = calculate('exp(1)');
      assert.equal(exp1.success, true);
      if (!exp1.success) return;
      assert.equal(exp1.value, 2.718281828459);
    });
  });

  describe('Roots (sqrt, cbrt, √)', () => {
    it('should evaluate square root sqrt() and √(x)', () => {
      const sqrt0 = calculate('sqrt(0)');
      assert.equal(sqrt0.success, true);
      assert.equal(sqrt0.value, 0);

      const sqrt16 = calculate('sqrt(16)');
      assert.equal(sqrt16.success, true);
      assert.equal(sqrt16.value, 4);

      const sqrtUnicode = calculate('√(25)');
      assert.equal(sqrtUnicode.success, true);
      assert.equal(sqrtUnicode.value, 5);

      const sqrtFloat = calculate('sqrt(2)');
      assert.equal(sqrtFloat.success, true);
      if (!sqrtFloat.success) return;
      assert.equal(sqrtFloat.value, 1.4142135623731);
    });

    it('should evaluate cube root cbrt()', () => {
      const cbrt27 = calculate('cbrt(27)');
      assert.equal(cbrt27.success, true);
      assert.equal(cbrt27.value, 3);

      const cbrtNeg = calculate('cbrt(-8)');
      assert.equal(cbrtNeg.success, true);
      assert.equal(cbrtNeg.value, -2);
    });
  });

  describe('Exponentiation / Power (^) & Right-Associativity', () => {
    it('should evaluate basic powers', () => {
      const res = calculate('2 ^ 3');
      assert.equal(res.success, true);
      assert.equal(res.value, 8);

      const resFloat = calculate('4 ^ 0.5');
      assert.equal(resFloat.success, true);
      assert.equal(resFloat.value, 2);

      const resZero = calculate('0 ^ 0');
      assert.equal(resZero.success, true);
      assert.equal(resZero.value, 1);

      const resNegExp = calculate('2 ^ -2');
      assert.equal(resNegExp.success, true);
      assert.equal(resNegExp.value, 0.25);
    });

    it('should enforce right-associativity: 2^3^2 = 512 (not 64)', () => {
      // 2 ^ (3 ^ 2) = 2 ^ 9 = 512
      // Left-associative would be (2 ^ 3) ^ 2 = 8 ^ 2 = 64
      const res = calculate('2 ^ 3 ^ 2');
      assert.equal(res.success, true);
      assert.equal(res.value, 512);
    });

    it('should respect parentheses with power', () => {
      const res = calculate('(2 ^ 3) ^ 2');
      assert.equal(res.success, true);
      assert.equal(res.value, 64);
    });

    it('should evaluate power with precedence over multiplication: 2 * 3 ^ 2 = 18', () => {
      const res = calculate('2 * 3 ^ 2');
      assert.equal(res.success, true);
      assert.equal(res.value, 18);
    });

    it('should evaluate negative bases with integer powers', () => {
      const res = calculate('(-2) ^ 3');
      assert.equal(res.success, true);
      assert.equal(res.value, -8);

      const resEven = calculate('(-2) ^ 2');
      assert.equal(resEven.success, true);
      assert.equal(resEven.value, 4);
    });
  });

  describe('Factorial Operator (!)', () => {
    it('should evaluate standard factorials', () => {
      const f0 = calculate('0!');
      assert.equal(f0.success, true);
      assert.equal(f0.value, 1);

      const f1 = calculate('1!');
      assert.equal(f1.success, true);
      assert.equal(f1.value, 1);

      const f5 = calculate('5!');
      assert.equal(f5.success, true);
      assert.equal(f5.value, 120);

      const f10 = calculate('10!');
      assert.equal(f10.success, true);
      assert.equal(f10.value, 3628800);
    });

    it('should evaluate expressions combining factorial with other operators', () => {
      const resAdd = calculate('3! + 2');
      assert.equal(resAdd.success, true);
      assert.equal(resAdd.value, 8);

      const resDiv = calculate('5! / 4!');
      assert.equal(resDiv.success, true);
      assert.equal(resDiv.value, 5);

      const resMul = calculate('2 * 3!');
      assert.equal(resMul.success, true);
      assert.equal(resMul.value, 12);
    });

    it('should support chained factorials and parentheses: (3!)!', () => {
      const res = calculate('(3!)!');
      assert.equal(res.success, true);
      assert.equal(res.value, 720);
    });
  });

  describe('Nested and Composite Scientific Expressions', () => {
    it('should evaluate nested functions: sqrt(sin(90))', () => {
      const res = calculate('sqrt(sin(90))');
      assert.equal(res.success, true);
      assert.equal(res.value, 1);
    });

    it('should evaluate functions inside parentheses arithmetic: sin(30 + 60)', () => {
      const res = calculate('sin(30 + 60)');
      assert.equal(res.success, true);
      assert.equal(res.value, 1);
    });

    it('should evaluate composite expression: 2 × sin(30) + sqrt(16) + 2^3^2 + 5!', () => {
      // 2 * 0.5 + 4 + 512 + 120 = 1 + 4 + 512 + 120 = 637
      const res = calculate('2 × sin(30) + sqrt(16) + 2^3^2 + 5!');
      assert.equal(res.success, true);
      assert.equal(res.value, 637);
    });
  });

  describe('Domain and Calculation Error Handling', () => {
    it('should reject sqrt of negative number with ScientificDomainError', () => {
      const res = calculate('sqrt(-1)');
      assert.equal(res.success, false);
      if (res.success) return;
      assert.equal(res.error.code, 'ScientificDomainError');
    });

    it('should reject natural log of zero or negative numbers', () => {
      const resZero = calculate('ln(0)');
      assert.equal(resZero.success, false);
      if (resZero.success) return;
      assert.equal(resZero.error.code, 'ScientificDomainError');

      const resNeg = calculate('ln(-5)');
      assert.equal(resNeg.success, false);
      if (resNeg.success) return;
      assert.equal(resNeg.error.code, 'ScientificDomainError');
    });

    it('should reject base-10 log of zero or negative numbers', () => {
      const resZero = calculate('log(0)');
      assert.equal(resZero.success, false);
      if (resZero.success) return;
      assert.equal(resZero.error.code, 'ScientificDomainError');

      const resNeg = calculate('log(-10)');
      assert.equal(resNeg.success, false);
      if (resNeg.success) return;
      assert.equal(resNeg.error.code, 'ScientificDomainError');
    });

    it('should reject undefined tangent at vertical asymptotes', () => {
      const tan90Deg = calculate('tan(90)', { angleUnit: 'deg' });
      assert.equal(tan90Deg.success, false);
      if (tan90Deg.success) return;
      assert.equal(tan90Deg.error.code, 'ScientificDomainError');

      const tan270Deg = calculate('tan(270)', { angleUnit: 'deg' });
      assert.equal(tan270Deg.success, false);
      if (tan270Deg.success) return;
      assert.equal(tan270Deg.error.code, 'ScientificDomainError');

      const tan100Grad = calculate('tan(100)', { angleUnit: 'grad' });
      assert.equal(tan100Grad.success, false);
      if (tan100Grad.success) return;
      assert.equal(tan100Grad.error.code, 'ScientificDomainError');
    });

    it('should reject asin and acos outside [-1, 1]', () => {
      const asin2 = calculate('asin(2)');
      assert.equal(asin2.success, false);
      if (asin2.success) return;
      assert.equal(asin2.error.code, 'ScientificDomainError');

      const acosNeg2 = calculate('acos(-1.5)');
      assert.equal(acosNeg2.success, false);
      if (acosNeg2.success) return;
      assert.equal(acosNeg2.error.code, 'ScientificDomainError');
    });

    it('should reject negative and fractional factorials', () => {
      const factNeg = calculate('(-3)!');
      assert.equal(factNeg.success, false);
      if (factNeg.success) return;
      assert.equal(factNeg.error.code, 'ScientificDomainError');

      const factFraction = calculate('3.5!');
      assert.equal(factFraction.success, false);
      if (factFraction.success) return;
      assert.equal(factFraction.error.code, 'ScientificDomainError');
    });

    it('should reject negative base with fractional power (complex numbers)', () => {
      const res = calculate('(-4) ^ 0.5');
      assert.equal(res.success, false);
      if (res.success) return;
      assert.equal(res.error.code, 'ScientificDomainError');
    });

    it('should reject factorial overflow > 170! with ArithmeticOverflow', () => {
      const res = calculate('171!');
      assert.equal(res.success, false);
      if (res.success) return;
      assert.equal(res.error.code, 'ArithmeticOverflow');
    });

    it('should reject power overflow with ArithmeticOverflow', () => {
      const res = calculate('10 ^ 400');
      assert.equal(res.success, false);
      if (res.success) return;
      assert.equal(res.error.code, 'ArithmeticOverflow');
    });
  });

  describe('Syntax Validation for Scientific Notation', () => {
    it('should reject function without parentheses', () => {
      const res = calculate('sin 30');
      assert.equal(res.success, false);
      if (res.success) return;
      assert.equal(res.error.code, 'SyntaxError');
    });

    it('should reject trailing function name', () => {
      const res = calculate('sin');
      assert.equal(res.success, false);
      if (res.success) return;
      assert.equal(res.error.code, 'SyntaxError');
    });

    it('should reject unexpected postfix operator at start of expression', () => {
      const res = calculate('!5');
      assert.equal(res.success, false);
      if (res.success) return;
      assert.equal(res.error.code, 'SyntaxError');
    });

    it('should reject unexpected postfix operator following binary operator', () => {
      const res = calculate('5 + !');
      assert.equal(res.success, false);
      if (res.success) return;
      assert.equal(res.error.code, 'SyntaxError');
    });

    it('should reject missing operator between factorial and number', () => {
      const res = calculate('5! 3');
      assert.equal(res.success, false);
      if (res.success) return;
      assert.equal(res.error.code, 'SyntaxError');
    });

    it('should reject unknown identifier', () => {
      const res = calculate('foobar(5)');
      assert.equal(res.success, false);
      if (res.success) return;
      assert.equal(res.error.code, 'SyntaxError');
    });
  });
});
