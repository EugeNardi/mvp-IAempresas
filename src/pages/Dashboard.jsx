import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Building2, 
  Upload, 
  FileText, 
  TrendingUp, 
  DollarSign,
  LogOut,
  User,
  Menu,
  X,
  BarChart3,
  PieChart,
  Calculator,
  MessageSquare,
  FileSpreadsheet,
  LayoutDashboard,
  LineChart,
  Brain,
  Target,
  Package,
  Crown,
  CreditCard,
  Sparkles,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import Logo from '../components/common/Logo'
import MyBusiness from '../components/dashboard/MyBusiness'
import Movimientos from '../components/dashboard/Movimientos'
import Remitos from '../components/dashboard/Remitos'
import TaxManagement from '../components/dashboard/TaxManagementNew'
import FinancialIntelligence from '../components/dashboard/FinancialIntelligence'
import CombinedDashboard from '../components/dashboard/CombinedDashboard'
import AIProjections from '../components/dashboard/AIProjections'
import CreditCalculator from '../components/dashboard/CreditCalculator'
import Inventory from './Inventory'
import Messaging from './Messaging'
import DolarWidget from '../components/dashboard/DolarWidget'
import AnalisisVisual from '../components/dashboard/AnalisisVisual'
import OnboardingTour from '../components/OnboardingTour'
import FloatingChat from '../components/chat/FloatingChat'

