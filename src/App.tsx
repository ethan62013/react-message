import { LogoutOutlined, TranslationOutlined } from '@ant-design/icons'
import { Button, ConfigProvider, Space, Typography } from 'antd'
import enUS from 'antd/locale/en_US'
import zhCN from 'antd/locale/zh_CN'
import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import './App.css'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { clearSession } from './store/slices/authSlice'
import { toggleSysLanguage } from './store/slices/sysSetting'

export function RootLayout() {
  const { sysLanguage } = useAppSelector((state) => state.sysSetting)
  const location = useLocation()
  const isLogin = location.pathname === '/login'

  useEffect(() => {
    document.documentElement.lang = sysLanguage
    document.documentElement.dataset.page = isLogin ? 'login' : 'app'
  }, [sysLanguage, isLogin])

  return (
    <ConfigProvider
      locale={sysLanguage === 'zh-CN' ? zhCN : enUS}
      button={{ autoInsertSpace: false }}
      theme={{
        token: {
          colorPrimary: '#aa3bff',
          borderRadius: 8,
          fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
        },
      }}
    >
      <Outlet />
    </ConfigProvider>
  )
}

function App() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { sysLanguage } = useAppSelector((state) => state.sysSetting)
  const user = useAppSelector((state) => state.auth.user)

  function handleLogout() {
    dispatch(clearSession())
    navigate('/login', { replace: true })
  }

  return (
    <>
      <nav className="app-nav">
        <Button
          type={location.pathname === '/' ? 'primary' : 'default'}
          onClick={() => navigate('/')}
        >
          Home
        </Button>
        <Space className="app-nav-actions" size={8}>
          <Typography.Text className="app-user">
            {user?.nickname || user?.username}
          </Typography.Text>
          <Button
            color="danger"
            variant="outlined"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            退出
          </Button>
          <Button
            color="primary"
            variant="outlined"
            icon={<TranslationOutlined />}
            onClick={() => dispatch(toggleSysLanguage())}
          >
            {sysLanguage === 'zh-CN' ? '中文' : 'English'}
          </Button>
        </Space>
      </nav>
      <Outlet />
    </>
  )
}

export default App
