import { ChevronRight, Home } from "lucide-react";
import { Category } from "@/types/dashboard";

interface BreadcrumbProps {
  categories: Category[];
  selectedCategory: string | null;
  onNavigate: (categoryId: string) => void;
}

export function Breadcrumb({ categories, selectedCategory, onNavigate }: BreadcrumbProps) {
  const getBreadcrumbPath = (): { id: string; name: string }[] => {
    if (!selectedCategory) return [];
    
    const path: { id: string; name: string }[] = [];
    
    // Find the category and its parent
    for (const cat of categories) {
      if (cat.id === selectedCategory) {
        path.push({ id: cat.id, name: cat.name });
        return path;
      }
      if (cat.children) {
        for (const child of cat.children) {
          if (child.id === selectedCategory) {
            path.push({ id: cat.id, name: cat.name });
            path.push({ id: child.id, name: child.name });
            return path;
          }
        }
      }
    }
    return path;
  };

  const breadcrumbPath = getBreadcrumbPath();

  return (
    <nav className="flex items-center gap-2 text-sm animate-fade-in">
      <button
        onClick={() => onNavigate("")}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
      </button>
      
      {breadcrumbPath.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <button
            onClick={() => onNavigate(item.id)}
            className={
              index === breadcrumbPath.length - 1
                ? "text-primary font-medium"
                : "text-muted-foreground hover:text-foreground transition-colors"
            }
          >
            {item.name}
          </button>
        </div>
      ))}
    </nav>
  );
}
