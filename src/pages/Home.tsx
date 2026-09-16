import { useAppSelector } from '../store/hooks'

function Home() {
  const user = useAppSelector((state) => state.auth.user)
  const name = user?.nickname || user?.username || ''

  return (
    <section id="center">
      <div>
        <h1>首页</h1>
        <p>欢迎回来，{name}</p>
      </div>
    </section>
  )
}

export default Home
