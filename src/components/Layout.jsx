import { Navbar } from "@/components/Navbar"

export function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <header className="h-16 border-b bg-card flex items-center justify-between px-6">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-foreground">Smart Kitchen</h2>
        </div>
        
        <Navbar />
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Welcome back, Chef!
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-6 bg-background">
        {children}
      </main>
    </div>
  )
}

