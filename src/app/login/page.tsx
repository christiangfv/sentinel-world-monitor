'use client';
import { AuthGuard } from "@/components/auth/AuthGuard";
import { LoginButton } from "@/components/auth/LoginButton";
import { MockLoginButton } from "@/components/auth/MockLoginButton";
import { OnboardingModal } from "@/components/auth/OnboardingModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAuth } from "@/lib/hooks/useAuth";
import Image from "next/image";

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Mapa Interactivo",
    description: "Visualiza eventos en tiempo real con vistas 2D y 3D",
    color: "plasma"
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Zonas Personalizadas",
    description: "Define áreas de interés para monitoreo automático",
    color: "mist"
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    title: "Alertas Inteligentes",
    description: "Notificaciones push basadas en tus zonas",
    color: "sakura"
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: "PWA Offline",
    description: "Accede incluso sin conexión a internet",
    color: "smoke"
  }
];

export default function LoginPage() {
  const { user, loading } = useAuth();

  const handleOnboardingComplete = () => {
    // Una vez completado el onboarding, redirigir a la página principal
    window.location.href = '/';
  };


  return (
    <AuthGuard requireAuth={false} redirectTo="/">
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-mesh pointer-events-none" />

        {/* Enhanced ambient glow orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="ambient-orb ambient-orb-plasma w-[600px] h-[600px] -top-1/4 -left-1/4 animate-ambient-glow" />
          <div className="ambient-orb ambient-orb-mist w-[500px] h-[500px] -bottom-1/4 -right-1/4 animate-ambient-glow" style={{ animationDelay: '2s' }} />
          <div className="ambient-orb ambient-orb-sakura w-[300px] h-[300px] top-1/2 right-1/4 animate-ambient-glow" style={{ animationDelay: '4s' }} />
        </div>

        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          <Card className="glass-plasma shadow-[0_30px_80px_rgba(0,0,0,0.6),0_0_100px_rgba(212,181,122,0.1)]">
            <CardHeader className="text-center pb-4">
              {/* Logo mejorado */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-plasma/30 rounded-full blur-2xl animate-pulse-glow" />
                  <div className="relative w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-plasma via-plasma to-plasma-hover shadow-lg ring-4 ring-plasma/20">
                    <Image
                      src="/logo.svg"
                      alt="Sentinel Logo"
                      width={40}
                      height={40}
                      className="object-contain drop-shadow-lg"
                    />
                  </div>
                </div>
              </div>

              <CardTitle className="text-2xl md:text-3xl mb-3">
                Bienvenido a <span className="text-gradient-plasma">Sentinel</span>
              </CardTitle>
              <CardDescription className="text-base text-smoke">
                Monitoreo de eventos naturales en tiempo real con alertas personalizadas
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-2 px-6 pb-6">
              {/* Login Section */}
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-base font-medium mb-1 text-muted">Inicia sesión para continuar</h3>
                  <p className="text-sm text-smoke">
                    Accede con tu cuenta de Google
                  </p>
                </div>

                <div className="flex flex-col items-center gap-3 pt-2">
                  <LoginButton />
                  <MockLoginButton />
                </div>
              </div>

              {/* Divider */}
              <div className="divider" />

              {/* Features Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-smoke uppercase tracking-wider text-center">
                  Características principales
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {features.map((feature, index) => (
                    <div
                      key={feature.title}
                      className="flex items-center gap-3 p-3 rounded-xl glass-subtle hover:border-plasma/20 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 group animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                        feature.color === 'plasma' ? 'icon-container text-plasma' :
                        feature.color === 'mist' ? 'icon-container-mist text-mist' :
                        feature.color === 'sakura' ? 'icon-container-sakura text-sakura' :
                        'bg-smoke/10 text-smoke border border-smoke/10'
                      }`}>
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted group-hover:text-foreground transition-colors">{feature.title}</p>
                        <p className="text-xs text-smoke">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-smoke mt-6">
            Al continuar, aceptas nuestros términos de servicio y política de privacidad.
          </p>
        </div>
      </div>

      <OnboardingModal
        user={user}
        onComplete={handleOnboardingComplete}
      />
    </AuthGuard>
  );
}