const Dashboard = () => {
  const { user, signOut } = useAuth()
  const { companyData, invoices } = useData()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [sidebarOpen, setSidebarOpen] = useState(false) // Cerrado por defecto en móvil
  const [dashboardContext, setDashboardContext] = useState(null)
  const [pymeMenuOpen, setPymeMenuOpen] = useState(false) // Estado para el menú desplegable

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  // Determinar si es emprendedor
  const isEmprendedor = companyData?.businessType === 'emprendedor'

  // Redirigir si emprendedor intenta acceder a tabs bloqueados
  useEffect(() => {
    if (isEmprendedor && (activeTab === 'taxes' || activeTab === 'credit')) {
      setActiveTab('dashboard')
    }
  }, [isEmprendedor, activeTab])

  // Actualizar contexto del dashboard para el chat
  useEffect(() => {
    if (invoices && invoices.length > 0) {
      const totalIncome = invoices
        .filter(inv => inv.type === 'income')
        .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0)
      
      const totalExpenses = invoices
        .filter(inv => inv.type === 'expense')
        .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0)
      
      const fixedExpenses = invoices
        .filter(inv => inv.type === 'expense' && inv.metadata?.tipoGasto === 'Fijo')
        .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0)
      
      const variableExpenses = invoices
        .filter(inv => inv.type === 'expense' && inv.metadata?.tipoGasto === 'Variable')
        .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0)

      setDashboardContext({
        period: 'General',
        totalIncome,
        totalExpenses,
        grossProfit: totalIncome - totalExpenses,
        netProfit: totalIncome - totalExpenses,
        fixedExpenses,
        variableExpenses,
        liquidityRatio: totalExpenses > 0 ? totalIncome / totalExpenses : 0,
        roi: totalExpenses > 0 ? ((totalIncome - totalExpenses) / totalExpenses) * 100 : 0,
        productsCount: 0, // Se actualizará con datos del inventario
        inventoryValue: 0,
        alerts: []
      })
    }
  }, [invoices])

  // Obtener saludo según hora del día
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 20) return 'Buenas tardes'
    return 'Buenas noches'
  }

  // Tabs base
  const allTabs = [
    { id: 'profile', name: 'Mi Negocio', icon: Building2 },
    { id: 'dashboard', name: 'Panel de Control', icon: LayoutDashboard },
    { id: 'movimientos', name: 'Movimientos', icon: TrendingUp },
    { id: 'inventory', name: 'Inventario', icon: Package },
    { id: 'messaging', name: 'Mensajería', icon: MessageSquare },
    { id: 'intelligence', name: 'Análisis', icon: BarChart3 },
    { id: 'projections', name: 'Proyecciones', icon: Brain },
    { id: 'credit', name: 'Créditos', icon: CreditCard, hideForEmprendedor: true },
    { id: 'taxes', name: 'Impuestos', icon: Calculator, hideForEmprendedor: true },
  ]

  // Filtrar tabs según tipo de negocio
  const tabs = allTabs.filter(tab => {
    if (isEmprendedor && tab.hideForEmprendedor) {
      return false
    }
    return true
  })

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Elegant Style */}
      <div className={`
        fixed lg:sticky top-0 left-0 h-screen
        w-72 bg-white border-r border-gray-200
        flex flex-col z-40 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo/Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <Logo size="sm" showIcon={false} />
            <p className="text-xs text-gray-500 mt-1">Sistema de Gestión</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          {/* Tabs principales */}
          {tabs.filter(tab => !['projections', 'credit', 'taxes'].includes(tab.id)).map((tab) => (
            <button
              key={tab.id}
              id={`${tab.id}-tab`}
              onClick={() => {
                setActiveTab(tab.id)
                setSidebarOpen(false)
              }}
              className={`
                w-full flex items-center gap-3 
                px-4 py-3 mb-1
                rounded-lg transition-all duration-150 text-sm font-semibold group
                ${
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <tab.icon className={`w-5 h-5 flex-shrink-0 ${
                activeTab === tab.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
              }`} />
              <span className="truncate">{tab.name}</span>
            </button>
          ))}

          {/* Menú desplegable PyME - Solo visible si NO es emprendedor */}
          {!isEmprendedor && (
            <div>
              {/* Botón para desplegar */}
              <button
                onClick={() => setPymeMenuOpen(!pymeMenuOpen)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 mb-1 rounded-lg transition-all duration-150 text-sm font-semibold text-gray-700 hover:bg-gray-50 group"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 flex-shrink-0 text-gray-500 group-hover:text-gray-700" />
                  <span className="truncate">Herramientas PyME</span>
                </div>
                {pymeMenuOpen ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {/* Opciones desplegables */}
              {pymeMenuOpen && (
                <div className="ml-4 space-y-1">
                  {tabs.filter(tab => ['projections', 'credit', 'taxes'].includes(tab.id)).map((tab) => (
                    <button
                      key={tab.id}
                      id={`${tab.id}-tab`}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setSidebarOpen(false)
                      }}
                      className={`
                        w-full flex items-center gap-3 
                        px-4 py-3 mb-1
                        rounded-lg transition-all duration-150 text-sm font-semibold group
                        ${
                          activeTab === tab.id
                            ? 'bg-gray-900 text-white shadow-sm'
                            : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <tab.icon className={`w-5 h-5 flex-shrink-0 ${
                        activeTab === tab.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                      }`} />
                      <span className="truncate">{tab.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="mb-3">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <Link
            to="/premium"
            className="w-full px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>Ver mi plan</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full bg-gray-50">
        {/* Header - Más grande y prominente */}
        <header className="h-20 sm:h-24 bg-white border-b border-gray-200 flex items-center justify-between px-6 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                {tabs.find(t => t.id === activeTab)?.name}
              </h1>
              {companyData?.name && (
                <p className="hidden sm:block text-sm text-gray-500 mt-1">
                  {getGreeting()}, {companyData.name}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {companyData?.businessType && (
              <div className={`hidden lg:flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl shadow-md ${
                companyData.businessType === 'emprendedor'
                  ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-blue-800 text-white'
              }`}>
                {companyData.businessType === 'emprendedor' ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>EMPRENDEDOR</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    <span>PyME</span>
                  </>
                )}
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'profile' && (
            <MyBusiness />
          )}
          {activeTab === 'movimientos' && (
            <Movimientos 
              companyData={companyData}
            />
          )}
          {activeTab === 'inventory' && (
            <Inventory />
          )}
          {activeTab === 'messaging' && (
            <Messaging />
          )}
          {activeTab === 'taxes' && (
            isEmprendedor ? (
              <div className="max-w-2xl mx-auto mt-20">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 p-8 text-center shadow-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calculator className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Módulo no disponible
                  </h2>
                  <p className="text-gray-600 mb-6">
                    El cálculo de impuestos está disponible solo para cuentas PyME. 
                    Como emprendedor, puedes gestionar tus finanzas de forma simplificada.
                  </p>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Ir a Mi Negocio
                  </button>
                </div>
              </div>
            ) : (
              <TaxManagement 
                invoices={invoices}
                companyData={companyData}
              />
            )
          )}
          {activeTab === 'intelligence' && (
            <FinancialIntelligence 
              invoices={invoices}
              companyData={companyData}
              isEmprendedor={isEmprendedor}
            />
          )}
          {activeTab === 'dashboard' && (
            <CombinedDashboard 
              invoices={invoices}
              companyData={companyData}
              isEmprendedor={isEmprendedor}
            />
          )}
          {activeTab === 'projections' && (
            <AIProjections 
              invoices={invoices}
            />
          )}
          {activeTab === 'credit' && (
            isEmprendedor ? (
              <div className="max-w-2xl mx-auto mt-20">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 p-8 text-center shadow-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Módulo no disponible
                  </h2>
                  <p className="text-gray-600 mb-6">
                    La calculadora de créditos está disponible solo para cuentas PyME. 
                    Como emprendedor, enfócate en hacer crecer tu negocio primero.
                  </p>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Ir a Mi Negocio
                  </button>
                </div>
              </div>
            ) : (
              <CreditCalculator 
                invoices={invoices}
              />
            )
          )}
        </main>
      </div>

      {/* Onboarding Tour para nuevos usuarios */}
      <OnboardingTour />

      {/* Chat Flotante con contexto del dashboard */}
      <FloatingChat dashboardContext={dashboardContext} />
    </div>
  )
}

export default Dashboard
