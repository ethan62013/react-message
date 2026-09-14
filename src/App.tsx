import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router'
import './App.css'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { toggleSysLanguage, toggleSysStyle } from './store/slices/sysSetting'

function App() {
  const dispatch = useAppDispatch()
  const { sysStyle, sysLanguage } = useAppSelector((state) => state.sysSetting)

  useEffect(() => {
    document.documentElement.dataset.theme = sysStyle
    document.documentElement.lang = sysLanguage
  }, [sysStyle, sysLanguage])

  return (
    <>
      <nav className="app-nav">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/add-user">Add User</NavLink>
        <NavLink to="/users">Users</NavLink>
        <button
          type="button"
          className="app-setting"
          onClick={() => dispatch(toggleSysStyle())}
        >
          {sysStyle === 'light' ? '暗色' : '亮色'}
        </button>
        <button
          type="button"
          className="app-setting"
          onClick={() => dispatch(toggleSysLanguage())}
        >
          {sysLanguage === 'zh-CN' ? '中文' : 'English'}
        </button>
      </nav>
      <Outlet />
    </>
  )
}

export default App
