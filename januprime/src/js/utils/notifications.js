export function showNotification(message, type = 'info') {
  // Remover notificações existentes para evitar sobreposição
  const existingNotifications = document.querySelectorAll('.custom-notification');
  existingNotifications.forEach(notif => notif.remove());
  
  // Criar elemento de notificação
  const notification = document.createElement('div');
  notification.className = 'custom-notification';
  
  // Definir cores e estilos baseados no tipo
  const styles = {
    success: {
      backgroundColor: '#d4edda',
      borderColor: '#c3e6cb',
      color: '#155724',
      icon: '✓'
    },
    error: {
      backgroundColor: '#f8d7da',
      borderColor: '#f5c6cb',
      color: '#721c24',
      icon: '✕'
    },
    warning: {
      backgroundColor: '#fff3cd',
      borderColor: '#ffeaa7',
      color: '#856404',
      icon: '⚠'
    },
    info: {
      backgroundColor: '#d1ecf1',
      borderColor: '#bee5eb',
      color: '#0c5460',
      icon: 'ℹ'
    }
  };
  
  const style = styles[type] || styles.info;
  
  // Aplicar estilos inline para garantir visibilidade
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    min-width: 350px;
    max-width: 500px;
    padding: 16px 20px;
    margin-bottom: 10px;
    background-color: ${style.backgroundColor};
    border: 2px solid ${style.borderColor};
    border-radius: 8px;
    color: ${style.color};
    font-weight: 500;
    font-size: 14px;
    line-height: 1.4;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: space-between;
    animation: slideInRight 0.3s ease-out;
    word-wrap: break-word;
  `;
  
  // Adicionar ícone e mensagem
  notification.innerHTML = `
    <div style="display: flex; align-items: center; flex: 1;">
      <span style="font-size: 18px; margin-right: 12px; font-weight: bold;">${style.icon}</span>
      <span>${message}</span>
    </div>
    <button type="button" onclick="this.parentElement.remove()" 
            style="background: none; border: none; color: ${style.color}; font-size: 18px; 
                   cursor: pointer; padding: 0; margin-left: 12px; opacity: 0.7; 
                   transition: opacity 0.2s;" 
            onmouseover="this.style.opacity='1'" 
            onmouseout="this.style.opacity='0.7'"
            title="Fechar">
      ×
    </button>
  `;
  
  // Adicionar CSS para animação se não existir
  if (!document.querySelector('#notification-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'notification-styles';
    styleSheet.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      
      .custom-notification {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
    `;
    document.head.appendChild(styleSheet);
  }
  
  // Adicionar ao body
  document.body.appendChild(notification);
  
  // Remover automaticamente após 4 segundos com animação
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 4000);
  
  // Adicionar hover para pausar o timer
  let timeoutId;
  const resetTimer = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }
    }, 4000);
  };
  
  notification.addEventListener('mouseenter', () => {
    clearTimeout(timeoutId);
  });
  
  notification.addEventListener('mouseleave', resetTimer);
  
  // Iniciar timer
  resetTimer();
}
