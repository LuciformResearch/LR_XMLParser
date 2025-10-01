import { describe, it, expect } from 'vitest';
import { LuciformXMLScanner } from '../scanner';

describe('LuciformXMLScanner', () => {
  it('tokenizes text, start/end tags, and text content', () => {
    const s = new LuciformXMLScanner('<root>a<!--c-->b<![CDATA[x]]></root>');
    const types: string[] = [];
    for (let t = s.next(); t; t = s.next()) types.push(t.type);
    expect(types).toContain('StartTag');
    expect(types).toContain('Text');
    expect(types).toContain('Comment');
    expect(types).toContain('CDATA');
    expect(types).toContain('EndTag');
  });
});

