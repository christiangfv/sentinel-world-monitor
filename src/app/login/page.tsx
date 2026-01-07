import { AuthGuard } from "@/components/auth/AuthGuard";
import { LoginButton } from "@/components/auth/LoginButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/dashboard">
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-500">
                <span className="text-3xl">🌍</span>
              </div>
            </div>
            <CardTitle className="text-2xl">Bienvenido a Sentinel</CardTitle>
            <CardDescription>
              Monitorea desastres naturales en tiempo real y recibe alertas personalizadas
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Inicia sesión para continuar</h3>
                <p className="text-sm text-muted-foreground">
                  Usa tu cuenta de Google para acceder a todas las funcionalidades
                </p>
              </div>

              <div className="flex justify-center">
                <LoginButton />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="text-center space-y-2">
                <h4 className="text-sm font-medium">¿Qué puedes hacer con Sentinel?</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Ver eventos de desastres en tiempo real</li>
                  <li>• Configurar zonas de monitoreo personalizadas</li>
                  <li>• Recibir notificaciones push de alertas</li>
                  <li>• Acceder desde cualquier dispositivo</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
