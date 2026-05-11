const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

type QueryValue = string | number | boolean | null | undefined
type QueryParams = Record<string, QueryValue>

/**
 * Helper function to build up an API URL to call
 * @param path 
 * @param query 
 * @returns 
 */
function buildUrl(path: string, query?: QueryParams) {
  const url = new URL(path, API_BASE_URL)

  if (!query) {
    return url.toString()
  }

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') {
      continue
    }

    url.searchParams.set(key, String(value))
  }

  return url.toString()
}

/**
 * Helper function to make requests from the API.
 * @param path 
 * @param init 
 * @param query 
 * @returns 
 */
export async function requestJson<T>(path: string, init?: RequestInit, query?: QueryParams): Promise<T> {
  const response = await fetch(buildUrl(path, query), {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...init?.headers,
    },
    ...init,
  })

  if (!response.ok) {
    throw new Error(`Catalogue API request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

