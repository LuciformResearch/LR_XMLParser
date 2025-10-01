import { describe, it, expect } from 'vitest';
import { LuciformXMLParser } from '../index';

describe('Recovery report details', () => {
  it('includes codes and notes when cap exceeded', () => {
    const xml = '<r><a x=1 x=2><b></r>';
    const res = new LuciformXMLParser(xml, { mode: 'luciform-permissive', maxRecoveries: 1 }).parse();
    expect(res.recoveryReport?.capped).toBe(true);
    const codes = res.recoveryReport?.codes || [];
    expect(codes.length).toBeGreaterThan(0);
    // Expect at least one of the known recovery codes
    expect(codes.some((c) => ['DUPLICATE_ATTRIBUTE', 'ATTR_NO_VALUE', 'MISMATCHED_TAG', 'UNCLOSED_TAG'].includes(c))).toBe(true);
    const notes = res.recoveryReport?.notes || [];
    expect(notes.length).toBeGreaterThan(0);
  });
});

