import {describe,expect,it,vi} from 'vitest';
import {createChunkedAuthStorage} from '../lib/auth-storage';

function setup(){
  const values=new Map<string,string>();let generation=0;
  const secure={getItem:vi.fn(async(key:string)=>values.get(key)??null),setItem:vi.fn(async(key:string,value:string)=>{values.set(key,value);}),removeItem:vi.fn(async(key:string)=>{values.delete(key);})};
  return {values,secure,storage:createChunkedAuthStorage(secure,()=>`generation-${++generation}`)};
}
describe('secure session chunk storage',()=>{
  it('round trips long Unicode sessions without splitting surrogate pairs or exceeding native item sizes',async()=>{
    const test=setup();const value=JSON.stringify({token:'x'.repeat(5500),metadata:'🩺日本語'.repeat(500)});await test.storage.setItem('auth',value);
    expect(await test.storage.getItem('auth')).toBe(value);
    for(const [key,chunk] of test.values){if(key.endsWith('.manifest'))continue;expect(new TextEncoder().encode(chunk).length).toBeLessThan(2048);expect(chunk.isWellFormed()).toBe(true);}
  });
  it('supports empty values and isolates independent keys',async()=>{const test=setup();await Promise.all([test.storage.setItem('a',''),test.storage.setItem('b','saved')]);expect(await test.storage.getItem('a')).toBe('');expect(await test.storage.getItem('b')).toBe('saved');});
  it('commits a new manifest only after chunks exist and removes the previous generation',async()=>{
    const test=setup();await test.storage.setItem('auth','old');await test.storage.setItem('auth','new'.repeat(500));expect(await test.storage.getItem('auth')).toBe('new'.repeat(500));
    expect([...test.values.keys()].some(key=>key.includes('.generation-1.'))).toBe(false);expect(test.secure.setItem.mock.calls.at(-1)?.[0]).toBe('auth.manifest');
  });
  it('preserves the previous readable value if writing a replacement chunk fails',async()=>{
    const test=setup();await test.storage.setItem('auth','original');test.secure.setItem.mockImplementation(async(key,value)=>{if(key==='auth.generation-2.1')throw new Error('Storage full');test.values.set(key,value);});
    await expect(test.storage.setItem('auth','x'.repeat(1000))).rejects.toThrow('Storage full');expect(await test.storage.getItem('auth')).toBe('original');expect([...test.values.keys()].some(key=>key.includes('.generation-2.'))).toBe(false);
  });
  it('preserves the old value when the replacement manifest cannot be committed',async()=>{
    const test=setup();await test.storage.setItem('auth','original');test.secure.setItem.mockImplementation(async(key,value)=>{if(key==='auth.manifest')throw new Error('Manifest denied');test.values.set(key,value);});
    await expect(test.storage.setItem('auth','replacement')).rejects.toThrow('Manifest denied');expect(await test.storage.getItem('auth')).toBe('original');
  });
  it('serializes reads and replacements for the same key',async()=>{
    const test=setup();await test.storage.setItem('auth','first');const writes=[test.storage.setItem('auth','second'),test.storage.getItem('auth'),test.storage.setItem('auth','third'),test.storage.getItem('auth')];
    expect(await Promise.all(writes)).toEqual([undefined,'second',undefined,'third']);
  });
  it.each(['not json','{}','{"generation":"../../bad","count":1}','{"generation":"ok","count":0}','{"generation":"ok","count":257}'])('refuses an invalid manifest %s',async raw=>{
    const test=setup();test.values.set('auth.manifest',raw);await expect(test.storage.getItem('auth')).rejects.toThrow();await test.storage.removeItem('auth');expect(await test.storage.getItem('auth')).toBeNull();
  });
  it('fails explicitly if a committed session is missing a chunk',async()=>{const test=setup();await test.storage.setItem('auth','x'.repeat(1000));test.values.delete('auth.generation-1.1');await expect(test.storage.getItem('auth')).rejects.toThrow('incomplete');});
  it('prevents a session from being restored after deletion and clears its chunks',async()=>{const test=setup();await test.storage.setItem('auth','x'.repeat(1000));await test.storage.removeItem('auth');expect(test.values.size).toBe(0);expect(await test.storage.getItem('auth')).toBeNull();});
  it('reports deletion failures even though removing the manifest prevents restoration',async()=>{
    const test=setup();await test.storage.setItem('auth','saved');test.secure.removeItem.mockImplementation(async key=>{if(key.includes('.generation-'))throw new Error('Delete denied');test.values.delete(key);});
    await expect(test.storage.removeItem('auth')).rejects.toThrow('Delete denied');expect(await test.storage.getItem('auth')).toBeNull();
  });
  it('rejects oversized sessions without changing saved data',async()=>{const test=setup();await test.storage.setItem('auth','saved');await expect(test.storage.setItem('auth','x'.repeat(450*256+1))).rejects.toThrow('too large');expect(await test.storage.getItem('auth')).toBe('saved');});
});
