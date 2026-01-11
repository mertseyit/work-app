'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AddNewTransaction = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={'sm'} className="text-xs bg-green-600 w-1/2 hover:bg-green-700">
          Yeni İşlem Oluştur
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni İşlem Oluştur</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input type="text" placeholder="Başlık" />
          <RadioGroup defaultValue="option-one" className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-one" id="option-one" />
              <Label htmlFor="option-one" className="text-green-500">
                Gelir
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-two" id="option-two" />
              <Label htmlFor="option-two" className="text-red-500">
                Gider
              </Label>
            </div>
          </RadioGroup>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent className="w-full">
              <SelectItem value="light">Kategori 1</SelectItem>
              <SelectItem value="dark">Kategori 2</SelectItem>
              <SelectItem value="system">Kategori 3</SelectItem>
            </SelectContent>
          </Select>
          <Input type="number" placeholder="Miktar" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Vazgeç</Button>
          </DialogClose>
          <Button type="submit">Kaydet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewTransaction;
