import React, { useState } from 'react'
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
  Crown
} from 'lucide-react'
import CompanyProfile from '../components/dashboard/CompanyProfile'
import Movimientos from '../components/dashboard/Movimientos'
import Remitos from '../components/dashboard/Remitos'
import TaxManagement from '../components/dashboard/TaxManagementNew'
import FinancialIntelligence from '../components/dashboard/FinancialIntelligence'
import CombinedDashboard from '../components/dashboard/CombinedDashboard'
import AIProjections from '../components/dashboard/AIProjections'
import CreditCalculator from '../components/dashboard/CreditCalculator'
import Inventory from './Inventory'

const Dashboard = () => {
  const { user, signOut } = useAuth()
  const { companyData, invoices } = useData()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [sidebarOpen, setSidebarOpen] = useState(false) // Cerrado por defecto en móvil

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const tabs = [
    { id: 'profile', name: 'Mi Empresa', icon: Building2 },
    { id: 'movimientos', name: 'Movimientos', icon: FileText },
    { id: 'dashboard', name: 'Panel de Control', icon: LayoutDashboard },
    { id: 'inventory', name: 'Inventario', icon: Package },
    { id: 'intelligence', name: 'Análisis', icon: BarChart3 },
    { id: 'projections', name: 'Proyecciones IA', icon: Brain },
    { id: 'credit', name: 'Créditos', icon: Calculator },
    { id: 'remitos', name: 'Remitos', icon: Upload },
    { id: 'taxes', name: 'Impuestos', icon: Target },
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Vercel Style */}
      <div className={`
        fixed lg:sticky top-0 left-0 h-screen
        w-64 lg:w-72 bg-white border-r border-gray-200
        flex flex-col z-40 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo/Header */}
        <div className="p-4 lg:p-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-base lg:text-lg font-semibold text-gray-900">Sistema de Gestión</h1>
            <p className="text-xs text-gray-500 mt-0.5">Panel Empresarial</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setSidebarOpen(false)
              }}
              className={`
                w-full flex items-center gap-3 
                px-3 py-2.5
                rounded-md transition-all duration-150 text-sm font-medium group
                ${
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <tab.icon className={`w-4 h-4 flex-shrink-0 ${
                activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
              }`} />
              <span className="truncate text-base">{tab.name}</span>
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-gray-200">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
            </div>
            <Link
              to="/premium"
              className="w-full px-3 py-1.5 mb-2 text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors flex items-center justify-center gap-2 border border-gray-200"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Ver Mi Plan</span>
            </Link>
            <button
              onClick={signOut}
              className="w-full px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center justify-center gap-2 border border-red-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full bg-gray-50">
        {/* Header - Vercel Style */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {tabs.find(t => t.id === activeTab)?.name}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            {companyData && (
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200">
                <Building2 className="w-4 h-4" />
                <span className="font-medium">{companyData.name}</span>
              </div>
            )}
            <Link
              to="/chat"
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chat IA</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' && (
            <CompanyProfile />
          )}
          {activeTab === 'movimientos' && (
            <Movimientos 
              companyData={companyData}
            />
          )}
          {activeTab === 'inventory' && (
            <Inventory />
          )}
          {activeTab === 'remitos' && (
            <Remitos 
              companyData={companyData}
            />
          )}
          {activeTab === 'taxes' && (
            <TaxManagement 
              invoices={invoices}
              companyData={companyData}
            />
          )}
          {activeTab === 'intelligence' && (
            <FinancialIntelligence 
              invoices={invoices}
              companyData={companyData}
            />
          )}
          {activeTab === 'dashboard' && (
            <CombinedDashboard 
              invoices={invoices}
              companyData={companyData}
            />
          )}
          {activeTab === 'projections' && (
            <AIProjections 
              invoices={invoices}
            />
          )}
          {activeTab === 'credit' && (
            <CreditCalculator 
              invoices={invoices}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
