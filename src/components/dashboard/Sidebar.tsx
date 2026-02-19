import { useState } from "react";
import { ChevronDown, ChevronRight, GraduationCap, Video, BookOpen, FileText, FileDown, Atom, FlaskConical, Calculator, Leaf, PlayCircle } from "lucide-react";
import { Category } from "@/types/dashboard";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Video,
  BookOpen,
  FileText,
  FileDown,
  Atom,
  FlaskConical,
  Calculator,
  Leaf,
  PlayCircle,
};

interface SidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string) => void;
}

interface CategoryItemProps {
  category: Category;
  depth: number;
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string) => void;
}

function CategoryItem({
  category,
  depth,
  selectedCategory,
  onCategorySelect,
}: CategoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(depth === 0);
  const hasChildren = category.children && category.children.length > 0;
  const Icon = category.name.toLowerCase().includes('class') ? GraduationCap : (iconMap[category.icon] || Video);
  const isSelected = selectedCategory === category.id;

  return (
    <div
      className="animate-slide-in-left"
      style={{ animationDelay: `${depth * 50}ms` }}
    >
      <button
        onClick={() => {
          if (hasChildren) setIsExpanded(!isExpanded);
          onCategorySelect(category.id);
        }}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
          isSelected
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
      >
        <div className={cn(
          "shrink-0 p-1 rounded-md transition-colors",
          isSelected ? "bg-primary-foreground/20" : "bg-muted group-hover:bg-background"
        )}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="truncate flex-1 text-left">{category.name}</span>
        {hasChildren && (
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              isExpanded ? "rotate-180" : ""
            )}
          />
        )}
      </button>

      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1 border-l border-border/50 ml-4">
          {category.children!.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              depth={depth + 1}
              selectedCategory={selectedCategory}
              onCategorySelect={onCategorySelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  categories,
  selectedCategory,
  onCategorySelect,
}: SidebarProps) {
  return (
    <aside className="w-64 h-screen fixed left-0 top-0 glass-panel border-r border-border/30 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse-glow">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">EduDashboard</h1>
            <p className="text-xs text-muted-foreground">Learning Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
          Categories
        </p>
        <button
          onClick={() => onCategorySelect("")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            "hover:bg-sidebar-accent",
            !selectedCategory
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <div className={cn(
            "shrink-0 p-1 rounded-md transition-colors",
            !selectedCategory ? "bg-primary-foreground/20" : "bg-muted hover:bg-background"
          )}>
            <PlayCircle className="w-4 h-4" />
          </div>
          <span>All Content</span>
        </button>

        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            depth={0}
            selectedCategory={selectedCategory}
            onCategorySelect={onCategorySelect}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/30">
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-2">Progress</p>
          <div className="w-full bg-muted rounded-full h-2 mb-2">
            <div
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
              style={{ width: "25%" }}
            />
          </div>
          <p className="text-xs text-primary font-medium">2 of 8 completed</p>
        </div>
      </div>
    </aside>
  );
}
