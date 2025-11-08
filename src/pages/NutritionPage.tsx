import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DailyStats {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

const DAILY_TARGETS = {
  calories: 2200,
  protein: 120,
  fat: 73,
  carbs: 275,
};

export const NutritionPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stats, setStats] = useState<DailyStats>({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDailyStats = async (date: Date) => {
    try {
      setLoading(true);
      const dateStr = date.toISOString().split("T")[0];
      
      const { data, error } = await supabase
        .from("daily_nutrition_log")
        .select("*")
        .eq("date", dateStr)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setStats({
          calories: data.total_calories || 0,
          protein: data.total_protein || 0,
          fat: data.total_fat || 0,
          carbs: data.total_carbs || 0,
        });
      } else {
        setStats({ calories: 0, protein: 0, fat: 0, carbs: 0 });
      }
    } catch (error: any) {
      console.error("Error fetching nutrition stats:", error);
      toast({
        title: "Error",
        description: "Failed to load nutrition data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyStats(selectedDate);
  }, [selectedDate]);

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const isYesterday = selectedDate.toDateString() === new Date(Date.now() - 86400000).toDateString();

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-primary";
  };

  const MacroCard = ({ 
    label, 
    current, 
    target, 
    unit, 
    icon 
  }: { 
    label: string; 
    current: number; 
    target: number; 
    unit: string; 
    icon: string;
  }) => {
    const percentage = Math.min((current / target) * 100, 100);
    
    return (
      <Card className="border-border/50">
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{icon}</span>
              <span className="font-semibold text-foreground">{label}</span>
            </div>
            <Badge variant={current >= target ? "default" : "secondary"}>
              {Math.round(current)}/{target}{unit}
            </Badge>
          </div>
          <Progress value={percentage} className="h-3" />
          <p className="text-xs text-muted-foreground text-right">
            {Math.round(percentage)}% of daily target
          </p>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading nutrition data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Nutrition Tracker</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeDate(-1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="min-w-[140px] text-center">
                <div className="font-semibold">
                  {isToday ? "Today" : isYesterday ? "Yesterday" : selectedDate.toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeDate(1)}
                disabled={isToday}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MacroCard
          label="Calories"
          current={stats.calories}
          target={DAILY_TARGETS.calories}
          unit=" kcal"
          icon="🔥"
        />
        <MacroCard
          label="Protein"
          current={stats.protein}
          target={DAILY_TARGETS.protein}
          unit="g"
          icon="🥩"
        />
        <MacroCard
          label="Fat"
          current={stats.fat}
          target={DAILY_TARGETS.fat}
          unit="g"
          icon="🧈"
        />
        <MacroCard
          label="Carbs"
          current={stats.carbs}
          target={DAILY_TARGETS.carbs}
          unit="g"
          icon="🍞"
        />
      </div>

      {stats.calories === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-muted-foreground text-lg mb-2">No nutrition data logged for this day</p>
            <p className="text-sm text-muted-foreground">
              Mark recipes as eaten to track your nutrition automatically
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
