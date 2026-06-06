import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { loginSchema, type LoginCredentials, loginWithEmail, signUpWithEmail } from "../api/auth"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [serverError, setServerError] = useState("")

  function toggleMode() {
    // Pequena transição para o usuário perceber a mudança de Login <-> Cadastro
    setIsSwitching(true)
    setServerError("")
    setTimeout(() => {
      setIsSignUp((prev) => !prev)
      setIsSwitching(false)
    }, 450)
  }

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginCredentials) {
    setIsLoading(true)
    setServerError("")
    try {
      if (isSignUp) {
        await signUpWithEmail(values)
      } else {
        await loginWithEmail(values)
      }
    } catch (error: any) {
      let errorMsg = error.message || "Ocorreu um erro de conexão."
      if (errorMsg.includes("User already registered")) errorMsg = "Este e-mail já está cadastrado no sistema."
      if (errorMsg.includes("Invalid login credentials")) errorMsg = "E-mail ou senha incorretos."
      setServerError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Topo: faixa de marca (paleta navy → roxo → rosa do projeto) */}
      <div
        className="relative flex min-h-[40vh] shrink-0 flex-col items-center justify-center gap-4 px-6 pb-16 pt-[calc(env(safe-area-inset-top)+2rem)] text-center"
        style={{
          background:
            "linear-gradient(135deg, #1E3A8A 0%, #4F46E5 40%, #863BFF 72%, #FF3B86 100%)",
        }}
      >
        {/* Disco com a logo (equivalente ao círculo da referência) */}
        <div className="animate-in fade-in zoom-in-95 flex size-28 items-center justify-center rounded-full bg-white/10 shadow-2xl shadow-black/40 ring-1 ring-white/20 backdrop-blur-sm duration-500">
          <img src="/favicon.svg" alt="Logo Yajo" className="size-16" />
        </div>
        <h1 className="animate-in fade-in slide-in-from-bottom-2 text-3xl font-bold tracking-tight text-white duration-500">
          Yajo
        </h1>
      </div>

      {/* Card inferior sobreposto: superfície escura OLED do tema */}
      <div
        className="animate-in fade-in slide-in-from-bottom-4 relative z-10 -mt-10 flex flex-1 flex-col bg-card px-6 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-10 duration-500"
        style={{
          borderTopLeftRadius: "40px",
          borderTopRightRadius: "40px",
          // Sombra suave voltada para cima, reforçando o efeito de camada flutuante
          boxShadow: "0 -8px 30px -6px rgba(0, 0, 0, 0.55)",
        }}
      >
        <div className="relative mx-auto w-full max-w-sm">
          {/* Overlay de transição ao alternar Login <-> Cadastro */}
          {isSwitching && (
            <div className="animate-in fade-in absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-card/80 backdrop-blur-sm duration-200">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                {isSignUp ? "Voltando para o login..." : "Indo para o cadastro..."}
              </span>
            </div>
          )}

          <div
            key={isSignUp ? "signup" : "login"}
            className="animate-in fade-in slide-in-from-right-3 duration-300"
          >
          <div className="mb-6 space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {isSignUp ? "Criar Conta" : "Acessar"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isSignUp
                ? "Registre-se para iniciar a jornada financeira."
                : "Entre para visualizar os números do casal."}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="casal@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {serverError && (
                <div className="text-sm font-medium text-destructive">{serverError}</div>
              )}

              <Button type="submit" className="mt-2 w-full rounded-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSignUp ? "Cadastrar" : "Entrar"}
              </Button>

              <div className="mt-4 pt-2 text-center text-sm text-muted-foreground">
                {isSignUp ? "Já possui conta? " : "Ainda não tem conta? "}
                <button
                  type="button"
                  onClick={toggleMode}
                  disabled={isSwitching || isLoading}
                  className="font-medium text-primary hover:underline disabled:opacity-50"
                >
                  {isSignUp ? "Faça login" : "Crie uma"}
                </button>
              </div>
            </form>
          </Form>
          </div>
        </div>
      </div>
    </div>
  )
}
