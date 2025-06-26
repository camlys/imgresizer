import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Image, FileText } from 'lucide-react';

interface UploadTypeDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectType: (type: 'image' | 'pdf') => void;
}

export function UploadTypeDialog({ isOpen, onOpenChange, onSelectType }: UploadTypeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose upload type</DialogTitle>
          <DialogDescription>
            What kind of file would you like to upload for editing?
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button variant="outline" className="flex flex-col h-28 items-center justify-center gap-2" onClick={() => onSelectType('image')}>
            <Image className="w-8 h-8" />
            <span className="text-base">Image</span>
          </Button>
          <Button variant="outline" className="flex flex-col h-28 items-center justify-center gap-2" onClick={() => onSelectType('pdf')}>
            <FileText className="w-8 h-8" />
            <span className="text-base">PDF</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
