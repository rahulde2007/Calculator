import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { tokenize } from '../../src/engine/tokenizer';

describe('Tokenizer', () => {
  it('should tokenize basic integers and operators', () => {
    const res = tokenize('2+3');
    assert.equal(res.success, true);
    if (!res.success) return;
    assert.equal(res.tokens.length, 3);
    assert.deepEqual(res.tokens[0], { type: 'number', value: '2', position: 0, numericValue: 2 });
    assert.deepEqual(res.tokens[1], { type: 'binary-operator', value: '+', position: 1 });
    assert.deepEqual(res.tokens[2], { type: 'number', value: '3', position: 2, numericValue: 3 });
  });

  it('should tokenize floating point numbers with decimals', () => {
    const res = tokenize('12.5 * 4');
    assert.equal(res.success, true);
    if (!res.success) return;
    assert.equal(res.tokens.length, 3);
    assert.equal(res.tokens[0]?.numericValue, 12.5);
    assert.equal(res.tokens[1]?.value, '*');
    assert.equal(res.tokens[2]?.numericValue, 4);
  });

  it('should support leading decimal numbers like .5', () => {
    const res = tokenize('.5 + 1');
    assert.equal(res.success, true);
    if (!res.success) return;
    assert.equal(res.tokens[0]?.numericValue, 0.5);
    assert.equal(res.tokens[0]?.value, '.5');
  });

  it('should support trailing decimal numbers like 5.', () => {
    const res = tokenize('5.');
    assert.equal(res.success, true);
    if (!res.success) return;
    assert.equal(res.tokens[0]?.numericValue, 5);
    assert.equal(res.tokens[0]?.value, '5.');
  });

  it('should normalize alternate operator glyphs (×, ÷, −)', () => {
    const res = tokenize('10 × 2 ÷ 5 − 1');
    assert.equal(res.success, true);
    if (!res.success) return;
    assert.equal(res.tokens[1]?.value, '*');
    assert.equal(res.tokens[3]?.value, '/');
    assert.equal(res.tokens[5]?.value, '-');
  });

  it('should identify unary minus at the start of an expression', () => {
    const res = tokenize('-5 + 3');
    assert.equal(res.success, true);
    if (!res.success) return;
    assert.equal(res.tokens[0]?.type, 'unary-operator');
    assert.equal(res.tokens[0]?.value, 'u-');
  });

  it('should identify unary minus following an operator', () => {
    const res = tokenize('10 * -2');
    assert.equal(res.success, true);
    if (!res.success) return;
    assert.equal(res.tokens[1]?.type, 'binary-operator');
    assert.equal(res.tokens[1]?.value, '*');
    assert.equal(res.tokens[2]?.type, 'unary-operator');
    assert.equal(res.tokens[2]?.value, 'u-');
  });

  it('should identify unary minus inside parentheses: (-3)', () => {
    const res = tokenize('(-3)');
    assert.equal(res.success, true);
    if (!res.success) return;
    assert.equal(res.tokens[0]?.type, 'left-paren');
    assert.equal(res.tokens[1]?.type, 'unary-operator');
    assert.equal(res.tokens[1]?.value, 'u-');
    assert.equal(res.tokens[2]?.numericValue, 3);
    assert.equal(res.tokens[3]?.type, 'right-paren');
  });

  it('should identify binary minus followed by unary minus: 2--3', () => {
    const res = tokenize('2--3');
    assert.equal(res.success, true);
    if (!res.success) return;
    assert.equal(res.tokens[0]?.numericValue, 2);
    assert.equal(res.tokens[1]?.type, 'binary-operator');
    assert.equal(res.tokens[1]?.value, '-');
    assert.equal(res.tokens[2]?.type, 'unary-operator');
    assert.equal(res.tokens[2]?.value, 'u-');
    assert.equal(res.tokens[3]?.numericValue, 3);
  });

  it('should handle chained unary minus: --5', () => {
    const res = tokenize('--5');
    assert.equal(res.success, true);
    if (!res.success) return;
    assert.equal(res.tokens[0]?.type, 'unary-operator');
    assert.equal(res.tokens[1]?.type, 'unary-operator');
    assert.equal(res.tokens[2]?.numericValue, 5);
  });

  it('should handle unary minus before parentheses: -(2+3)', () => {
    const res = tokenize('-(2+3)');
    assert.equal(res.success, true);
    if (!res.success) return;
    assert.equal(res.tokens[0]?.type, 'unary-operator');
    assert.equal(res.tokens[1]?.type, 'left-paren');
  });

  it('should tokenize modulo operator %', () => {
    const res = tokenize('10 % 3');
    assert.equal(res.success, true);
    if (!res.success) return;
    assert.equal(res.tokens[1]?.type, 'binary-operator');
    assert.equal(res.tokens[1]?.value, '%');
  });

  it('should ignore unary plus: +5', () => {
    const res = tokenize('+5 + 2');
    assert.equal(res.success, true);
    if (!res.success) return;
    assert.equal(res.tokens[0]?.numericValue, 5);
    assert.equal(res.tokens[1]?.value, '+');
  });

  it('should return error for empty or whitespace-only expressions', () => {
    const res1 = tokenize('');
    assert.equal(res1.success, false);
    assert.equal(res1.error?.code, 'InvalidExpression');

    const res2 = tokenize('    ');
    assert.equal(res2.success, false);
    assert.equal(res2.error?.code, 'InvalidExpression');
  });

  it('should return error for multiple decimal points in a number: 1.2.3', () => {
    const res = tokenize('1.2.3');
    assert.equal(res.success, false);
    assert.equal(res.error?.code, 'SyntaxError');
  });

  it('should return error for isolated decimal point: .', () => {
    const res = tokenize('.');
    assert.equal(res.success, false);
    assert.equal(res.error?.code, 'SyntaxError');
  });

  it('should return error for unexpected characters: 2 + $', () => {
    const res = tokenize('2 + $');
    assert.equal(res.success, false);
    assert.equal(res.error?.code, 'InvalidExpression');
  });

  it('should return error for unexpected binary operator in unary position: * 5', () => {
    const res = tokenize('* 5');
    assert.equal(res.success, false);
    assert.equal(res.error?.code, 'SyntaxError');
  });
});
