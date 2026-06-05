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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { loginSchema, type LoginCredentials, loginWithEmail, signUpWithEmail } from "../api/auth"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [serverError, setServerError] = useState("")

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
      setServerError(error.message || "Ocorreu um erro de conexão.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm border-primary/20 shadow-xl shadow-primary/5 bg-card">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight text-primary">
          {isSignUp ? "Criar Conta" : "Acessar Dashboard"}
        </CardTitle>
        <CardDescription>
          {isSignUp
            ? "Registre-se para iniciar a jornada financeira."
            : "Entre para visualizar os números do casal."}
        </CardDescription>
      </CardHeader>
      <CardContent>
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

            <Button type="submit" className="w-full rounded-full mt-2" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? "Cadastrar" : "Entrar"}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground mt-4 pt-2">
              {isSignUp ? "Já possui conta? " : "Ainda não tem conta? "}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-medium text-primary hover:underline"
              >
                {isSignUp ? "Faça login" : "Crie uma"}
              </button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
