import axios from 'axios'

interface ApiErrorMessageOptions {
  fallbackMessage: string
  context?: 'auth' | 'organization' | 'map' | 'generic'
}

interface ApiFailureEvent {
  timestamp: string
  method: string
  url: string
  status: number | null
  code?: string
}

const telemetry: {
  totalFailures: number
  recentFailures: ApiFailureEvent[]
} = {
  totalFailures: 0,
  recentFailures: [],
}

const pushFailure = (event: ApiFailureEvent) => {
  telemetry.totalFailures += 1
  telemetry.recentFailures.unshift(event)
  telemetry.recentFailures = telemetry.recentFailures.slice(0, 50)

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('coordgeo:api-failure'))
  }
}

export const trackApiFailure = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return
  }

  pushFailure({
    timestamp: new Date().toISOString(),
    method: String(error.config?.method ?? 'GET').toUpperCase(),
    url: String(error.config?.url ?? ''),
    status: error.response?.status ?? null,
    code: error.code,
  })
}

export const getApiFailureTelemetry = () => {
  return {
    totalFailures: telemetry.totalFailures,
    recentFailures: [...telemetry.recentFailures],
  }
}

const extractDetailMessage = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const detail = (payload as { detail?: unknown }).detail
  return typeof detail === 'string' && detail.length > 0 ? detail : null
}

export const getUserFacingApiError = (error: unknown, options: ApiErrorMessageOptions): string => {
  if (!axios.isAxiosError(error)) {
    console.error('Non-Axios error:', error)
    return options.fallbackMessage
  }

  // Log detailed error for debugging
  console.error('API Error:', {
    code: error.code,
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    url: error.config?.url,
    method: error.config?.method,
  })

  if (!error.response) {
    // Network error, CORS error, timeout, etc
    if (error.code === 'ECONNABORTED') {
      return 'Requisição expirou. Tente novamente.'
    }
    if (error.code === 'ECONNREFUSED') {
      return 'Não conseguiu conectar ao servidor. Verifique se o backend está rodando.'
    }
    if (error.message.includes('CORS')) {
      return 'Erro CORS. Problema de configuração entre cliente e servidor.'
    }
    return 'Falha de rede. Verifique sua conexão e tente novamente.'
  }

  const status = error.response.status
  const detail = extractDetailMessage(error.response.data)

  if (status === 400) {
    // Try to extract field-specific errors
    const data = error.response.data as Record<string, unknown>
    if (typeof data === 'object' && data !== null) {
      const errors = Object.entries(data)
        .filter(([key]) => key !== 'detail')
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return `${key}: ${value.join(', ')}`
          }
          return `${key}: ${value}`
        })
        .join(' | ')
      
      if (errors) {
        return errors
      }
    }
    return detail ?? 'Requisição inválida. Verifique os dados enviados.'
  }

  if (status === 401) {
    if (options.context === 'auth') {
      return 'Falha no login. Verifique suas credenciais.'
    }
    return 'Sua sessão expirou. Faça login novamente.'
  }

  if (status === 403) {
    return 'Acesso negado para a organização selecionada.'
  }

  if (status >= 500) {
    return `Erro no servidor (${status}). Tente novamente em instantes.`
  }

  return detail ?? options.fallbackMessage
}
