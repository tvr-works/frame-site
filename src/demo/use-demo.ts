import { useEffect, useReducer, useRef, useState } from 'react';
import { initialSession, sessionTransition } from './playback';
export function useDemo() {
 const [session,dispatch]=useReducer(sessionTransition,undefined,initialSession);
 const region=useRef<HTMLElement>(null);
 const [reduced,setReduced]=useState(false);
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const change=()=>{setReduced(media.matches);if(media.matches)dispatch({type:'pause'});};
  change();media.addEventListener('change',change);
  if(!media.matches)dispatch({type:'resume'});
  const background=()=>{if(document.hidden)dispatch({type:'pause'});};
  document.addEventListener('visibilitychange',background);
  const observer=new IntersectionObserver(([entry])=>{setVisible(entry.isIntersecting);if(!entry.isIntersecting)dispatch({type:'pause'});},{threshold:0.15});
  if(region.current)observer.observe(region.current);
  return ()=>{media.removeEventListener('change',change);document.removeEventListener('visibilitychange',background);observer.disconnect();};
 },[]);
 useEffect(()=>{
  if(session.mode!=='playing'||!visible||document.hidden)return;
  const timer=window.setTimeout(()=>dispatch({type:'tick'}),session.step===0?1500:2400);
  return ()=>window.clearTimeout(timer);
 },[session.mode,session.step,visible]);
 return {session,dispatch,region,reduced};
}
