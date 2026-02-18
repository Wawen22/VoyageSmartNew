import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Wallet, 
  Building2, 
  Car, 
  Calendar, 
  UserPlus,
  X,
  BellOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "expense":
      return <Wallet className="w-4 h-4 text-emerald-500" />;
    case "accommodation":
      return <Building2 className="w-4 h-4 text-amber-500" />;
    case "transport":
      return <Car className="w-4 h-4 text-sky-500" />;
    case "activity":
      return <Calendar className="w-4 h-4 text-primary" />;
    case "invitation":
      return <UserPlus className="w-4 h-4 text-rose-500" />;
    default:
      return <Bell className="w-4 h-4 text-muted-foreground" />;
  }
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded-full transition-all duration-200 text-foreground hover:bg-muted active:scale-95"
          aria-label="Notifiche"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-background animate-in zoom-in duration-300">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent 
        align="end" 
        className="w-80 sm:w-96 p-0 bg-card border border-border shadow-2xl rounded-2xl overflow-hidden z-50"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-foreground">Notifiche</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-primary/10 text-primary border-none">
                {unreadCount} nuove
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsRead()}
                className="h-8 px-2 text-xs hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                Leggi tutte
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (window.confirm("Vuoi eliminare tutte le notifiche?")) {
                    clearAllNotifications();
                  }
                }}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-[450px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Caricamento...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <BellOff className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <h4 className="font-semibold text-foreground mb-1">Nessuna notifica</h4>
              <p className="text-xs text-muted-foreground max-w-[200px]">
                Ti avviseremo quando ci saranno novità sui tuoi viaggi.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "relative group px-4 py-4 cursor-pointer transition-all duration-200",
                    notification.is_read
                      ? "bg-card hover:bg-muted/30"
                      : "bg-primary/[0.03] hover:bg-primary/[0.06] border-l-2 border-primary"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                      notification.is_read ? "bg-muted/50" : "bg-white dark:bg-slate-900 ring-1 ring-border"
                    )}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "text-sm font-bold truncate leading-tight",
                          notification.is_read ? "text-foreground/70" : "text-foreground"
                        )}>
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <span className="flex-shrink-0 w-2 h-2 mt-1 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                        )}
                      </div>
                      <p className={cn(
                        "text-xs mt-1 leading-relaxed line-clamp-2",
                        notification.is_read ? "text-muted-foreground" : "text-foreground/80"
                      )}>
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-2 font-medium">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: it,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg bg-background/80 backdrop-blur-sm shadow-sm hover:text-primary hover:bg-background"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg bg-background/80 backdrop-blur-sm shadow-sm hover:text-destructive hover:bg-background"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="p-2 border-t border-border/40 bg-muted/10">
            <Button 
              variant="link" 
              className="w-full h-8 text-[10px] text-muted-foreground hover:text-foreground no-underline"
              onClick={() => setIsOpen(false)}
            >
              Chiudi pannello
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
