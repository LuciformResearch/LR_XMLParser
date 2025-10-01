import { describe, it, expect } from 'vitest';
import { LuciformXMLParser } from '../index';

describe('Recovery cap behavior', () => {
  it('stops parsing and adds summary diagnostics when maxRecoveries is exceeded', () => {
    // duplicate attribute (1 recovery), then mismatched/unclosed tags (exceed cap=1)
    const xml = '<root><a x="1" x="1"><b></root><late/></root>';
    const res = new LuciformXMLParser(xml, { mode: 'luciform-permissive', maxRecoveries: 1 }).parse();

    expect(res.recoveryReport?.capped).toBe(true);
    const codes = res.diagnostics.map((d) => d.code);
    expect(codes).toContain('RECOVERY_ATTEMPTED');
    expect(codes).toContain('PARTIAL_PARSE');

    // Late element should not be present due to early stop
    const late = res.document?.findElement('late');
    expect(late).toBeUndefined();
  });
});

