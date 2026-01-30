import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { IdeaFormDialog } from "./IdeaFormDialog";

interface AddIdeaDialogProps {
  tripId: string;
}

export function AddIdeaDialog({ tripId }: AddIdeaDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className="gap-2" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Aggiungi Idea
      </Button>
      <IdeaFormDialog tripId={tripId} open={open} onOpenChange={setOpen} />
    </>
  );
}