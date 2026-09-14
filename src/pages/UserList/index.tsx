import { Link } from 'react-router'
import { clearUsers, removeUser } from '../../store/slices/userSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import './index.css'

const genderLabel = {
  male: '男',
  female: '女',
  other: '其他',
}

function UserList() {
  const list = useAppSelector((state) => state.user.list)
  const dispatch = useAppDispatch()

  return (
    <section className="user-list">
      <h1>用户列表</h1>
      <p className="user-list-hint">数据来自 Redux Toolkit store，新增页提交后会同步到这里。</p>

      {list.length === 0 ? (
        <p>
          还没有用户，去 <Link to="/add-user">新增用户</Link>
        </p>
      ) : (
        <>
          <div className="user-list-toolbar">
            <button type="button" onClick={() => dispatch(clearUsers())}>
              清空
            </button>
          </div>
          <ul>
            {list.map((user) => (
              <li key={user.id}>
                <div>
                  <strong>{user.username}</strong>
                  <span>
                    {genderLabel[user.gender]} · {user.ageText} · {user.phone}
                  </span>
                  <span>{user.email}</span>
                  <span>{user.address}</span>
                </div>
                <button type="button" onClick={() => dispatch(removeUser(user.id))}>
                  删除
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default UserList
