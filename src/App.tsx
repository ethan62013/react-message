import { NavLink, Outlet } from 'react-router'
import './App.css'

function App() {
  return (
    <>
      <nav className="app-nav">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/about">About</NavLink>
      </nav>
      <Outlet />
    </>
  )
}

export default App
