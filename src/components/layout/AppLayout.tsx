import { Outlet, Link, useLocation } from "react-router-dom"
import { Home, Target, ArrowRightLeft, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

export function AppLayout() {
  const location = useLocation()

  const navItems = [
    { icon: Home, label: "Início", path: "/" },
    { icon: ArrowRightLeft, label: "Extrato", path: "/transactions" },
    { icon: Target, label: "Metas", path: "/goals" },
    { icon: Menu, label: "Todos", path: "/settings" },
  ]

  return (
    <div className="flex flex-col h-screen bg-background text-foreground pb-[env(safe-area-inset-bottom)]">
      {/* Área Principal com Scroll - A tela renderiza aqui dentro */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation Bar (Estilo App Nativo) */}
      <nav className="fixed bottom-0 w-full border-t border-primary/20 bg-card/85 backdrop-blur-md pb-[env(safe-area-inset-bottom)] z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
