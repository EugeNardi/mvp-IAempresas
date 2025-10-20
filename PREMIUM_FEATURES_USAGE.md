# 🎨 Cómo Usar las Funcionalidades Premium

Esta guía muestra cómo integrar las funcionalidades premium en tu aplicación.

## 📦 Componentes Disponibles

### 1. `useSubscription` Hook

Hook personalizado para acceder al estado de suscripción en cualquier componente.

```jsx
import { useSubscription } from '../hooks/useSubscription';

function MyComponent() {
  const { isPremium, isLoading, subscription, refresh } = useSubscription();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (isPremium) {
    return <div>¡Eres premium! 🎉</div>;
  }

  return <div>Actualiza a premium</div>;
}
```

**Propiedades retornadas:**
- `isPremium` (boolean): Si el usuario tiene suscripción activa
- `isLoading` (boolean): Si está cargando el estado
- `subscription` (object): Datos completos de la suscripción
- `hasSubscription` (boolean): Si el usuario tiene alguna suscripción (activa o no)
- `error` (string): Error si hubo alguno
- `refresh` (function): Función para recargar el estado

### 2. `PremiumBadge` Component

Badge que muestra el estado premium del usuario.

```jsx
import PremiumBadge from '../components/PremiumBadge';

function Header() {
  return (
    <div className="header">
      <h1>Mi App</h1>
      <PremiumBadge />
    </div>
  );
}
```

**Props:**
- `showUpgrade` (boolean, default: true): Mostrar botón "Hazte Premium" si no es premium
- `className` (string): Clases CSS adicionales

### 3. `PremiumFeature` Component

Envuelve contenido que solo debe ser accesible para usuarios premium.

```jsx
import PremiumFeature from '../components/PremiumFeature';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Contenido básico - todos pueden verlo */}
      <BasicStats />
      
      {/* Contenido premium - solo usuarios premium */}
      <PremiumFeature featureName="Las estadísticas avanzadas">
        <AdvancedStats />
      </PremiumFeature>
    </div>
  );
}
```

**Props:**
- `children`: Contenido a proteger
- `fallback`: Componente alternativo si no es premium
- `showUpgradePrompt` (boolean, default: true): Mostrar prompt de upgrade
- `featureName` (string): Nombre de la funcionalidad para el mensaje

### 4. `PremiumGate` Component

Gate simple que bloquea todo el contenido si no es premium.

```jsx
import { PremiumGate } from '../components/PremiumFeature';

function AdvancedPage() {
  return (
    <PremiumGate message="Esta página es exclusiva para usuarios Premium">
      <div>
        <h1>Contenido Premium</h1>
        <AdvancedFeatures />
      </div>
    </PremiumGate>
  );
}
```

## 🎯 Ejemplos de Uso

### Ejemplo 1: Limitar Funcionalidad en el Chat

```jsx
import { useSubscription } from '../hooks/useSubscription';
import PremiumFeature from '../components/PremiumFeature';

function Chat() {
  const { isPremium } = useSubscription();
  const [messages, setMessages] = useState([]);
  
  const handleSendMessage = async (message) => {
    // Limitar mensajes para usuarios no premium
    if (!isPremium && messages.length >= 10) {
      alert('Has alcanzado el límite de mensajes gratuitos. Actualiza a Premium para continuar.');
      return;
    }
    
    // Enviar mensaje...
  };

  return (
    <div className="chat">
      <MessageList messages={messages} />
      
      {/* Mostrar funciones avanzadas solo a premium */}
      <PremiumFeature featureName="El historial completo">
        <ChatHistory />
      </PremiumFeature>
      
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
}
```

### Ejemplo 2: Exportar Datos (Solo Premium)

```jsx
import { useSubscription } from '../hooks/useSubscription';
import { Download } from 'lucide-react';

function DataTable({ data }) {
  const { isPremium } = useSubscription();
  const navigate = useNavigate();

  const handleExport = () => {
    if (!isPremium) {
      navigate('/premium');
      return;
    }
    
    // Exportar datos...
    exportToExcel(data);
  };

  return (
    <div>
      <table>{/* ... */}</table>
      
      <button
        onClick={handleExport}
        className={`btn ${!isPremium && 'opacity-50'}`}
      >
        <Download className="w-4 h-4" />
        {isPremium ? 'Exportar' : 'Exportar (Premium)'}
      </button>
    </div>
  );
}
```

### Ejemplo 3: Mostrar Badge en Navbar

```jsx
import { useAuth } from '../context/AuthContext';
import PremiumBadge from '../components/PremiumBadge';

function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="navbar">
      <div className="logo">Mi App</div>
      
      <div className="nav-links">
        <a href="/dashboard">Dashboard</a>
        <a href="/chat">Chat</a>
        <a href="/premium">Premium</a>
      </div>

      {user && (
        <div className="user-section">
          <PremiumBadge />
          <UserMenu />
        </div>
      )}
    </nav>
  );
}
```

### Ejemplo 4: Página Completa Solo Premium

