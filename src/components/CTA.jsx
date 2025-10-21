import React from 'react'
import { TrendingUp, DollarSign, Percent, Target, CheckCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const CTA = () => {
  const financialExamples = [
    {
      title: "Interés Compuesto en Acción",
      description: "Invertir $10,000 al 8% anual durante 20 años",
      result: "$46,610",
      improvement: "366% de retorno",
      icon: TrendingUp
    },
    {
      title: "Ahorro Sistemático",
      description: "Ahorrar $500/mes al 6% anual durante 10 años",
      result: "$81,940",
      improvement: "$21,940 de intereses ganados",
      icon: DollarSign
    },
    {
      title: "Optimización Fiscal",
      description: "Reducir gastos innecesarios en 15%",
      result: "+$180,000/año",
      improvement: "En una empresa con $1.2M de gastos",
      icon: Percent
    },
    {
      title: "Reinversión de Ganancias",
      description: "Reinvertir 30% de utilidades anuales",
      result: "2.5x crecimiento",
      improvement: "En 5 años vs no reinvertir",
      icon: Target
    }
  ]

  return (
    <section id="intelligence" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            El Poder de la{' '}
            <span className="text-cyan-600 inline-block hover:scale-105 transition-transform duration-300">
              Inteligencia Financiera
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ejemplos reales de cómo las decisiones financieras inteligentes transforman negocios
          </p>
        </div>

        {/* Financial Examples Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {financialExamples.map((example, index) => {
            const Icon = example.icon
            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {example.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {example.description}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-sm text-gray-600">Resultado:</span>
                    <span className="text-2xl font-bold text-gray-900">{example.result}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-gray-700" />
                    <span className="text-gray-600">{example.improvement}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Compound Interest Visualization - Light Theme with Dark Accents */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl p-8 md:p-16 mb-12 shadow-2xl border border-gray-200">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          {/* Subtle Glow Effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gray-900/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-900/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gray-900 text-white rounded-full px-4 py-1.5 mb-6 shadow-lg">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Crecimiento Exponencial</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                El Poder del Interés Compuesto
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Inversión inicial de <span className="font-bold text-gray-900">$100,000</span> al <span className="font-bold text-cyan-600">8% anual</span> durante <span className="font-bold text-gray-900">20 años</span>
              </p>
            </div>
            
            {/* Main Chart - 21 bars (Years 0-20) */}
            <div className="bg-white rounded-2xl p-6 md:p-10 border-2 border-gray-900 shadow-2xl mb-8">
              <div className="relative h-[450px] pt-4">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <div key={i} className="border-t border-gray-200"></div>
                  ))}
                </div>

                {/* 21 Bars - Years 0 to 20 (connected bars showing exponential curve) */}
                <div className="absolute inset-x-0 bottom-8 flex items-end gap-0 px-4" style={{height: '380px'}}>
                  {[
                    { year: 0, value: 100000, height: 30 },
                    { year: 1, value: 108000, height: 38 },
                    { year: 2, value: 116640, height: 48 },
                    { year: 3, value: 125971, height: 58 },
                    { year: 4, value: 136049, height: 70 },
                    { year: 5, value: 146933, height: 83 },
                    { year: 6, value: 158687, height: 98 },
                    { year: 7, value: 171382, height: 114 },
                    { year: 8, value: 185093, height: 132 },
                    { year: 9, value: 199900, height: 151 },
                    { year: 10, value: 215892, height: 172 },
                    { year: 11, value: 233164, height: 195 },
                    { year: 12, value: 251817, height: 220 },
                    { year: 13, value: 271962, height: 246 },
                    { year: 14, value: 293719, height: 275 },
                    { year: 15, value: 317217, height: 305 },
                    { year: 16, value: 342594, height: 337 },
                    { year: 17, value: 370002, height: 371 },
                    { year: 18, value: 399602, height: 407 },
                    { year: 19, value: 431570, height: 445 },
                    { year: 20, value: 466096, height: 485 }
                  ].map((data, index) => {
                    const getColor = (idx) => {
                      if (idx === 0) return 'from-gray-400 to-gray-300';
                      if (idx <= 5) return 'from-gray-700 to-gray-600';
                      if (idx <= 10) return 'from-gray-800 to-gray-700';
                      if (idx <= 15) return 'from-gray-900 to-gray-800';
                      return 'from-black to-gray-900';
                    };
                    
                    return (
                      <div 
                        key={data.year} 
                        className="flex-1 flex flex-col justify-end items-center group relative"
                        style={{minWidth: '18px', maxWidth: '50px'}}
                      >
                        <div className="w-full relative flex flex-col items-center">
                          <div 
                            className={`w-full bg-gradient-to-t ${getColor(index)} transition-all duration-500 ease-out group-hover:scale-y-[1.08] group-hover:scale-x-110 cursor-pointer shadow-md group-hover:shadow-2xl group-hover:z-10 relative`}
                            style={{
                              height: `${data.height}px`,
                              animation: `slideUp 0.6s ease-out ${index * 0.05}s both`,
                              borderRadius: '3px 3px 0 0'
                            }}
                          >
                            {/* Tooltip on hover */}
                            <div className="absolute -top-20 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-2xl whitespace-nowrap z-50 pointer-events-none">
                              <div className="text-center">
                                <div className="text-sm mb-1">${(data.value / 1000).toFixed(0)}K</div>
                                <div className="text-[10px] text-gray-400 mb-0.5">Año {data.year}</div>
                                <div className="text-[10px] text-cyan-400">+{(((data.value - 100000) / 100000) * 100).toFixed(0)}%</div>
                              </div>
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Year labels below chart */}
                <div className="absolute inset-x-0 bottom-0 flex justify-around px-4">
                  {[0, 5, 10, 15, 20].map((year) => (
                    <div key={year} className="flex-1 text-center" style={{maxWidth: `${100/5}%`}}>
                      <p className="text-xs font-bold text-gray-900">{year}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t-2 border-gray-900">
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-md">
                  <p className="text-3xl font-black text-gray-900">+47%</p>
                  <p className="text-xs text-gray-600 mt-2 font-semibold">5 años</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-md">
                  <p className="text-3xl font-black text-gray-900">+116%</p>
                  <p className="text-xs text-gray-600 mt-2 font-semibold">10 años</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-md">
                  <p className="text-3xl font-black text-gray-900">+366%</p>
                  <p className="text-xs text-gray-600 mt-2 font-semibold">20 años</p>
                </div>
              </div>
            </div>

            {/* Key Insight */}
            <div className="bg-gray-900 text-white rounded-2xl p-8 shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-gray-900" />
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-3">La Magia del Tiempo</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    El interés compuesto crece <span className="font-bold text-cyan-400">exponencialmente</span>, no linealmente. 
                    En 20 años, tu inversión se multiplica por <span className="font-bold text-cyan-400">4.66x</span>. 
                    La curva se acelera: el año 20 genera más ganancias que los primeros 10 años juntos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}</style>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Aplica estos principios a tu negocio
          </h3>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Nuestra plataforma te ayuda a tomar decisiones financieras inteligentes con análisis en tiempo real
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-md font-semibold hover:bg-gray-800 transition-colors"
          >
            <span>Comenzar Gratis</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CTA
