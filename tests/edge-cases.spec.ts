import { describe, it, expect } from 'vitest';
import { LuciformXMLParser } from '../index';

describe('Edge cases', () => {
  it('parses attributes and self-closing tags', () => {
    const xml = '<root><child a="1" b="two"/><other key="v">x</other></root>';
    const res = new LuciformXMLParser(xml).parse();
    expect(res.success).toBe(true);
    const child = res.document?.findElement('child');
    expect(child?.hasAttribute('a')).toBe(true);
    expect(child?.getAttribute('b')).toBe('two');
    // self-closing => no children
    expect(child?.children.length).toBe(0);
  });

  it('warns on unclosed comment and cdata (permissive)', () => {
    const xml = '<root><!-- open <x></root>';
    const res = new LuciformXMLParser(xml, { mode: 'luciform-permissive' }).parse();
    expect(res.document).toBeDefined();
    expect(res.recoveryCount).toBeGreaterThan(0);
    const codes = res.diagnostics.map(d => d.code);
    expect(codes).toContain('INVALID_COMMENT');
  });

  it('warns on unclosed CDATA (permissive)', () => {
    const xml = '<root><![CDATA[ x </root>';
    const res = new LuciformXMLParser(xml, { mode: 'luciform-permissive' }).parse();
    const codes = res.diagnostics.map(d => d.code);
    expect(codes).toContain('INVALID_CDATA');
  });

  it('errors on mismatched tags', () => {
    const xml = '<a><b></a>';
    const res = new LuciformXMLParser(xml, { mode: 'luciform-permissive' }).parse();
    const codes = res.diagnostics.map(d => d.code);
    expect(codes).toContain('MISMATCHED_TAG');
  });

  it('enforces depth and comment length limits', () => {
    const deep = '<a><b><c><d></d></c></b></a>';
    const resDepth = new LuciformXMLParser(deep, { maxDepth: 2, mode: 'luciform-permissive' }).parse();
    expect(resDepth.diagnostics.map(d => d.code)).toContain('MAX_DEPTH_EXCEEDED');

    const longComment = '<root><!-- ' + 'x'.repeat(20) + ' --></root>';
    const resComment = new LuciformXMLParser(longComment, { maxCommentLength: 5 }).parse();
    expect(resComment.diagnostics.map(d => d.code)).toContain('MAX_TEXT_LENGTH_EXCEEDED');
  });

  it('handles PI/comment limits and doctype', () => {
    const xml = '<?pi abc?><!DOCTYPE note SYSTEM "abc"><root><!--hello--></root>';
    const res = new LuciformXMLParser(xml, { maxPILength: 1, mode: 'luciform-permissive' }).parse();
    const codes = res.diagnostics.map(d => d.code);
    expect(codes).toContain('MAX_TEXT_LENGTH_EXCEEDED'); // PI length exceeded
    // Current DOCTYPE parser stores the keyword as name
    expect(res.document?.doctype?.name).toBe('DOCTYPE');
  });

  it('handles BOM and whitespace', () => {
    const xml = '\uFEFF<root>  <child a="1" >x</child> </root>';
    const res = new LuciformXMLParser(xml).parse();
    expect(res.success).toBe(true);
    expect(res.document?.root?.name).toBe('root');
  });
});
