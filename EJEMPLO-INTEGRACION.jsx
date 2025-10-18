// EJEMPLO: Cómo integrar la base de datos en tus componentes

// ============================================
// 1. EJEMPLO: Dashboard con datos persistentes
// ============================================
import { useDatabase } from './hooks/useDatabase'

function Dashboard() {
  const { loading, company, invoices, refresh } = useDatabase()

  if (loading) return <div>Cargando datos...</div>

  return (
    <div>
      <h1>{company?.name || 'Mi Empresa'}</h1>
      <p>Facturas: {invoices.length}</p>
      <button onClick={refresh}>Refrescar</button>
    </div>
  )
}

// ============================================
// 2. EJEMPLO: Guardar empresa
// ============================================
import { useCompany } from './hooks/useDatabase'

function CompanyProfile() {
  const { company, saveCompany, loading } = useCompany()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = {
      name: e.target.name.value,
      cuit: e.target.cuit.value,
      // ... más campos
    }
    
    const { success } = await saveCompany(formData)
    if (success) alert('¡Guardado!')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" defaultValue={company?.name} />
      <button type="submit">Guardar</button>
    </form>
  )
}

// ============================================
// 3. EJEMPLO: Subir facturas
// ============================================
import { useInvoices } from './hooks/useDatabase'

function UploadInvoices() {
  const { invoices, addInvoice, addInvoices } = useInvoices()

  const handleAddOne = async () => {
    await addInvoice({
      type: 'income',
      number: 'FAC-001',
      date: '2024-01-15',
      amount: 50000,
      category: 'Ventas',
      description: 'Venta de servicios'
    })
  }

  const handleAddMultiple = async (invoicesArray) => {
    await addInvoices(invoicesArray)
  }

  return (
    <div>
      <h2>Facturas: {invoices.length}</h2>
      <button onClick={handleAddOne}>Agregar Factura</button>
    </div>
  )
}

// ============================================
// 4. EJEMPLO: Chat persistente
// ============================================
import { useChatConversations } from './hooks/useDatabase'

function Chat() {
  const {
    conversations,
    currentConversation,
    messages,
    createConversation,
    addMessage
  } = useChatConversations()

  const handleNewChat = async () => {
    await createConversation('Nueva conversación')
  }

  const handleSend = async (content) => {
    await addMessage('user', content)
    // Llamar a tu API de IA aquí
    const response = 'Respuesta de la IA'
    await addMessage('assistant', response)
  }

  return (
    <div>
      <button onClick={handleNewChat}>Nuevo Chat</button>
      <div>
        {messages.map(msg => (
          <div key={msg.id}>{msg.content}</div>
        ))}
      </div>
    </div>
  )
}
