import { AuthGuard } from "@/components/auth/AuthGuard";
import { Header } from "@/components/layout/Header";
import { ZoneManager } from "@/components/user/ZoneManager";
import { AlertPreferences } from "@/components/user/AlertPreferences";
import { GeneralSettings } from "@/components/user/GeneralSettings";
import { AccountSettings } from "@/components/user/AccountSettings";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Configuración</h1>
            <p className="text-muted-foreground">
              Personaliza tu experiencia con Sentinel
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Zonas de monitoreo */}
            <ZoneManager />

            {/* Preferencias de alertas */}
            <AlertPreferences />

            {/* Configuración general */}
            <GeneralSettings />

            {/* Información de la cuenta */}
            <AccountSettings />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
