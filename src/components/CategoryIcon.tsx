import { Apple, Beef, IceCream2, Soup, UtensilsCrossed } from "lucide-react";

type Category = "fridge" | "freezer" | "produce" | "spices" | "pantry";

interface CategoryIconProps {
  category: Category;
  className?: string;
}

const categoryConfig = {
  fridge: { icon: Beef, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
  freezer: { icon: IceCream2, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/30" },
  produce: { icon: Apple, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30" },
  spices: { icon: Soup, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30" },
  pantry: { icon: UtensilsCrossed, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
};

export const CategoryIcon = ({ category, className = "" }: CategoryIconProps) => {
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center ${className}`}>
      <Icon className={`w-5 h-5 ${config.color}`} />
    </div>
  );
};