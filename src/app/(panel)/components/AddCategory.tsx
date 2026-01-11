'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const AddCategory = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={'sm'} className="text-xs bg-purple-600 w-1/2 hover:bg-purple-700">
          Kategori Ekle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kategori Ekle</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategory;
