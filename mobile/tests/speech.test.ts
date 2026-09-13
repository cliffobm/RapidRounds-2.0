import {describe,expect,it,vi} from 'vitest';
import {createSpeechController,speechChunks,type SpeechDriver} from '../lib/speech-controller';
function fixture(stop:()=>void|Promise<void>=()=>{}){
  const spoken:{text:string;options:Parameters<SpeechDriver['speak']>[1]}[]=[];
  const driver:SpeechDriver={maxInputLength:8,stop:vi.fn(stop),speak:(text,options)=>{spoken.push({text,options});}};
  return {reading:createSpeechController(driver),spoken,driver};
}
describe('speech ownership and cancellation',()=>{
  it('reads chunks in order, ignoring duplicate completion callbacks',async()=>{
    const f=fixture();await f.reading.read('lesson','one two three four',.8);
    expect(f.spoken[0].text).toBe('one two ');expect(f.spoken[0].options.rate).toBe(.8);
    f.spoken[0].options.onDone();f.spoken[0].options.onDone();
    expect(f.spoken).toHaveLength(2);f.spoken[1].options.onDone();f.spoken[2].options.onDone();
    expect(f.spoken.map(x=>x.text).join('')).toBe('one two three four');
    expect(f.reading.getSnapshot().status).toBe('idle');
  });
  it('does not start queued speech after an immediate stop',async()=>{
    const f=fixture();const read=f.reading.read('question','some text',1);const stop=f.reading.stop();
    await Promise.all([read,stop]);expect(f.spoken).toHaveLength(0);expect(f.reading.getSnapshot().status).toBe('idle');
  });
  it('does not restart an old owner after an asynchronous native stop',async()=>{
    let release!:()=>void;let calls=0;
    const f=fixture(()=>++calls===1?new Promise<void>(resolve=>{release=resolve;}):Promise.resolve());
    const first=f.reading.read('first','old text',1);await Promise.resolve();
    const second=f.reading.read('second','new text',1);release();await Promise.all([first,second]);
    expect(f.spoken.map(x=>x.text)).toEqual(['new text']);expect(f.reading.getSnapshot().owner).toBe('second');
  });
  it('ignores late callbacks and cleanup from the previous reader',async()=>{
    const f=fixture();await f.reading.read('first','old text',1);const old=f.spoken[0].options;
    await f.reading.read('second','new text',1);await f.reading.stop('first');
    old.onError();old.onStopped();old.onDone();
    expect(f.reading.getSnapshot()).toEqual({owner:'second',status:'reading',error:null});expect(f.spoken).toHaveLength(2);
  });
  it('stops all pending chunks during navigation',async()=>{
    const f=fixture();await f.reading.read('first','one two three four',1);
    await f.reading.stop();f.spoken[0].options.onDone();expect(f.spoken).toHaveLength(1);
    expect(f.reading.getSnapshot().status).toBe('idle');
  });
  it('surfaces a stop failure and allows a later retry',async()=>{
    let fail=true;const f=fixture(async()=>{if(fail)throw new Error('engine unavailable');});
    await f.reading.read('first','hello',1);expect(f.reading.getSnapshot().status).toBe('error');expect(f.spoken).toHaveLength(0);
    fail=false;await f.reading.read('first','hello',1);expect(f.reading.getSnapshot().status).toBe('reading');expect(f.spoken).toHaveLength(1);
  });
  it('does not let a stale failure overwrite a new owner',async()=>{
    let reject!:()=>void;let calls=0;
    const f=fixture(()=>++calls===1?new Promise<void>((_,fail)=>{reject=()=>fail(new Error('old failure'));}):Promise.resolve());
    const first=f.reading.read('first','old',1);await Promise.resolve();
    const second=f.reading.read('second','new',1);reject();await Promise.all([first,second]);
    expect(f.reading.getSnapshot()).toEqual({owner:'second',status:'reading',error:null});
  });
  it('handles current playback errors without continuing to the next chunk',async()=>{
    const f=fixture();await f.reading.read('first','one two three four',1);
    f.spoken[0].options.onError();f.spoken[0].options.onDone();expect(f.reading.getSnapshot().status).toBe('error');expect(f.spoken).toHaveLength(1);
  });
  it('retains stable snapshots and unsubscribes listeners',async()=>{
    const f=fixture();const listener=vi.fn();const unsubscribe=f.reading.subscribe(listener);
    const snapshot=f.reading.getSnapshot();expect(snapshot).toBe(f.reading.getSnapshot());
    await f.reading.read('first','hello',1);expect(listener).toHaveBeenCalledTimes(1);unsubscribe();
    await f.reading.stop();expect(listener).toHaveBeenCalledTimes(1);
  });
});
describe('speech text limits',()=>{
  it('preserves text and surrogate pairs within an engine limit',()=>{
    const text='abcd🙂efgh🙂jklm '+ 'word '.repeat(40);const chunks=speechChunks(text,5);
    expect(chunks.join('')).toBe(text);expect(chunks.every(x=>x.length<=5)).toBe(true);
    expect(chunks.every(x=>!/[\uD800-\uDBFF]$/.test(x)&&!/^[\uDC00-\uDFFF]/.test(x))).toBe(true);
  });
  it('uses a conservative limit when the engine allows very long input',()=>{
    expect(speechChunks('x'.repeat(4000),Number.MAX_VALUE).map(x=>x.length)).toEqual([1500,1500,1000]);
    expect(speechChunks('')).toEqual([]);
  });
});
