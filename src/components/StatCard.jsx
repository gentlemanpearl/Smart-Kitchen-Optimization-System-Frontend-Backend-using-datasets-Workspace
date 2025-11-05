import { Card, CardContent } from "@/components/ui/card"

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  variant = "default",
  className = ""
}) {
  const variantStyles = {
    default: "bg-gradient-primary",
    success: "bg-gradient-to-br from-success to-success/80",
    warning: "bg-gradient-to-br from-warning to-warning/80", 
    info: "bg-gradient-to-br from-info to-info/80"
  }

  return (
    <Card className={`overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group ${className}`}>
      <CardContent className="p-0">
        <div className="flex">
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1 group-hover:text-foreground transition-colors">
                  {title}
                </p>
                <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  {value}
                </p>
                {description && (
                  <p className="text-sm text-muted-foreground">
                    {description}
                  </p>
                )}
                {trend && (
                  <div className={`text-xs mt-2 px-2 py-1 rounded-full inline-flex items-center gap-1 ${
                    trend.isPositive 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    <span>{trend.isPositive ? '↗' : '↘'}</span>
                    {Math.abs(trend.value)}% from last month
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={`w-20 flex items-center justify-center ${variantStyles[variant]} group-hover:brightness-110 transition-all`}>
            <Icon className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

