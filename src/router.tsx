import { Navigate, Outlet, createBrowserRouter } from 'react-router'
import App, { RootLayout } from './App'
import Home from './pages/Home'
import ImageGen from './pages/ImageGen'
import Login from './pages/Login'
import Register from './pages/Register'
import Forgot from './pages/Forgot'
import NotFound from './pages/NotFound'
import Settings from './pages/Settings'
import WordGen from './pages/WordGen'
import { useAppSelector } from './store/hooks'

function GuestRoute() {
  const token = useAppSelector((state) => state.auth.token)
  if (token) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}

function ProtectedRoute() {
  const token = useAppSelector((state) => state.auth.token)
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      {
        Component: GuestRoute,
        children: [
          { path: 'login', Component: Login },
          { path: 'register', Component: Register },
          { path: 'forgot', Component: Forgot },
        ],
      },
      {
        path: '/',
        Component: ProtectedRoute,
        children: [
          {
            Component: App,
            children: [
              { index: true, Component: Home },
              { path: 'word', Component: WordGen },
              { path: 'image', Component: ImageGen },
              { path: 'settings', Component: Settings },
              { path: '*', Component: NotFound },
            ],
          },
        ],
      },
    ],
  },
])
