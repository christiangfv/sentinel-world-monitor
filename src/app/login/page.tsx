import { AuthGuard } from "@/components/auth/AuthGuard";
import { LoginButton } from "@/components/auth/LoginButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
      </svg>
    ),
    title: "Mapa Interactivo",
    description: "Ver eventos en tiempo real"
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    ),
    title: "Zonas Personalizadas",
    description: "Configura áreas de interés"
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
      </svg>
    ),
    title: "Alertas Push",
    description: "Notificaciones inteligentes"
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    ),
    title: "PWA Offline",
    description: "Funciona sin conexión"
  }
];

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/dashboard">
      <div className="min-h-screen bg-[#0D0E14] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-[#D4B57A]/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-[#7088A0]/5 to-transparent rounded-full blur-3xl" />
        </div>

        <Card className="w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-[#4A5060]/40 animate-fadeInUp relative z-10">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-[#D4B57A]/20 rounded-full blur-xl animate-pulse" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#D4B57A] to-[#A8925A] shadow-[0_0_30px_rgba(212,181,122,0.3)]">
                  <svg className="w-10 h-10 text-[#0D0E14]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl md:text-3xl mb-2 text-gradient-plasma font-bold">
              Bienvenido a Sentinel
            </CardTitle>
            <CardDescription className="text-base text-[#8890A0]">
              Monitorea desastres naturales en tiempo real y recibe alertas personalizadas
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2 text-[#E8E8F0]">Inicia sesión para continuar</h3>
                <p className="text-sm text-[#8890A0]">
                  Usa tu cuenta de Google para acceder a todas las funcionalidades
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <LoginButton />
              </div>
            </div>

            <div className="border-t border-[#4A5060]/30 pt-6">
              <div className="text-center space-y-4">
                <h4 className="text-sm font-semibold text-[#8890A0] uppercase tracking-wider">
                  ¿Qué puedes hacer con Sentinel?
                </h4>
                <div className="grid grid-cols-1 gap-2 text-left">
                  {features.map((feature, index) => (
                    <div
                      key={feature.title}
                      className="flex items-center gap-3 p-3 rounded-lg bg-[#4A5060]/10 hover:bg-[#4A5060]/20 transition-colors group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4B57A]/20 to-[#D4B57A]/5 flex items-center justify-center text-[#D4B57A] group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#E8E8F0]">{feature.title}</div>
                        <div className="text-xs text-[#8890A0]">{feature.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
