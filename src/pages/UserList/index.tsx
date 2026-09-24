import { PlusOutlined } from '@ant-design/icons'
import { Button, Form, Input, Modal, Popconfirm, Space, Switch, Table, Tag, type TableColumnsType } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SysUser } from '../../api/auth'
import { useApiNotify } from '../../api/notify'
import {
  createUserRequest,
  deleteUserRequest,
  listUsersRequest,
  setUserStatusRequest,
  updateUserRequest,
  type UserWriteBody,
} from '../../api/users'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setSession } from '../../store/slices/authSlice'

type UserForm = {
  username: string
  nickname: string
  email: string
  org?: string
  password?: string
}

function UserList() {
  const { t } = useTranslation()
  const notify = useApiNotify()
  const dispatch = useAppDispatch()
  const session = useAppSelector((state) => state.auth)
  const selfId = session.user?.id

  const [form] = Form.useForm<UserForm>()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [list, setList] = useState<SysUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<SysUser | null>(null)

  const load = useCallback(
    async (nextPage = page, nextSize = pageSize) => {
      setLoading(true)
      try {
        const res = await listUsersRequest(nextPage, nextSize)
        setList(res.data?.list ?? [])
        setTotal(res.data?.total ?? 0)
        setPage(res.data?.page ?? nextPage)
        setPageSize(res.data?.page_size ?? nextSize)
      } catch (err) {
        notify.fail(err, t('common.offline'))
      } finally {
        setLoading(false)
      }
    },
    [notify, page, pageSize, t],
  )

  useEffect(() => {
    void load(page, pageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when page changes
  }, [page, pageSize])

  function openCreate() {
    setEditing(null)
    form.resetFields()
    setOpen(true)
  }

  function openEdit(row: SysUser) {
    setEditing(row)
    form.setFieldsValue({
      username: row.username,
      nickname: row.nickname,
      email: row.email,
      org: row.org,
      password: '',
    })
    setOpen(true)
  }

  function syncSelf(user: SysUser) {
    if (session.token && session.user?.id === user.id) {
      dispatch(setSession({ token: session.token, user }))
    }
  }

  async function handleSave() {
    let values: UserForm
    try {
      values = await form.validateFields()
    } catch {
      return
    }
    const body: UserWriteBody = {
      username: values.username.trim(),
      nickname: values.nickname.trim(),
      email: values.email.trim(),
      org: values.org?.trim() || undefined,
    }
    if (values.password?.trim()) {
      body.password = values.password
    }
    setSaving(true)
    try {
      if (editing) {
        const res = await updateUserRequest(editing.id, body)
        if (res.data) syncSelf(res.data)
        notify.success(t('workspace.userUpdated'))
      } else {
        await createUserRequest({ ...body, password: body.password })
        notify.success(t('workspace.userCreated'))
      }
      setOpen(false)
      await load(editing ? page : 1, pageSize)
      if (!editing) setPage(1)
    } catch (err) {
      notify.fail(err, t('common.offline'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteUserRequest(id)
      notify.success(t('workspace.userDeleted'))
      const nextPage = list.length === 1 && page > 1 ? page - 1 : page
      setPage(nextPage)
      await load(nextPage, pageSize)
    } catch (err) {
      notify.fail(err, t('common.offline'))
    }
  }

  async function handleStatus(row: SysUser, enabled: boolean) {
    try {
      await setUserStatusRequest(row.id, enabled ? 1 : 0)
      notify.success(enabled ? t('workspace.userEnabled') : t('workspace.userDisabled'))
      await load(page, pageSize)
    } catch (err) {
      notify.fail(err, t('common.offline'))
    }
  }

  const columns: TableColumnsType<SysUser> = [
    { title: t('workspace.userUsername'), dataIndex: 'username', ellipsis: true },
    { title: t('workspace.nickname'), dataIndex: 'nickname', ellipsis: true },
    { title: t('workspace.email'), dataIndex: 'email', ellipsis: true },
    { title: t('workspace.userOrg'), dataIndex: 'org', ellipsis: true, render: (v: string) => v || '—' },
    {
      title: t('workspace.userStatus'),
      dataIndex: 'status',
      width: 120,
      render: (status: number, row) => (
        <Space>
          <Tag color={status === 1 ? 'success' : 'default'}>
            {status === 1 ? t('workspace.userEnabledLabel') : t('workspace.userDisabledLabel')}
          </Tag>
          <Switch
            size="small"
            checked={status === 1}
            disabled={row.id === selfId}
            onChange={(checked) => void handleStatus(row, checked)}
          />
        </Space>
      ),
    },
    {
      title: t('workspace.userActions'),
      key: 'actions',
      width: 160,
      render: (_, row) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEdit(row)}>
            {t('workspace.userEdit')}
          </Button>
          <Popconfirm
            title={t('workspace.userDeleteConfirm')}
            disabled={row.id === selfId}
            onConfirm={() => void handleDelete(row.id)}
          >
            <Button type="link" size="small" danger disabled={row.id === selfId}>
              {t('workspace.userDelete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h1 className="ws-title">{t('workspace.usersTitle')}</h1>
      <div className="ws-users-toolbar">
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {t('workspace.userAdd')}
        </Button>
      </div>
      <div className="ws-box ws-users-table">
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={list}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: (next, size) => {
              setPage(next)
              setPageSize(size)
            },
          }}
        />
      </div>
      <Modal
        title={editing ? t('workspace.userEdit') : t('workspace.userAdd')}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void handleSave()}
        confirmLoading={saving}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="username"
            label={t('workspace.userUsername')}
            rules={[{ required: true, message: t('workspace.userUsername') }]}
          >
            <Input maxLength={32} />
          </Form.Item>
          <Form.Item
            name="nickname"
            label={t('workspace.nickname')}
            rules={[{ required: true, message: t('workspace.nickname') }]}
          >
            <Input maxLength={32} />
          </Form.Item>
          <Form.Item
            name="email"
            label={t('workspace.email')}
            rules={[
              { required: true, message: t('workspace.email') },
              { type: 'email', message: t('workspace.email') },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="org" label={t('workspace.userOrg')}>
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label={t('workspace.userPassword')}
            extra={editing ? t('workspace.userPasswordHint') : undefined}
            rules={editing ? [] : [{ required: true, message: t('workspace.passwordRequired') }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserList
