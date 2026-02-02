import { useState } from "react";
import { TripIdea } from "@/hooks/useTripIdeas";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ExternalLink, FileText, ImageIcon, Link as LinkIcon, Edit, Maximize2, Heart, ArrowUpCircle, Info, MessageSquare, ZoomIn, X, MapPin, Calendar } from "lucide-react";
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Determine an icon for the card header based on content
  const getIcon = () => {
    if (idea.media_url) return <ImageIcon className="h-4 w-4 text-purple-500" />;
    if (idea.url) return <LinkIcon className="h-4 w-4 text-blue-500" />;
    return <FileText className="h-4 w-4 text-orange-500" />;
  };

  return (
    <>
      <Card className="flex flex-col h-[380px] hover:shadow-md transition-shadow relative group">
        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0 gap-2 shrink-0">
          <div className="min-w-0 cursor-pointer w-full" onClick={() => setIsViewOpen(true)}>
            <div className="flex items-center gap-2 min-w-0 mb-1.5">
              {getIcon()}
              <h3 className="font-medium text-sm truncate" title={idea.title || "Idea"}>
                {idea.title || "Idea senza titolo"}
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {idea.day_number && idea.day_number > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 h-5 font-normal gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                  <Calendar className="w-3 h-3" />
                  Giorno {idea.day_number}
                </Badge>
              )}
              {idea.location && (
                <Badge variant="secondary" className="text-[10px] px-1.5 h-5 font-normal gap-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100 truncate max-w-[150px]">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{idea.location}</span>
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 bg-background/80 rounded-full p-1 shadow-sm backdrop-blur-sm z-10">
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
        
        <CardContent className="p-4 py-2 flex-grow overflow-hidden relative flex flex-col gap-2">
            {/* Image Preview */}
            {idea.media_url && (
                <div 
                    className="aspect-video w-full rounded-md bg-muted relative group cursor-pointer overflow-hidden shrink-0"
                    onClick={() => setIsViewOpen(true)}
                >
                    <img 
                        src={idea.media_url} 
                        alt={idea.title || "Trip idea"} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            )}

            {/* Link Preview (if no image or if space permits - but simplified here to just be present if exists) */}
            {!idea.media_url && idea.url && (
                <div 
                  className="flex items-center gap-2 p-3 rounded-md bg-secondary/10 border text-blue-600 cursor-pointer hover:bg-secondary/20 transition-colors shrink-0"
                  onClick={() => window.open(idea.url!, '_blank')}
                >
                  <LinkIcon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate text-sm font-medium">{idea.url}</span>
                  <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                </div>
            )}

            {/* Text Content */}
            {idea.content && (
                <div 
                    className="text-sm text-muted-foreground overflow-hidden prose prose-sm max-w-none dark:prose-invert cursor-pointer line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: idea.content || '' }}
                    onClick={() => setIsViewOpen(true)}
                />
            )}
            
            {/* Fade for overflow text */}
           <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />
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
            <div className="flex flex-col gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                Creata il {new Date(idea.created_at).toLocaleDateString()}
              </span>
              <div className="flex flex-wrap gap-2">
                {idea.day_number && idea.day_number > 0 && (
                  <Badge variant="secondary" className="px-2 py-0.5 h-6 font-normal gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                    <Calendar className="w-3.5 h-3.5" />
                    Giorno {idea.day_number}
                  </Badge>
                )}
                {idea.location && (
                  <Badge variant="secondary" className="px-2 py-0.5 h-6 font-normal gap-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    {idea.location}
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>
          
          <div className="mt-4 space-y-6">
            {idea.media_url && (
              <div 
                  className="w-full h-[400px] bg-muted/10 rounded-md overflow-hidden relative group cursor-zoom-in border border-border/50 shadow-inner"
                  onClick={() => setIsLightboxOpen(true)}
              >
                  <img 
                      src={idea.media_url} 
                      alt={idea.title || "Idea detail"} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]" 
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="bg-background/80 backdrop-blur-md text-foreground px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                          <ZoomIn className="w-4 h-4" />
                          <span className="text-xs font-medium">Ingrandisci</span>
                      </div>
                  </div>
              </div>
            )}
            
            {idea.url && (
               <a href={idea.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:underline p-4 bg-blue-50/50 border border-blue-100 rounded-lg group transition-colors hover:bg-blue-50">
                 <div className="bg-blue-100 p-2 rounded-full group-hover:bg-blue-200 transition-colors">
                    <LinkIcon className="h-5 w-5" />
                 </div>
                 <div className="flex flex-col overflow-hidden">
                    <span className="font-medium text-sm text-blue-900 truncate">{idea.url}</span>
                    <span className="text-xs text-blue-700/70">Clicca per aprire il link esterno</span>
                 </div>
                 <ExternalLink className="h-4 w-4 ml-auto text-blue-400 group-hover:text-blue-600" />
               </a>
            )}

            {idea.content && (
               <div className="bg-muted/10 p-4 rounded-lg border border-border/50">
                    <div 
                        className="prose prose-sm md:prose-base max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: idea.content || '' }}
                    />
               </div>
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

      {/* Lightbox Dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/90 border-none shadow-none flex items-center justify-center focus:outline-none" closeButton={false}>
            <div className="relative w-full h-full flex items-center justify-center" onClick={() => setIsLightboxOpen(false)}>
                {idea.media_url && (
                    <img 
                        src={idea.media_url} 
                        alt="Full screen view" 
                        className="max-w-full max-h-[90vh] object-contain cursor-zoom-out"
                    />
                )}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <X className="w-6 h-6" />
                </Button>
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}