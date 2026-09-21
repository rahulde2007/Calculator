import type { AngleUnit } from '../types/calculator';

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const GRAD_TO_RAD = Math.PI / 200;
const RAD_TO_GRAD = 200 / Math.PI;

/**
 * Converts an angle value from the specified unit to radians.
 */
export function toRadians(angle: number, unit: AngleUnit): number {
  switch (unit) {
    case 'deg':
      return angle * DEG_TO_RAD;
    case 'grad':
      return angle * GRAD_TO_RAD;
    case 'rad':
    default:
      return angle;
  }
}

/**
 * Converts a radian angle result to the target angle unit.
 */
export function fromRadians(radians: number, unit: AngleUnit): number {
  switch (unit) {
    case 'deg':
      return radians * RAD_TO_DEG;
    case 'grad':
      return radians * RAD_TO_GRAD;
    case 'rad':
    default:
      return radians;
  }
}

/**
 * Cleans near-zero trigonometric floating-point artifacts (e.g., sin(180°) = 1.22e-16 -> 0).
 */
export function cleanTrigValue(val: number): number {
  if (Math.abs(val) < 1e-15) {
    return 0;
  }
  return val;
}

/**
 * Checks whether an angle corresponds to a vertical asymptote for tangent
 * (where cos(angle) = 0).
 */
export function isTangentUndefined(angle: number, unit: AngleUnit): boolean {
  if (unit === 'deg') {
    // In degrees, undefined at 90 + 180*k (e.g. 90, 270, -90)
    const normalized = ((Math.abs(angle) % 180) + 180) % 180;
    if (Math.abs(normalized - 90) < 1e-10) return true;
  }

  if (unit === 'grad') {
    // In gradians, undefined at 100 + 200*k (e.g. 100, 300, -100)
    const normalized = ((Math.abs(angle) % 200) + 200) % 200;
    if (Math.abs(normalized - 100) < 1e-10) return true;
  }

  // Check cosine near-zero in radians
  const rad = toRadians(angle, unit);
  if (Math.abs(Math.cos(rad)) < 1e-14) {
    return true;
  }

  return false;
}
