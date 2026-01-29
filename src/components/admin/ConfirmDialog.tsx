"use client";

import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, Trash2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  variant?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  variant = 'danger',
  confirmText = "Xác nhận thực hiện",
  cancelText = "Hủy bỏ"
}: ConfirmDialogProps) {
  
  const icons = {
    danger: <Trash2 className="w-8 h-8 text-destructive" />,
    warning: <AlertTriangle className="w-8 h-8 text-amber-500" />,
    info: <Info className="w-8 h-8 text-blue-500" />
  };

  const colors = {
    danger: "bg-destructive/10 text-destructive",
    warning: "bg-amber-50 text-amber-600",
    info: "bg-blue-50 text-blue-600"
  };

  const btnColors = {
    danger: "bg-destructive hover:bg-destructive/90",
    warning: "bg-amber-600 hover:bg-amber-700",
    info: "bg-primary hover:bg-primary/90"
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="rounded-[32px] border-none p-0 overflow-hidden shadow-elevated z-[200]">
        <div className={cn("p-8 flex flex-col items-center text-center", colors[variant])}>
           <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-white shadow-sm")}>
              {icons[variant]}
           </div>
           <AlertDialogHeader>
             <AlertDialogTitle className="text-xl font-bold text-charcoal uppercase tracking-widest">{title}</AlertDialogTitle>
             <AlertDialogDescription className="text-muted-foreground mt-2 leading-relaxed">
               {description}
             </AlertDialogDescription>
           </AlertDialogHeader>
        </div>
        <AlertDialogFooter className="p-6 bg-gray-50 flex gap-3 sm:justify-center border-t">
          <AlertDialogCancel className="rounded-xl h-12 px-8 font-bold text-xs uppercase border-border/60 hover:bg-white">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className={cn("rounded-xl h-12 px-8 font-bold text-xs uppercase text-white shadow-lg", btnColors[variant])}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}