import { useRef, useState, type KeyboardEvent } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, BookOpen, Keyboard, Monitor as MonitorIcon, PanelsTopLeft, Pause, Play, Plus, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Panel } from '@/components/panel';
import { Monitor } from '@/components/monitor';
import { Guide } from '@/components/guide';
import { useDemo } from '@/demo/use-demo';
import { currentWorkspace, describe, workspaceNames, type Command, type Direction } from '@/demo/model';
import { cn } from '@/lib/utils';
const directions:{key:string;direction:Direction;Icon:typeof ArrowLeft}[]=[{key:'H',direction:'left',Icon:ArrowLeft},{key:'J',direction:'down',Icon:ArrowDown},{key:'K',direction:'up',Icon:ArrowUp},{key:'L',direction:'right',Icon:ArrowRight}];
const lessons=[
 {title:'Start with a clear desktop',body:'Open two windows. The second creates a new column on a landscape display.',command:{type:'create'} as Command,action:'Open a window'},
 {title:'Change your point of focus',body:'Focus left. The active outline changes; the windows stay in place.',command:{type:'focus',direction:'left'} as Command,action:'Focus left · ⌥ H'},
 {title:'Make space for another idea',body:'Open another window. It joins the focused column, below the window already there.',command:{type:'create'} as Command,action:'Open a window'},
 {title:'Bring your windows together',body:'Move right to push the focused window into its neighboring column. Move at an outer edge to create a column.',command:{type:'move',direction:'right'} as Command,action:'Move right · ⌥ ⇧ L'},
 {title:'Give the boundary a nudge',body:'Resize right moves the active column boundary by 50 points. The last column uses its left edge.',command:{type:'resize',direction:'right'} as Command,action:'Resize right · ⌃ ⇧ ⌥ L'},
 {title:'A different workspace, the same flow',body:'Send the focused window to workspace 2. Your focus stays here. Switch workspace to follow it.',command:{type:'send',name:'2'} as Command,action:'Send to workspace 2 · ⌥ ⇧ 2'},
];
type Mode='focus'|'move'|'resize';
export default function App() {
 const {session,dispatch,region,reduced}=useDemo();const {state}=session;
 const [panel,setPanel]=useState<'shortcuts'|'guide'|'install'|null>(null);
 const [learn,setLearn]=useState(false),[lesson,setLesson]=useState(0);
 const [mode,setMode]=useState<Mode>('focus'),[keyboard,setKeyboard]=useState(false);
 const practice=useRef<HTMLTextAreaElement>(null),keyboardTrigger=useRef<HTMLButtonElement>(null);
 const act=(command:Command)=>dispatch({type:'user',command});
 function openPanel(value:typeof panel) {dispatch({type:'user'});setKeyboard(false);setPanel(value);}
 function onKey(event:KeyboardEvent<HTMLTextAreaElement>) {
  if(!keyboard || event.target!==event.currentTarget)return;
  if(event.key==='Escape'){setKeyboard(false);keyboardTrigger.current?.focus();event.preventDefault();return;}
  // Never capture real Frame/global Option chords, OS modifiers or browser shortcuts.
  if(event.altKey || event.ctrlKey || event.metaKey)return;
  const key=event.key.toLowerCase();const direction=directions.find(x=>x.key.toLowerCase()===key)?.direction;
  if(direction){event.preventDefault();act({type:mode,direction});}
  else if(key==='n'){event.preventDefault();act({type:'create'});}
  else if(key==='x'){event.preventDefault();act({type:'close'});}
  else if(workspaceNames.some(x=>x===key)){event.preventDefault();act({type:'workspace',name:key});}
 }
 const modifier=mode==='focus'?'⌥':mode==='move'?'⌥ ⇧':'⌃ ⇧ ⌥';
 const current=currentWorkspace(state);
 return <><a className="skip-link" href="#demo-controls">Skip to demo controls</a>
 <div className="site-shell">
  <header className="site-header"><a className="wordmark" href="/" aria-label="Frame home"><img src="/icon.png" width="42" height="42" alt=""/><span>Frame</span></a><nav aria-label="Main navigation"><a href="#guide" onClick={e=>{e.preventDefault();openPanel('guide');}}>Guide</a><a href="https://github.com/tvr-works/frame">GitHub <ArrowUpRight/></a><Button onClick={()=>openPanel('install')}>Install</Button></nav></header>
  <main><div className="intro"><h1>Your windows, working together.</h1><p>Keyboard-first window<br className="desktop-break"/> management for macOS.</p></div>
   <section className="demo" ref={region} aria-label="Interactive Frame demo">
    <div className="display-switch"><ToggleGroup value={[String(state.visible.length)]} onValueChange={value=>{if(value[0])act({type:'monitors',count:Number(value[0]) as 1|2});}} aria-label="Display setup"><ToggleGroupItem value="1"><MonitorIcon/>Single monitor</ToggleGroupItem><ToggleGroupItem value="2"><PanelsTopLeft/>Dual monitors</ToggleGroupItem></ToggleGroup></div>
    <div className={cn('monitors',state.visible.length===1 && 'monitors-single')}><Monitor index={0} state={state} act={act}/>{state.visible.length===2?<Monitor index={1} state={state} act={act}/>:null}</div>
    <div className="demo-caption"><span className={cn('playback-indicator',session.mode==='playing' && 'is-playing')} aria-hidden="true"/><p>{session.caption}</p>{session.keys?<kbd>{session.keys}</kbd>:null}</div>
    <div className="demo-toolbar" id="demo-controls">
     <div className="toolbar-heading"><h2>{session.mode==='playing'?'Watch it come together.':'Make yourself at home.'}</h2><span className="demo-badge">Interactive demo</span></div>
     <div className="utility-controls"><Button variant="ghost" size="sm" onClick={()=>session.mode==='playing'?dispatch({type:'pause'}):session.mode==='paused'?dispatch({type:'resume'}):dispatch({type:'replay'})}>{session.mode==='playing'?<Pause/>:<Play/>}{session.mode==='playing'?'Pause':session.mode==='paused'?'Play':'Replay'}</Button><Button variant="outline" size="sm" onClick={()=>openPanel('shortcuts')}><Keyboard/>Shortcuts</Button><Button variant="outline" size="sm" aria-expanded={learn} onClick={()=>{dispatch({type:'user'});setLearn(!learn);}}><BookOpen/>Learn</Button><Button variant="ghost" size="sm" onClick={()=>{dispatch({type:'reset'});setLesson(0);}}><RotateCcw/>Reset</Button></div>
    </div>
    <div className="practice-controls">
     <Button variant="outline" onClick={()=>act({type:'create'})}><Plus/>Open window</Button>
     <div className="direction-controls"><ToggleGroup value={[mode]} onValueChange={value=>{if(value[0]){dispatch({type:'user'});setMode(value[0] as Mode);}}} aria-label="Window action"><ToggleGroupItem value="focus">Focus</ToggleGroupItem><ToggleGroupItem value="move">Move</ToggleGroupItem><ToggleGroupItem value="resize">Resize</ToggleGroupItem></ToggleGroup><div className="direction-keys" aria-label={`${mode} directions`}>{directions.map(({key,direction,Icon})=><Button key={key} variant="key" aria-label={`${mode} ${direction}`} onClick={()=>act({type:mode,direction})}><Icon/><kbd>{modifier} {key}</kbd></Button>)}</div></div>
     <div className="workspace-controls"><label><span>Workspace</span><select aria-label="Switch workspace" value={state.workspace} onChange={e=>act({type:'workspace',name:e.target.value})}>{workspaceNames.map(name=><option key={name} value={name}>{name}</option>)}</select></label><label><span>Send to</span><select aria-label="Send focused window to workspace" value="" disabled={state.focused===null} onChange={e=>act({type:'send',name:e.target.value})}><option value="" disabled>…</option>{workspaceNames.map(name=><option key={name} value={name}>{name}</option>)}</select></label><Button variant="ghost" size="icon" aria-label="Close focused window" disabled={state.focused===null} onClick={()=>act({type:'close'})}><X/></Button></div>
    </div>
    <div className="practice-footer"><p>{session.mode==='playing'?'Click any window or control to take over.':`Workspace ${current.name} · Display ${current.monitor+1} · ${current.columns.flatMap(x=>x.windows).length} windows`}</p><Button variant="ghost" size="sm" ref={keyboardTrigger} aria-expanded={keyboard} onClick={()=>{dispatch({type:'user'});setKeyboard(!keyboard);}}><Keyboard/>{keyboard?'Keyboard practice on':'Keyboard practice'}</Button></div>
    {keyboard?<div className="keyboard-help"><p><strong>Browser practice uses plain keys.</strong> H/J/K/L = {mode}; N = open; X = close; 1–0 = workspace. Choose Focus, Move or Resize above. Real Frame uses the Option shortcuts shown on the buttons.</p><p>Installed Frame registers global Option shortcuts; the browser cannot block them or detect whether Frame is running. Use the clickable controls to practice the real labels.</p><label className="keyboard-practice-label">Click or Tab below to use plain keys. Escape exits. Tab leaves normally.<textarea ref={practice} className="keyboard-surface" aria-label="Keyboard practice area" onKeyDown={onKey} onBlur={()=>setKeyboard(false)} readOnly rows={1} value="H / J / K / L · N opens · X closes · Escape exits"/></label></div>:null}
    {learn?<div className="lesson"><div className="lesson-copy"><span className="eyebrow">LEARN BY DOING · {lesson+1} / {lessons.length}</span><h3>{lessons[lesson].title}</h3><p>{lessons[lesson].body}</p></div><div className="lesson-actions"><Button variant="outline" onClick={()=>act(lessons[lesson].command)}>{lessons[lesson].action}</Button><Button variant="ghost" onClick={()=>setLesson((lesson+1)%lessons.length)}>{lesson===lessons.length-1?'Start again':'Next'}<ArrowRight/></Button></div></div>:null}
    <p className="sr-only" aria-live="polite" aria-atomic="true">{session.mode==='manual'?state.message+' '+describe(state):session.mode==='complete'?'Demo complete. You can now control the windows.':session.mode==='paused'?'Demo paused.':''}</p>
    {reduced?<span className="sr-only">Autoplay is off for your reduced motion preference. Open a window to begin.</span>:null}
   </section>
  </main>
  <footer className="site-footer"><span>A little more space for what matters.</span><a href="https://tvr.works">Made by TVR Works <ArrowUpRight/></a></footer>
 </div>
 <Panel open={panel!==null} onOpenChange={open=>{if(!open)setPanel(null);}} title={panel==='install'?'Meet your new workspace.':panel==='guide'?'A clear path to getting started.':'Keep your hands in the flow.'} description={panel==='shortcuts'?'Frame’s default shortcuts. Click an action to try it in the demo.':panel==='install'?'Frame for macOS':'A quick guide to Frame.'}>
  {panel==='shortcuts'?<div className="shortcut-index"><p>H left · J down · K up · L right</p>{(['focus','move','resize'] as const).map(action=><div className="shortcut-row" key={action}><h3>{action}</h3><div>{directions.map(({key,direction,Icon})=><Button key={key} variant="outline" onClick={()=>act({type:action,direction})} aria-label={`Try ${action} ${direction}`}><Icon/><kbd>{action==='focus'?'⌥':action==='move'?'⌥ ⇧':'⌃ ⇧ ⌥'} {key}</kbd></Button>)}</div></div>)}<div className="shortcut-row"><h3>Workspace</h3><p>Switch: <kbd>⌥ 1–0</kbd> · Send window: <kbd>⌥ ⇧ 1–0</kbd></p></div><output className="shortcut-result">{state.message}</output><p className="small-copy">These are the real macOS shortcuts. Global shortcuts can affect your desktop if Frame is running. Click the buttons here, or use explicitly remapped Keyboard practice below the demo.</p></div>:<Guide install={panel==='install'}/>}
 </Panel>
 </>;
}
