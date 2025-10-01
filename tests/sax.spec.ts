import { describe, it, expect } from 'vitest';
import { LuciformSAX } from '../sax';

describe('LuciformSAX', () => {
  it('emits start/end/text events in order with attributes', () => {
    const xml = '<root><child a="1">x</child></root>';
    const events: string[] = [];
    new LuciformSAX(xml, {
      onStartElement: (name, attrs) => events.push(`start:${name}:${attrs.get('a') ?? ''}`),
      onText: (t) => events.push(`text:${t}`),
      onEndElement: (name) => events.push(`end:${name}`),
    }).run();
    expect(events).toEqual([
      'start:root:',
      'start:child:1',
      'text:x',
      'end:child',
      'end:root',
    ]);
  });

  it('emits closed flag for unclosed CDATA, closed comment', () => {
    const xml = '<root><!-- ok --><![CDATA[chunk</root>';
    const seen: { comment?: boolean; cdata?: boolean } = {};
    new LuciformSAX(xml, {
      onComment: (_t, closed) => (seen.comment = closed),
      onCDATA: (_t, closed) => (seen.cdata = closed),
    }).run();
    expect(seen.comment).toBe(true);
    expect(seen.cdata).toBe(false);
  });

  it('emits PI and Doctype events', () => {
    const xml = '<?pi test?><!DOCTYPE note SYSTEM "id"><root/>';
    const seen: { pi?: string; dt?: string } = {};
    new LuciformSAX(xml, {
      onPI: (content) => (seen.pi = content),
      onDoctype: (content) => (seen.dt = content),
    }).run();
    expect(seen.pi).toContain('pi test');
    expect(seen.dt?.toUpperCase()).toContain('DOCTYPE');
  });
});
