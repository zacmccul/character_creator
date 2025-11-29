/**
 * Formula Evaluator
 * Safely evaluates math expressions with attribute references
 */

import type { Attributes } from '@/types/character.types';

/**
 * Evaluate a formula string with attribute values
 * Supports: +, -, *, /, (), attribute IDs (STR, DEX, INT, WIS, CHA)
 * Returns integer result (rounded down), minimum 0
 * 
 * Examples:
 * - "STR" -> value of STR attribute
 * - "DEX * 2" -> DEX attribute times 2
 * - "INT + WIS" -> sum of INT and WIS
 * - "(STR + DEX) / 2" -> average of STR and DEX
 */
export const evaluateFormula = (formula: string, attributes: Attributes): number => {
  try {
    // Replace attribute IDs with their values
    let expression = formula;
    
    // Replace each attribute reference with its value
    for (const [key, value] of Object.entries(attributes)) {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      expression = expression.replace(regex, String(value));
    }

    // Validate that expression only contains safe characters
    if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
      console.error(`Invalid characters in formula: ${formula}`);
      return 0;
    }

    // Evaluate the expression safely
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${expression})`)();

    // Ensure result is a number, floor it, and ensure minimum of 0
    const numResult = Number(result);
    if (isNaN(numResult)) {
      console.error(`Formula evaluation resulted in NaN: ${formula}`);
      return 0;
    }

    return Math.max(0, Math.floor(numResult));
  } catch (error) {
    console.error(`Error evaluating formula "${formula}":`, error);
    return 0;
  }
};

/**
 * Validate that a formula string is syntactically correct
 * Returns true if valid, false otherwise
 */
export const validateFormula = (formula: string, attributes: Attributes): boolean => {
  try {
    evaluateFormula(formula, attributes);
    return true;
  } catch {
    return false;
  }
};

/**
 * Extract attribute IDs referenced in a formula
 * Returns array of attribute keys (e.g., ["STR", "DEX"])
 */
export const extractAttributeReferences = (formula: string): string[] => {
  const attributeIds = ['STR', 'DEX', 'INT', 'WIS', 'CHA'];
  const referenced: string[] = [];

  for (const attrId of attributeIds) {
    const regex = new RegExp(`\\b${attrId}\\b`);
    if (regex.test(formula)) {
      referenced.push(attrId);
    }
  }

  return referenced;
};