```jsx
import { PremiumGate } from '../components/PremiumFeature';

function AdvancedAnalytics() {
  return (
    <PremiumGate message="El análisis avanzado es exclusivo para usuarios Premium">
      <div className="analytics-page">
        <h1>Análisis Avanzado</h1>
        
        <div className="charts">
          <RevenueChart />
          <UserGrowthChart />
          <ConversionFunnel />
        </div>
        
        <div className="insights">
          <AIInsights />
          <Predictions />
        </div>
      </div>
    </PremiumGate>
  );
}
```

### Ejemplo 5: Funcionalidad con Fallback

```jsx
import PremiumFeature from '../components/PremiumFeature';

function Dashboard() {
  const BasicChart = () => (
    <div className="basic-chart">
      <h3>Estadísticas Básicas</h3>
      <SimpleBarChart data={basicData} />
    </div>
  );

  const AdvancedChart = () => (
    <div className="advanced-chart">
      <h3>Estadísticas Avanzadas</h3>
      <InteractiveChart data={advancedData} />
      <AIInsights />
    </div>
  );

  return (
    <div className="dashboard">
      <PremiumFeature 
        fallback={<BasicChart />}
        featureName="Las estadísticas avanzadas"
      >
        <AdvancedChart />
      </PremiumFeature>
    </div>
  );
}
```

### Ejemplo 6: Verificar Premium en el Backend

```jsx
// Frontend - Enviar token en las peticiones
import { supabase } from '../lib/supabase';

async function callPremiumAPI() {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch('http://localhost:3001/api/premium-feature', {
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    }
  });
  
  return response.json();
}

// Backend - Verificar suscripción
import { SubscriptionModel } from '../models/subscriptionModel.js';

export const premiumFeatureController = async (req, res) => {
  const userId = req.user.id; // Del middleware de auth
  
  // Verificar si tiene suscripción activa
  const isActive = await SubscriptionModel.isActive(userId);
  
  if (!isActive) {
    return res.status(403).json({ 
      error: 'Premium subscription required' 
    });
  }
  
  // Procesar funcionalidad premium...
  res.json({ data: premiumData });
};
```

## 🎨 Personalización de Estilos

Todos los componentes usan Tailwind CSS y pueden ser personalizados:

```jsx
// Badge personalizado
<PremiumBadge className="ml-4 scale-110" />

// Feature con estilos custom
<PremiumFeature 
  featureName="Esta funcionalidad"
  className="my-custom-class"
>
  <MyContent />
</PremiumFeature>
```

## 🔄 Refrescar Estado de Suscripción

Si el usuario acaba de suscribirse, puedes refrescar el estado:

```jsx
import { useSubscription } from '../hooks/useSubscription';

function SubscriptionSuccess() {
  const { refresh } = useSubscription();
  
  useEffect(() => {
    // Refrescar después de suscripción exitosa
    refresh();
  }, []);

  return <div>¡Suscripción exitosa!</div>;
}
```

## 📊 Ejemplo Completo: Dashboard con Funciones Premium

```jsx
import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import PremiumBadge from '../components/PremiumBadge';
import PremiumFeature from '../components/PremiumFeature';
import { Download, FileText, BarChart } from 'lucide-react';

function Dashboard() {
  const { isPremium, subscription } = useSubscription();

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="header">
        <h1>Dashboard</h1>
        <PremiumBadge />
      </div>

      {/* Estadísticas básicas - todos */}
      <div className="stats-grid">
        <StatCard title="Usuarios" value="1,234" icon={<Users />} />
        <StatCard title="Ventas" value="$12,345" icon={<DollarSign />} />
      </div>

      {/* Gráficos avanzados - solo premium */}
      <PremiumFeature featureName="Los gráficos avanzados">
        <div className="charts-section">
          <h2>Análisis Avanzado</h2>
          <div className="charts-grid">
            <RevenueChart />
            <ConversionChart />
            <UserGrowthChart />
          </div>
        </div>
      </PremiumFeature>

      {/* Exportar datos - solo premium */}
      <div className="actions">
        <button
          onClick={() => isPremium ? exportData() : navigate('/premium')}
          className="btn-export"
        >
          <Download className="w-4 h-4" />
          {isPremium ? 'Exportar Datos' : 'Exportar (Premium)'}
        </button>
      </div>

      {/* Reportes IA - solo premium */}
      <PremiumFeature featureName="Los reportes con IA">
        <div className="ai-reports">
          <h2>Reportes con IA</h2>
          <AIGeneratedReport />
        </div>
      </PremiumFeature>
    </div>
  );
}

export default Dashboard;
```

## 💡 Mejores Prácticas

1. **Usar el hook en componentes padres**: Evita múltiples llamadas a la API
2. **Mostrar valor antes de bloquear**: Deja ver un poco del contenido premium
3. **Mensajes claros**: Explica qué obtiene el usuario al actualizar
4. **Fallbacks útiles**: Ofrece versiones básicas de las funciones premium
5. **No ocultar completamente**: Usa blur o previews para mostrar valor
6. **Verificar en backend**: Siempre valida premium en el servidor también

## 🚀 Próximos Pasos

- Implementa estas funcionalidades en tus componentes existentes
- Personaliza los mensajes según tu marca
- Agrega más funciones premium según tu modelo de negocio
- Considera agregar un "teaser" de funciones premium

---

**¡Ahora puedes monetizar tu aplicación con funcionalidades premium!** 💰
