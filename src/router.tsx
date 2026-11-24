import { Navigate, Outlet, createBrowserRouter } from 'react-router'
import { AdminShell, ForumShell, RootLayout } from './App'
import Home from './pages/Home'
import ImageGen from './pages/ImageGen'
import KbPage from './pages/Kb'
import KbAskPage from './pages/Kb/Ask'
import Login from './pages/Login'
import Register from './pages/Register'
import ForumDetail from './pages/Forum/Detail'
import ForumList from './pages/Forum/List'
import ForumNew from './pages/Forum/New'
import Forgot from './pages/Forgot'
import NotFound from './pages/NotFound'
import Settings from './pages/Settings'
import UserList from './pages/UserList'
import WordGen from './pages/WordGen'
import { useAppSelector } from './store/hooks'

function GuestRoute() {
  const token = useAppSelector((state) => state.auth.token)
  if (token) {
    return <Navigate to="/forum" replace />
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
          { index: true, element: <Navigate to="/forum" replace /> },
          {
            Component: ForumShell,
            children: [
              { path: 'forum', Component: ForumList },
              { path: 'forum/new', Component: ForumNew },
              { path: 'forum/:id', Component: ForumDetail },
            ],
          },
          {
            path: 'admin',
            Component: AdminShell,
            children: [
              { index: true, Component: Home },
              { path: 'users', Component: UserList },
              { path: 'word', Component: WordGen },
              { path: 'image', Component: ImageGen },
              { path: 'kb', Component: KbPage },
              { path: 'kb/ask', Component: KbAskPage },
              { path: 'settings', Component: Settings },
            ],
          },
          { path: '*', Component: NotFound },
        ],
      },
    ],
  },
])
