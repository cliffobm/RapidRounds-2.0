import {describe,expect,it} from 'vitest';
import type {ImagePickerAsset,ImagePickerResult} from 'expo-image-picker';
import {avatarFromPickerResult,nativeProfilePhotoOptions} from '../lib/profilePhoto';
import {defaultProfile,loadProfile,MAX_AVATAR_BYTES,saveProfile} from '../lib/profile';

// Header fixtures test conversion/validation only. ProfileScreen additionally
// requires the native image decoder to accept the data before updating a draft.
const jpeg='/9j/AA==';
const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X2ioAAAAASUVORK5CYII=';
function selected(change:Partial<ImagePickerAsset>={}):ImagePickerResult {
  return {canceled:false,assets:[{uri:'file:///private/cropped-photo.jpg',width:128,height:128,type:'image',base64:jpeg,...change}]};
}

describe('native profile photo conversion and local persistence',()=>{
  it('treats cancellation or no pending result as a no-op',()=>{
    expect(avatarFromPickerResult(null)).toBeNull();
    expect(avatarFromPickerResult({canceled:true,assets:null})).toBeNull();
  });
  it('uses returned image bytes rather than a stale original MIME type or original file size',()=>{
    expect(avatarFromPickerResult(selected({mimeType:'image/heic',fileSize:8_000_000}))).toBe(`data:image/jpeg;base64,${jpeg}`);
    expect(avatarFromPickerResult(selected({base64:png,mimeType:'image/jpeg'}))).toBe(`data:image/png;base64,${png}`);
  });
  it('distinguishes a WebP RIFF header from other RIFF files',()=>{
    const webp=btoa('RIFF\x04\x00\x00\x00WEBP');
    const wave=btoa('RIFF\x04\x00\x00\x00WAVE');
    expect(avatarFromPickerResult(selected({base64:webp}))).toBe(`data:image/webp;base64,${webp}`);
    expect(()=>avatarFromPickerResult(selected({base64:wave}))).toThrow('not supported');
  });
  it('rejects missing, malformed, or non-image results',()=>{
    for(const asset of [{base64:null},{base64:''},{base64:'@@@='},{base64:jpeg,type:'video' as const}]){
      expect(()=>avatarFromPickerResult(selected(asset))).toThrow();
    }
    expect(()=>avatarFromPickerResult({canceled:false,assets:[]})).toThrow('could not be read');
    expect(()=>avatarFromPickerResult({code:'test-error',message:'private path and internal error'})).toThrow('Please try choosing a photo again');
  });
  it('enforces the exact saved-byte boundary regardless of misleading metadata',()=>{
    const atLimit='/9j/'+'AAAA'.repeat(MAX_AVATAR_BYTES/3-1);
    expect(avatarFromPickerResult(selected({base64:atLimit}))).not.toBeNull();
    const oversized=atLimit+'AA==';
    expect(()=>avatarFromPickerResult(selected({base64:oversized,fileSize:100}))).toThrow('600 KB');
  });
  it('only produces a draft value; explicit profile save preserves the selected photo locally',async()=>{
    const values=new Map<string,string>();
    const storage={getItem:async(key:string)=>values.get(key)??null,setItem:async(key:string,value:string)=>{values.set(key,value);}};
    const saved={...defaultProfile,displayName:'Student',theme:'dark' as const};
    await saveProfile(storage,saved);
    const avatar=avatarFromPickerResult(selected({base64:png,exif:{private:'not persisted'},fileName:'private-name.png'}));
    expect((await loadProfile(storage)).avatarDataUri).toBeNull();
    await saveProfile(storage,{...saved,avatarDataUri:avatar});
    expect(await loadProfile(storage)).toEqual({...saved,avatarDataUri:avatar});
    const serialized=[...values.values()][0];
    expect(serialized).not.toContain('private-name');
    expect(serialized).not.toContain('file:///');
    expect(serialized).not.toContain('not persisted');
  });
  it('requests one cropped image with compressed bytes and no optional metadata',()=>{
    expect(nativeProfilePhotoOptions.mediaTypes).toEqual(['images']);
    expect(nativeProfilePhotoOptions.allowsMultipleSelection).toBe(false);
    expect(nativeProfilePhotoOptions.allowsEditing).toBe(true);
    expect(nativeProfilePhotoOptions.aspect).toEqual([1,1]);
    expect(nativeProfilePhotoOptions.quality).toBeLessThan(1);
    expect(nativeProfilePhotoOptions.base64).toBe(true);
    expect(nativeProfilePhotoOptions.exif).toBe(false);
  });
});
