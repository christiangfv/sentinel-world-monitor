# 🤝 Guía de Contribución

¡Bienvenido! Estamos encantados de que quieras contribuir al **Sentinel World Monitor**. Esta guía te ayudará a entender cómo contribuir efectivamente al proyecto.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo contribuir?](#cómo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Testing](#testing)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Reportar Bugs](#reportar-bugs)

## 📜 Código de Conducta

Este proyecto sigue un código de conducta para asegurar un ambiente inclusivo y respetuoso. Al participar, aceptas:

- Ser respetuoso con todas las personas
- Mantener un lenguaje profesional
- Aceptar responsabilidad por errores
- Mostrar empatía hacia otros colaboradores
- Ayudar a mantener la comunidad saludable

## 🤔 ¿Cómo contribuir?

### **Tipos de Contribuciones**

- 🐛 **Corrección de bugs**
- ✨ **Nuevas funcionalidades**
- 📚 **Mejoras en documentación**
- 🎨 **Mejoras en UI/UX**
- 🧪 **Tests y testing**
- 🌐 **Internacionalización**
- 📦 **Dependencias y build**

### **Primeros Pasos**

1. **Fork** el repositorio
2. **Clona** tu fork localmente
3. **Configura** el entorno de desarrollo
4. **Crea** una rama para tu contribución
5. **Implementa** tus cambios
6. **Testea** exhaustivamente
7. **Crea** un Pull Request

## ⚙️ Configuración del Entorno

### **Prerrequisitos**

```bash
# Node.js versión recomendada
node --version  # Debe ser ≥18.0.0

# npm versión recomendada
npm --version   # Debe ser ≥9.0.0

# Firebase CLI
npm install -g firebase-tools
```

### **Instalación**

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/sentinel-world-monitor.git
cd sentinel-world-monitor

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Configurar Firebase
firebase login
firebase use testing
```

### **Verificación**

```bash
# Ejecutar tests
npm test

# Verificar linting
npm run lint

# Build de desarrollo
npm run dev
```

## 🔄 Proceso de Desarrollo

### **1. Elegir una Issue**

- Revisa las [issues abiertas](https://github.com/christiangfv/sentinel-world-monitor/issues)
- Elige una issue etiquetada como `good first issue` si eres nuevo
- Comenta en la issue para indicar que trabajarás en ella

### **2. Crear Rama**

```bash
# Crear rama desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nombre-descriptivo

# O para corrección de bugs
git checkout -b fix/nombre-del-bug
```

### **3. Implementar Cambios**

- Sigue los estándares de código
- Escribe tests para nuevas funcionalidades
- Actualiza documentación si es necesario
- Mantén commits pequeños y descriptivos

### **4. Testing**

```bash
# Ejecutar todos los tests
npm test

# Tests con coverage
npm run test:coverage

# Linting
npm run lint

# Build final
npm run build
```

## 📏 Estándares de Código

### **TypeScript**

- Usar tipos estrictos (`strict: true`)
- Evitar `any` - usar tipos específicos
- Interfaces para objetos complejos
- Generics cuando aplique

### **React/Next.js**

- Usar App Router (no Pages Router)
- Componentes funcionales con hooks
- Custom hooks para lógica reutilizable
- Server Components cuando sea posible

### **Estilos**

- Tailwind CSS para styling
- CSS modules para estilos complejos
- Diseño responsive mobile-first
- Tema oscuro soportado

### **Nomenclatura**

```typescript
// Componentes: PascalCase
export function UserProfile() { ... }

// Hooks: camelCase con 'use'
export function useAuth() { ... }

// Utilidades: camelCase
export function formatDate() { ... }

// Tipos: PascalCase con sufijo
export interface User { ... }
export type UserRole = 'admin' | 'user';
```

## 🧪 Testing

### **Cobertura Requerida**

- **Componentes**: 80%+ coverage
- **Utilidades**: 90%+ coverage
- **Hooks**: 85%+ coverage

### **Tipos de Tests**

```typescript
// Unit tests
describe('formatDate', () => {
  it('should format date correctly', () => {
    expect(formatDate(new Date('2024-01-01'))).toBe('2024-01-01');
  });
});

// Component tests
describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});

// Integration tests
describe('User Registration', () => {
  it('should create user account', async () => {
    // Test completo de flujo
  });
});
```

## 📝 Commit Messages

Usamos [Conventional Commits](https://conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

### **Tipos Permitidos**

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de estilo (formateo, etc.)
- `refactor`: Refactorización de código
- `test`: Agregar o corregir tests
- `chore`: Cambios de mantenimiento

### **Ejemplos**

```
feat(auth): add Google OAuth login
fix(map): resolve marker clustering issue
docs(readme): update installation instructions
test(utils): add date formatting tests
refactor(components): simplify user profile logic
```

## 🔄 Pull Requests

### **Plantilla de PR**

```markdown
## 📋 Descripción
Breve descripción de los cambios

## 🎯 Tipo de Cambio
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## 🧪 Testing
- [ ] Tests unitarios pasan
- [ ] Tests de integración pasan
- [ ] Linting pasa
- [ ] Build funciona

## 📸 Screenshots (si aplica)
[Agregar screenshots de cambios visuales]

## 🔗 Issues Relacionadas
Closes #123
```

### **Checklist de Revisión**

- ✅ **Funcionalidad**: Funciona como esperado
- ✅ **Código**: Cumple estándares de calidad
- ✅ **Tests**: Tests pasan y coverage adecuado
- ✅ **Documentación**: Actualizada si necesario
- ✅ **Performance**: No degrada rendimiento
- ✅ **Seguridad**: No introduce vulnerabilidades

### **Proceso de Merge**

1. **Aprobación**: Al menos 1 maintainer aprueba
2. **CI/CD**: Todos los checks pasan
3. **Merge**: Squash merge a `develop`
4. **Deploy**: Automático a staging

## 🐛 Reportar Bugs

### **Plantilla de Bug Report**

```markdown
## 🐛 Bug Report

### Descripción
Breve descripción del problema

### Pasos para Reproducir
1. Ir a '...'
2. Hacer click en '...'
3. Ver error

### Comportamiento Esperado
Qué debería pasar

### Comportamiento Actual
Qué pasa actualmente

### Screenshots
[Agregar screenshots si aplica]

### Información del Entorno
- OS: [e.g. macOS, Windows]
- Browser: [e.g. Chrome 91]
- Version: [e.g. v1.2.3]

### Información Adicional
Cualquier detalle relevante
```

## 📞 Soporte

¿Necesitas ayuda?

- 📧 **Email**: Para consultas privadas
- 💬 **GitHub Discussions**: Para preguntas generales
- 🐛 **GitHub Issues**: Para bugs y features
- 📖 **Documentation**: Para guías detalladas

## 🙏 Reconocimiento

¡Gracias por contribuir al Sentinel World Monitor! Tu ayuda hace posible mantener a las comunidades seguras ante desastres naturales.

---

**Última actualización**: Enero 2025
