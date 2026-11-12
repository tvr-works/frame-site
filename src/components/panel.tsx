import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './ui/button';
export function Panel({open,onOpenChange,title,description,children}:{open:boolean;onOpenChange:(open:boolean)=>void;title:string;description:string;children:ReactNode}) {
 return <Dialog.Root open={open} onOpenChange={onOpenChange}>
  <Dialog.Portal><Dialog.Backdrop className="dialog-backdrop"/>
   <Dialog.Popup className="dialog-popup">
    <div className="panel-heading"><div><Dialog.Title>{title}</Dialog.Title><Dialog.Description>{description}</Dialog.Description></div><Dialog.Close render={<Button variant="ghost" size="icon"/>} aria-label="Close panel"><X/></Dialog.Close></div>
    {children}
   </Dialog.Popup>
  </Dialog.Portal>
 </Dialog.Root>;
}
