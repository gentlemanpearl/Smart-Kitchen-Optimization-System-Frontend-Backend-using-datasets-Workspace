import { Link, useLocation } from "react-router-dom"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { Home, Package, ChefHat, Calendar, Trash2, Settings, Gauge } from "lucide-react"

export function Navbar() {
  const location = useLocation()
  
  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: Home,
    },
    {
      title: "Inventory",
      href: "/inventory", 
      icon: Package,
    },
    {
      title: "Recipes",
      href: "/recipes",
      icon: ChefHat,
    },
    {
      title: "Meal Planner",
      href: "/meal-planner",
      icon: Calendar,
    },
    {
      title: "Waste Management",
      href: "/waste-management",
      icon: Trash2,
    },
    {
      title: "Sensors",
      href: "/sensors",
      icon: Gauge,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <NavigationMenu className="mx-auto">
      <NavigationMenuList>
        {navItems.map((item) => (
          <NavigationMenuItem key={item.href}>
            <NavigationMenuLink asChild>
              <Link
                to={item.href}
                className={cn(
                  navigationMenuTriggerStyle(),
                  "flex items-center gap-2",
                  location.pathname === item.href && "bg-accent text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
