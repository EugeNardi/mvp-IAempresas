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
  Package
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
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', name: 'Inventario', icon: Package },
    { id: 'intelligence', name: 'Análisis', icon: BarChart3 },
    { id: 'projections', name: 'IA Proyecciones', icon: Brain },
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

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-80 lg:w-72 xl:w-80
          bg-white/95 lg:bg-white/80 backdrop-blur-xl 
          border-r border-gray-200/50 
          transition-transform duration-300 ease-in-out
          flex flex-col shadow-2xl
          ${
            sidebarOpen 
              ? 'translate-x-0' 
              : '-translate-x-full lg:translate-x-0'
          }
        `}
      >
        {/* Sidebar Header */}
        <div className="p-5 lg:p-6 border-b border-gray-200/50 flex items-center justify-between">
          <h1 className="text-lg lg:text-xl font-bold text-gray-900">Sistema de Gestión</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col justify-center p-2 lg:p-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setSidebarOpen(false) // Cerrar sidebar en móvil al seleccionar
              }}
              className={`
                w-full flex items-center space-x-2.5 
                px-3 py-2 lg:py-2.5 
                rounded-lg transition-all text-xs lg:text-sm font-medium group
                ${
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'
                }
              `}
            >
              <tab.icon className={`w-4 h-4 flex-shrink-0 ${
                activeTab === tab.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
              }`} />
              <span className="truncate">{tab.name}</span>
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-3 lg:p-4 border-t border-gray-200/50">
          <div className="p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <p className="text-xs font-medium text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="
          h-14 sm:h-16 lg:h-20 
          bg-white/95 lg:bg-white/80 backdrop-blur-xl 
          border-b border-gray-200/50 
          flex items-center justify-between 
          px-3 sm:px-4 lg:px-8 
          shadow-sm
          sticky top-0 z-30
        ">
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-1 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 lg:p-2.5 hover:bg-gray-100 rounded-lg lg:rounded-xl transition-all flex-shrink-0"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
            </button>
            <h2 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 tracking-tight truncate">
              {tabs.find(t => t.id === activeTab)?.name}
            </h2>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
            {companyData && (
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <Building2 className="w-4 h-4" />
                <span className="font-medium truncate max-w-[150px] lg:max-w-none">{companyData.name}</span>
              </div>
            )}
            <Link
              to="/chat"
              className="
                flex items-center space-x-1.5 sm:space-x-2 
                px-2.5 sm:px-3 lg:px-4 
                py-1.5 sm:py-2 
                rounded-lg lg:rounded-xl 
                text-xs sm:text-sm 
                bg-gray-900 text-white 
                hover:bg-gray-800 active:bg-gray-950
                transition-all shadow-lg
                flex-shrink-0
              "
            >
              <MessageSquare className="w-4 h-4" />
              <span className="font-semibold hidden sm:inline">Chat IA</span>
              <span className="font-semibold sm:hidden">IA</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="
                flex items-center space-x-1.5 sm:space-x-2 
                px-2.5 sm:px-3 lg:px-4 
                py-1.5 sm:py-2 
                rounded-lg lg:rounded-xl 
                text-xs sm:text-sm 
                text-gray-600 
                hover:bg-red-50 hover:text-red-600 
                active:bg-red-100
                transition-all
                flex-shrink-0
              "
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium hidden lg:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10">
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
