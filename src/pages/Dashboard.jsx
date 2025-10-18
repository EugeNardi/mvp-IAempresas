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
import UploadInvoices from '../components/dashboard/UploadInvoices'
import FinancialReports from '../components/dashboard/FinancialReports'
import TaxManagement from '../components/dashboard/TaxManagement'
import FinancialIntelligence from '../components/dashboard/FinancialIntelligence'
import ExecutiveDashboard from '../components/dashboard/ExecutiveDashboard'
import PowerBIIntegration from '../components/dashboard/PowerBIIntegration'
import AIProjections from '../components/dashboard/AIProjections'
import CreditCalculator from '../components/dashboard/CreditCalculator'
import Inventory from './Inventory'
import Sales from '../components/dashboard/Sales'

const Dashboard = () => {
  const { user, signOut } = useAuth()
  const { companyData, invoices } = useData()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const tabs = [
    { id: 'profile', name: 'Empresa', icon: Building2 },
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', name: 'Inventario', icon: Package },
    { id: 'sales', name: 'Ventas', icon: TrendingUp },
    { id: 'upload', name: 'Facturas', icon: Upload },
    { id: 'intelligence', name: 'Métricas', icon: BarChart3 },
    { id: 'projections', name: 'Proyecciones IA', icon: Brain },
    { id: 'credit', name: 'Créditos', icon: Calculator },
    { id: 'reports', name: 'Reportes', icon: FileText },
    { id: 'powerbi', name: 'Análisis', icon: LineChart },
    { id: 'taxes', name: 'Impuestos', icon: Target },
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-72' : 'w-0'
        } bg-white/80 backdrop-blur-xl border-r border-gray-200/50 transition-all duration-300 overflow-hidden flex flex-col shadow-2xl`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200/50">
          <h1 className="text-lg font-semibold text-gray-900 text-center">Sistema de Gestión</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-sm group ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white font-semibold shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${
                activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
              }`} />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-6 border-t border-gray-200/50">
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-xs font-medium text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-all"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700" />
              )}
            </button>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {tabs.find(t => t.id === activeTab)?.name}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {companyData && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Building2 className="w-4 h-4" />
                <span className="font-medium">{companyData.name}</span>
              </div>
            )}
            <Link
              to="/chat"
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-lg"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="font-semibold">Chat IA</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Salir</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-10">
          {activeTab === 'profile' && (
            <CompanyProfile />
          )}
          {activeTab === 'inventory' && (
            <Inventory />
          )}
          {activeTab === 'sales' && (
            <Sales />
          )}
          {activeTab === 'upload' && (
            <UploadInvoices 
              companyData={companyData}
            />
          )}
          {activeTab === 'reports' && (
            <FinancialReports 
              invoices={invoices}
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
            <ExecutiveDashboard 
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
          {activeTab === 'powerbi' && (
            <PowerBIIntegration 
              invoices={invoices}
              companyData={companyData}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
