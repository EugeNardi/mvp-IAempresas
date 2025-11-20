import React from 'react';
import { useData } from '../../context/DataContext';

/**
 * Wrapper que adapta los componentes según el tipo de cuenta
 * - Emprendedor: Versión simplificada
 * - PyME: Versión completa y detallada
 */
const AdaptiveWrapper = ({ children, emprendedorVersion, pymeVersion }) => {
  const { companyData } = useData();
  const isEmprendedor = companyData?.businessType === 'emprendedor';

  // Si no hay tipo de cuenta, mostrar versión emprendedor por defecto
  if (!companyData?.businessType) {
    return emprendedorVersion || children;
  }

  // Retornar versión según tipo de cuenta
  if (isEmprendedor) {
    return emprendedorVersion || children;
  }

  return pymeVersion || children;
};

export default AdaptiveWrapper;
