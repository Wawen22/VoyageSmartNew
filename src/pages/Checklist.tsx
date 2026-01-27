import { useSearchParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardList, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useChecklist } from "@/hooks/useChecklist";
import { ChecklistSection } from "@/components/checklist/ChecklistSection";

export default function Checklist() {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("trip");
  const { user, loading: authLoading } = useAuth();

  const {
    groupItems,
    personalItems,
    isLoading,
    addItem,
    toggleItem,
    deleteItem,
    isAdding,
    groupStats,
    personalStats,
  } = useChecklist(tripId);

  if (authLoading) {
    return (
      <AppLayout>
        <main className="pt-24 pb-16 relative z-10">
          <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
      </AppLayout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!tripId) {
    return <Navigate to="/trips" replace />;
  }

  const totalItems = groupStats.total + personalStats.total;
  const totalCompleted = groupStats.completed + personalStats.completed;
  const overallProgress = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  return (
    <AppLayout>
      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <ClipboardList className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">
                Checklist Viaggio
              </h1>
              <p className="text-muted-foreground text-sm">
                {totalItems > 0
                  ? `${totalCompleted}/${totalItems} elementi completati (${overallProgress}%)`
                  : "Organizza cosa portare e cosa fare"}
              </p>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Group Checklist */}
            <ChecklistSection
              title="Checklist di Gruppo"
              isPersonal={false}
              items={groupItems}
              stats={groupStats}
              onAdd={addItem}
              onToggle={toggleItem}
              onDelete={deleteItem}
              isAdding={isAdding}
            />

            {/* Personal Checklist */}
            <ChecklistSection
              title="La Mia Checklist"
              isPersonal={true}
              items={personalItems}
              stats={personalStats}
              onAdd={addItem}
              onToggle={toggleItem}
              onDelete={deleteItem}
              isAdding={isAdding}
            />
          </div>
        )}
      </main>
    </AppLayout>
  );
}
