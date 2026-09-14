import { createBrowserRouter } from 'react-router'
import App from './App'
import About from './pages/About'
import AddUser from './pages/AddUser'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import UserList from './pages/UserList'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      { index: true, Component: Home },
      { path: 'about', Component: About },
      { path: 'add-user', Component: AddUser },
      { path: 'users', Component: UserList },
      { path: '*', Component: NotFound },
    ],
  },
])
