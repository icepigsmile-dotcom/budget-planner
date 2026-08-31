import { InteractionRequiredAuthError, PublicClientApplication, type AccountInfo } from '@azure/msal-browser'

const SCOPES = ['Files.ReadWrite', 'User.Read']
const CLIENT_ID_KEY = 'bp.msalClientId'

let pca: PublicClientApplication | null = null
let initialized = false

export function getStoredClientId(): string {
  try {
    return localStorage.getItem(CLIENT_ID_KEY) || (import.meta.env.VITE_MSAL_CLIENT_ID as string) || ''
  } catch {
    return (import.meta.env.VITE_MSAL_CLIENT_ID as string) || ''
  }
}

export function setStoredClientId(id: string): void {
  localStorage.setItem(CLIENT_ID_KEY, id.trim())
  pca = null
  initialized = false
}

async function getPca(): Promise<PublicClientApplication> {
  const clientId = getStoredClientId()
  if (!clientId) throw new Error('MISSING_CLIENT_ID')
  if (!pca) {
    pca = new PublicClientApplication({
      auth: {
        clientId,
        // personal Microsoft accounts only
        authority: 'https://login.microsoftonline.com/consumers',
        redirectUri: window.location.origin + import.meta.env.BASE_URL,
      },
      cache: { cacheLocation: 'localStorage' },
    })
  }
  if (!initialized) {
    await pca.initialize()
    initialized = true
  }
  return pca
}

/** Call once at app start — completes a pending login redirect if there is one. */
export async function completeRedirect(): Promise<AccountInfo | null> {
  if (!getStoredClientId()) return null
  const app = await getPca()
  const result = await app.handleRedirectPromise()
  if (result?.account) {
    app.setActiveAccount(result.account)
    return result.account
  }
  const accounts = app.getAllAccounts()
  if (accounts.length > 0) {
    app.setActiveAccount(accounts[0])
    return accounts[0]
  }
  return null
}

export async function login(): Promise<void> {
  const app = await getPca()
  await app.loginRedirect({ scopes: SCOPES, prompt: 'select_account' })
}

export async function logout(): Promise<void> {
  if (!getStoredClientId()) return
  const app = await getPca()
  await app.logoutRedirect({ postLogoutRedirectUri: window.location.origin + import.meta.env.BASE_URL })
}

export function getAccount(): AccountInfo | null {
  return pca?.getActiveAccount() ?? null
}

/** Access token for Microsoft Graph; falls back to a login redirect when the session expired. */
export async function getToken(): Promise<string> {
  const app = await getPca()
  const account = app.getActiveAccount()
  if (!account) throw new Error('NOT_SIGNED_IN')
  try {
    const result = await app.acquireTokenSilent({ scopes: SCOPES, account })
    return result.accessToken
  } catch (e) {
    // chỉ chuyển hướng đăng nhập lại khi phiên thật sự hết hạn; lỗi mạng thoáng qua thì ném ra cho tầng đồng bộ báo lỗi
    if (e instanceof InteractionRequiredAuthError) {
      await app.acquireTokenRedirect({ scopes: SCOPES, account })
      throw new Error('REDIRECTING')
    }
    throw e
  }
}
