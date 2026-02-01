import { useState } from "react";
import { TripIdea } from "@/hooks/useTripIdeas";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, FileText, ImageIcon, Link as LinkIcon, Edit, Maximize2, Heart, ArrowUpCircle, Info, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { IdeaFormDialog } from "./IdeaFormDialog";
import { PromoteIdeaDialog } from "./PromoteIdeaDialog";
import { IdeaComments } from "./IdeaComments";

interface IdeaCardProps {
  idea: TripIdea;
  onDelete: (id: string) => void;
  onVote: (id: string, hasVoted: boolean) => void;
  tripId: string;
}

export function IdeaCard({ idea, onDelete, onVote, tripId }: IdeaCardProps) {
  const { user } = useAuth();
  const isCreator = user?.id === idea.created_by;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isPromoteOpen, setIsPromoteOpen] = useState(false);

  const renderContentPreview = () => {
    switch (idea.type) {
      case 'IMAGE':
        return (
          <div 
            className="aspect-video w-full h-full overflow-hidden rounded-md bg-muted relative group cursor-pointer"
            onClick={() => setIsViewOpen(true)}
          >
            {idea.media_url ? (
              <img 
                src={idea.media_url} 
                alt={idea.title || "Trip idea"} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 opacity-20" />
              </div>
            )}
          </div>
        );
      case 'LINK':
        return (
          <div className="flex flex-col gap-2 h-full">
            <div 
              className="flex items-center gap-2 p-3 rounded-md bg-secondary/10 border text-blue-600 cursor-pointer hover:bg-secondary/20 transition-colors"
              onClick={() => window.open(idea.media_url!, '_blank')}
            >
              <LinkIcon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate text-sm font-medium">{idea.media_url}</span>
              <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
            </div>
            {idea.content && (
              <p className="text-sm text-muted-foreground line-clamp-3 mt-1 cursor-pointer" onClick={() => setIsViewOpen(true)}>
                {idea.content}
              </p>
            )}
          </div>
        );
      case 'NOTE':
      default:
        return (
          <div 
            className="text-sm text-muted-foreground h-full overflow-hidden prose prose-sm max-w-none dark:prose-invert cursor-pointer"
            dangerouslySetInnerHTML={{ __html: idea.content || '' }}
            onClick={() => setIsViewOpen(true)}
          />
        );
    }
  };

  const getIcon = () => {
    switch(idea.type) {
      case 'IMAGE': return <ImageIcon className="h-4 w-4 text-purple-500" />;
      case 'LINK': return <LinkIcon className="h-4 w-4 text-blue-500" />;
      default: return <FileText className="h-4 w-4 text-orange-500" />;
    }
  };

  return (
    <>
      <Card className="flex flex-col h-[320px] hover:shadow-md transition-shadow relative group">
        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0 gap-2 shrink-0">
          <div className="min-w-0 cursor-pointer" onClick={() => setIsViewOpen(true)}>
            <div className="flex items-center gap-2 min-w-0">
              {getIcon()}
              <h3 className="font-medium text-sm truncate" title={idea.title || "Idea"}>
                {idea.title || (idea.type === 'NOTE' ? "Nota" : idea.type === 'IMAGE' ? "Immagine" : "Link")}
              </h3>
            </div>
            {idea.location && (
              <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground truncate">
                {idea.location}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-muted-foreground hover:text-primary"
              onClick={(e) => { e.stopPropagation(); setIsEditOpen(true); }}
            >
              <Edit className="h-3 w-3" />
            </Button>

            {isCreator && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={(e) => { e.stopPropagation(); onDelete(idea.id); }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-4 py-2 flex-grow overflow-hidden relative">
           {renderContentPreview()}
           <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />
        </CardContent>
        
        <CardFooter className="p-3 border-t bg-muted/5 mt-auto flex flex-col gap-2 shrink-0">
           {/* Date and Actions */}
           <div className="w-full flex justify-between items-center text-xs text-muted-foreground">
              <span>{new Date(idea.created_at).toLocaleDateString('it-IT')}</span>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 hover:bg-background hover:text-primary" onClick={() => setIsViewOpen(true)}>
                <Maximize2 className="h-3 w-3" /> Apri
              </Button>
           </div>
           
           {/* Interactions */}
           <div className="w-full flex justify-between items-center pt-2 border-t border-border/50">
             <Button
               variant="ghost"
               size="sm"
               onClick={() => onVote(idea.id, !!idea.has_voted)}
               className={`h-8 gap-1.5 ${idea.has_voted ? "text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100" : "text-muted-foreground hover:text-red-500"}`}
             >
               <Heart className={`w-4 h-4 ${idea.has_voted ? "fill-current" : ""}`} />
               <span className="font-semibold">{idea.votes_count || 0}</span>
             </Button>

             <Button
               variant="ghost"
               size="sm"
               onClick={() => setIsViewOpen(true)}
               className="h-8 gap-1.5 text-muted-foreground hover:text-primary"
             >
               <MessageSquare className="w-4 h-4" />
               <span className="font-semibold">{idea.comments_count || 0}</span>
             </Button>

             <div className="flex items-center gap-1">
               <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => setIsPromoteOpen(true)}
               >
                  <ArrowUpCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">Promuovi</span>
               </Button>
               
               <TooltipProvider>
                 <Tooltip>
                   <TooltipTrigger asChild>
                     <Info className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help hover:text-muted-foreground transition-colors" />
                   </TooltipTrigger>
                   <TooltipContent>
                     <p className="text-xs">Trasforma questa idea in un'attività reale nel tuo itinerario</p>
                   </TooltipContent>
                 </Tooltip>
               </TooltipProvider>
             </div>
           </div>
        </CardFooter>
      </Card>

      <IdeaFormDialog 
        tripId={tripId} 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        initialData={idea} 
      />

      <PromoteIdeaDialog
        tripId={tripId}
        idea={idea}
        open={isPromoteOpen}
        onOpenChange={setIsPromoteOpen}
      />

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="w-[92vw] sm:max-w-[900px] md:max-w-[1050px] lg:max-w-[1200px] xl:max-w-[1300px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
               {getIcon()}
               <span className="text-sm text-muted-foreground uppercase tracking-wider">{idea.type}</span>
            </div>
            <DialogTitle className="text-2xl">{idea.title || "Dettaglio Idea"}</DialogTitle>
            <div className="text-xs text-muted-foreground">
              Creata il {new Date(idea.created_at).toLocaleDateString()}
              {idea.location ? ` · ${idea.location}` : ""}
            </div>
          </DialogHeader>
          
          <div className="mt-4">
            {idea.type === 'IMAGE' && idea.media_url && (
              <img src={idea.media_url} alt="Full view" className="w-full rounded-md" />
            )}
            
            {idea.type === 'LINK' && idea.media_url && (
               <a href={idea.media_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline p-4 bg-muted/30 rounded-md">
                 <LinkIcon className="h-5 w-5" />
                 {idea.media_url}
                 <ExternalLink className="h-4 w-4 ml-auto" />
               </a>
            )}

            {idea.type === 'NOTE' && (
               <div 
                 className="prose prose-sm md:prose-base max-w-none dark:prose-invert"
                 dangerouslySetInnerHTML={{ __html: idea.content || '' }}
               />
            )}
          </div>

          <IdeaComments ideaId={idea.id} tripId={tripId} />
          
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
             <Button variant="outline" onClick={() => { setIsViewOpen(false); setIsEditOpen(true); }}>
               <Edit className="h-4 w-4 mr-2" /> Modifica
             </Button>
             <Button onClick={() => setIsViewOpen(false)}>Chiudi</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
