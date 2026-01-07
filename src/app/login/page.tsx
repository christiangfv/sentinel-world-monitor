import { AuthGuard } from "@/components/auth/AuthGuard";
import { LoginButton } from "@/components/auth/LoginButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/dashboard">
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-500 shadow-lg">
                <span className="text-4xl">🌍</span>
              </div>
            </div>
            <CardTitle className="text-2xl md:text-3xl mb-2">Bienvenido a Sentinel</CardTitle>
            <CardDescription className="text-base">
              Monitorea desastres naturales en tiempo real y recibe alertas personalizadas
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Inicia sesión para continuar</h3>
                <p className="text-sm text-muted-foreground">
                  Usa tu cuenta de Google para acceder a todas las funcionalidades
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <LoginButton />
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="text-center space-y-3">
                <h4 className="text-sm font-semibold text-foreground">¿Qué puedes hacer con Sentinel?</h4>
                <div className="grid grid-cols-1 gap-3 text-left">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <span className="text-lg">🌍</span>
                    <div>
                      <div className="text-sm font-medium">Mapa Interactivo</div>
                      <div className="text-xs text-muted-foreground">Ver eventos en tiempo real</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <span className="text-lg">📍</span>
                    <div>
                      <div className="text-sm font-medium">Zonas Personalizadas</div>
                      <div className="text-xs text-muted-foreground">Configura áreas de interés</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <span className="text-lg">🔔</span>
                    <div>
                      <div className="text-sm font-medium">Alertas Push</div>
                      <div className="text-xs text-muted-foreground">Notificaciones inteligentes</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <span className="text-lg">📱</span>
                    <div>
                      <div className="text-sm font-medium">PWA Offline</div>
                      <div className="text-xs text-muted-foreground">Funciona sin conexión</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
