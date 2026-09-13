export interface SpeechDriver {
  maxInputLength?:number;
  stop:()=>void|Promise<void>;
  speak:(text:string,options:{rate:number;onDone:()=>void;onStopped:()=>void;onError:()=>void})=>void;
}
export interface ReadingState {owner:string|null;status:'idle'|'reading'|'error';error:string|null}
const playbackError='Read aloud could not start or stop. Check your device voices and sound settings.';

export function speechChunks(text:string,maximum=1500):string[]{
  const limit=Math.max(2,Math.min(1500,Number.isFinite(maximum)?Math.floor(maximum):1500));
  const chunks:string[]=[];let remaining=text;
  while(remaining.length>limit){
    let end=limit;const boundary=remaining.lastIndexOf(' ',end-1);
    if(boundary>limit/2)end=boundary+1;
    // Keep UTF-16 surrogate pairs together, including when a word has no spaces.
    const previous=remaining.charCodeAt(end-1);
    if(previous>=0xD800&&previous<=0xDBFF)end--;
    chunks.push(remaining.slice(0,end));remaining=remaining.slice(end);
  }
  if(remaining)chunks.push(remaining);
  return chunks;
}

/** One speech owner at a time; stale completions cannot restart cancelled text. */
export function createSpeechController(driver:SpeechDriver){
  let generation=0;let queue=Promise.resolve();
  let state:ReadingState={owner:null,status:'idle',error:null};
  const listeners=new Set<()=>void>();
  const update=(next:ReadingState)=>{state=next;listeners.forEach(listener=>listener());};
  const current=(token:number)=>token===generation;
  function schedule(token:number,owner:string|null,job:()=>Promise<void>){
    queue=queue.then(job).catch(()=>{if(current(token))update({owner,status:'error',error:playbackError});});
    return queue;
  }
  function stop(owner?:string){
    if(owner!==undefined&&owner!==state.owner)return Promise.resolve();
    const token=++generation;const priorOwner=state.owner;
    update({owner:priorOwner,status:'idle',error:null});
    return schedule(token,priorOwner,async()=>{if(current(token))await driver.stop();});
  }
  function read(owner:string,text:string,rate:number){
    const token=++generation;
    const chunks=speechChunks(text.trim(),driver.maxInputLength);
    update({owner,status:chunks.length?'reading':'idle',error:null});
    return schedule(token,owner,async()=>{
      if(!current(token))return;
      await driver.stop();
      if(!current(token)||!chunks.length)return;
      function speak(index:number){
        if(!current(token))return;
        if(index===chunks.length){update({owner,status:'idle',error:null});return;}
        // Engines may deliver duplicate or delayed callbacks for an utterance.
        let settled=false;
        const settle=(callback:()=>void)=>{if(settled||!current(token))return;settled=true;callback();};
        try{driver.speak(chunks[index],{
          rate,
          onDone:()=>settle(()=>speak(index+1)),
          onStopped:()=>settle(()=>{generation++;update({owner,status:'idle',error:null});}),
          onError:()=>settle(()=>{generation++;update({owner,status:'error',error:playbackError});}),
        });}catch{settle(()=>{generation++;update({owner,status:'error',error:playbackError});});}
      }
      speak(0);
    });
  }
  return {read,stop,getSnapshot:()=>state,subscribe:(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener);};}};
}
