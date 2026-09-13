export interface AuthStorage {
  getItem(key:string):Promise<string|null>;
  setItem(key:string,value:string):Promise<void>;
  removeItem(key:string):Promise<void>;
}

type Manifest={generation:string;count:number};
function manifest(raw:string|null):Manifest|null {
  if(raw===null)return null;
  const value:unknown=JSON.parse(raw);
  if(!value||typeof value!=='object')throw new Error('Saved sign-in data could not be read.');
  const {generation,count}=value as Manifest;
  if(typeof generation!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(generation)||!Number.isInteger(count)||count<1||count>256)throw new Error('Saved sign-in data could not be read.');
  return {generation,count};
}

/** Serialize each key, including reads, so replacing chunks cannot race a reader.
 * A manifest commits last. A failed write leaves the previous value readable.
 * 450 UTF-16 code units remain below the native 2 KB limit even for Unicode. */
export function createChunkedAuthStorage(secure:AuthStorage,newGeneration:()=>string):AuthStorage {
  const queues=new Map<string,Promise<unknown>>();
  function locked<T>(key:string,work:()=>Promise<T>):Promise<T>{
    const result=(queues.get(key)??Promise.resolve()).catch(()=>{}).then(work);
    queues.set(key,result);
    void result.then(()=>{if(queues.get(key)===result)queues.delete(key);},()=>{if(queues.get(key)===result)queues.delete(key);});
    return result;
  }
  const chunkKeys=(key:string,value:Manifest)=>Array.from({length:value.count},(_,i)=>`${key}.${value.generation}.${i}`);
  return {
    getItem:key=>locked(key,async()=>{
      const saved=manifest(await secure.getItem(`${key}.manifest`));if(!saved)return null;
      const chunks=await Promise.all(chunkKeys(key,saved).map(k=>secure.getItem(k)));
      if(chunks.some(chunk=>chunk===null))throw new Error('Saved sign-in data is incomplete.');
      return chunks.join('');
    }),
    setItem:(key,value)=>locked(key,async()=>{
      // Array.from preserves surrogate pairs when chunking non-ASCII metadata.
      const chars=Array.from(value);const chunks:string[]=[];let part='';
      for(const char of chars){if(part.length+char.length>450){chunks.push(part);part='';}part+=char;}
      chunks.push(part);
      if(chunks.length>256)throw new Error('The sign-in session is too large to save securely.');
      const old=manifest(await secure.getItem(`${key}.manifest`));
      const next=manifest(JSON.stringify({generation:newGeneration(),count:chunks.length}))!;
      if(old?.generation===next.generation)throw new Error('Could not safely replace saved sign-in data.');
      const keys=chunkKeys(key,next);
      try{
        for(let i=0;i<keys.length;i++)await secure.setItem(keys[i],chunks[i]);
        await secure.setItem(`${key}.manifest`,JSON.stringify(next));
      }catch(error){await Promise.allSettled(keys.map(k=>secure.removeItem(k)));throw error;}
      if(old)await Promise.allSettled(chunkKeys(key,old).map(k=>secure.removeItem(k)));
    }),
    removeItem:key=>locked(key,async()=>{
      const raw=await secure.getItem(`${key}.manifest`);
      await secure.removeItem(`${key}.manifest`);
      let old:Manifest|null=null;try{old=manifest(raw);}catch{/* Removing an unreadable manifest prevents restoration. */}
      if(old)await Promise.all(chunkKeys(key,old).map(k=>secure.removeItem(k)));
    }),
  };
}
