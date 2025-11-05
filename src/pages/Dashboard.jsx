import { StatCard } from "@/components/StatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ChefHat, AlertTriangle, ShoppingCart, TrendingUp, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function Dashboard() {
  const stats = [
    {
      title: "Total Inventory Items",
      value: 38,
      icon: Package,
      description: "Active ingredients",
      trend: { value: 12, isPositive: true },
      variant: "default"
    },
    {
      title: "Total Recipes",
      value: 6,
      icon: ChefHat,
      description: "Available recipes",
      trend: { value: 2, isPositive: true },
      variant: "success"
    },
    {
      title: "Low Stock Items",
      value: 0,
      icon: AlertTriangle,
      description: "Need attention",
      variant: "warning"
    },
    {
      title: "Recipes You Can Make",
      value: 0,
      icon: ShoppingCart,
      description: "With current inventory",
      variant: "info"
    }
  ]

  const recentActivity = [
    { action: "Added Mushrooms", time: "2 hours ago", type: "inventory" },
    { action: "Updated Masala Chai recipe", time: "1 day ago", type: "recipe" },
    { action: "Low stock alert: Yeast", time: "2 days ago", type: "alert" },
    { action: "Added new recipe: Naan", time: "3 days ago", type: "recipe" },
  ]

  const lowStockItems = [
    { name: "Yeast", current: 20, threshold: 25, percentage: 80 },
    { name: "Baking Soda", current: 50, threshold: 60, percentage: 83 },
    { name: "Capsicum", current: 4, threshold: 8, percentage: 50 },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center lg:text-left animate-slide-up">
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight gradient-text mb-2">
          Smart Kitchen Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Welcome to your intelligent cooking companion
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="animate-bounce-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <StatCard {...stat} className="card-hover" />
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Status */}
        <Card className="card-hover animate-slide-in-left">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-primary/20">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              Inventory Status
              <div className="w-2 h-2 rounded-full bg-gradient-primary animate-pulse-slow ml-auto" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lowStockItems.map((item, index) => (
              <div 
                key={index} 
                className="space-y-2 p-3 rounded-lg hover:bg-accent/50 transition-colors duration-200 hover-scale"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.current}/{item.threshold}
                  </span>
                </div>
                <Progress 
                  value={item.percentage} 
                  className="h-2 overflow-hidden"
                />
              </div>
            ))}
            <div className="pt-2 text-xs text-muted-foreground italic">
              Items approaching low stock threshold
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="card-hover animate-slide-in-right">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-accent/20">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              Recent Activity
              <div className="w-2 h-2 rounded-full bg-gradient-accent animate-pulse-slow ml-auto" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all duration-200 hover-scale group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-3 h-3 rounded-full transition-transform group-hover:scale-125 ${
                    activity.type === 'inventory' ? 'bg-primary animate-pulse-slow' :
                    activity.type === 'recipe' ? 'bg-success animate-pulse-slow' :
                    'bg-warning animate-pulse-slow'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium group-hover:text-foreground transition-colors">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tip */}
      <Card className="card-hover animate-slide-up bg-gradient-to-br from-primary/10 to-primary-glow/20 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-primary rounded-lg">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-lg">💡 Smart Kitchen Tip</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Check your inventory regularly to avoid waste and plan meals efficiently. 
                Set up low stock alerts for frequently used ingredients to maintain a well-stocked kitchen.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

