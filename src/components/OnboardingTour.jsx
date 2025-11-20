import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';

const OnboardingTour = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const steps = [
    {
      target: 'profile-tab',
      title: '¡Bienvenido! 👋',
      description: 'Comencemos configurando tu negocio. Haz clic en "Mi Negocio" para completar tus datos.',
      position: 'right'
    },
    {
      target: 'movimientos-tab',
      title: 'Carga tus movimientos 📊',
      description: 'Aquí podrás cargar tus ventas, compras y otros movimientos financieros. Es el corazón del sistema.',
      position: 'right'
    },
    {
      target: 'nuevo-movimiento-btn',
      title: 'Agrega tu primer movimiento 💰',
      description: 'Haz clic en este botón para cargar tu primera venta, compra o gasto. ¡Es muy fácil!',
      position: 'bottom'
    },
    {
      target: null,
      title: '¡Todo listo! ✨',
      description: 'Ya puedes comenzar a usar el sistema. Recuerda que tienes 21 días de prueba gratuita.',
      position: 'center'
    }
  ];

  useEffect(() => {
    // Verificar si el usuario ya completó el onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted');
    if (!hasCompletedOnboarding) {
      // Esperar un momento antes de mostrar el tour
      setTimeout(() => setIsVisible(true), 500);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];

  // Si es el último paso (centro), mostrar modal centrado
  if (currentStepData.position === 'center') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {currentStepData.title}
            </h3>
            <p className="text-gray-600 mb-6">
              {currentStepData.description}
            </p>
            <button
              onClick={handleComplete}
              className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Comenzar a usar el sistema
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tooltip flotante
  const targetElement = currentStepData.target ? document.getElementById(currentStepData.target) : null;
  
  if (!targetElement) {
    return (
      <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              {currentStepData.title}
            </h3>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 mb-6">
            {currentStepData.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? 'bg-gray-900' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              {currentStep < steps.length - 1 ? 'Siguiente' : 'Finalizar'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const rect = targetElement.getBoundingClientRect();
  
  let tooltipStyle = {
    position: 'fixed',
    zIndex: 60
  };

  if (currentStepData.position === 'right') {
    tooltipStyle.top = `${rect.top}px`;
    tooltipStyle.left = `${rect.right + 20}px`;
  } else if (currentStepData.position === 'bottom') {
    tooltipStyle.top = `${rect.bottom + 20}px`;
    tooltipStyle.left = `${rect.left}px`;
  } else {
    tooltipStyle.top = `${rect.top}px`;
    tooltipStyle.left = `${rect.left}px`;
  }

  return (
    <>
      {/* Overlay oscuro */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={handleSkip} />
      
      {/* Highlight del elemento */}
      <div
        className="fixed z-50 pointer-events-none"
        style={{
          top: `${rect.top - 4}px`,
          left: `${rect.left - 4}px`,
          width: `${rect.width + 8}px`,
          height: `${rect.height + 8}px`,
          border: '3px solid #fff',
          borderRadius: '12px',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3)'
        }}
      />

      {/* Tooltip */}
      <div style={tooltipStyle} className="bg-white rounded-xl p-6 shadow-2xl max-w-sm z-60">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 pr-4">
            {currentStepData.title}
          </h3>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          {currentStepData.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-gray-900' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Saltar
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              {currentStep < steps.length - 1 ? 'Siguiente' : 'Finalizar'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingTour;
