import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import './index.css'

type Gender = '' | 'male' | 'female' | 'other'
type AgeUnit = 'years' | 'months'

type UserForm = {
  username: string
  gender: Gender
  birthDate: string
  ageUnit: AgeUnit
  phone: string
  email: string
  address: string
}

const emptyForm: UserForm = {
  username: '',
  gender: '',
  birthDate: '',
  ageUnit: 'years',
  phone: '',
  email: '',
  address: '',
}

function todayIsoDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function calcAge(birthDate: string): number | '' {
  if (!birthDate) return ''
  const birth = new Date(`${birthDate}T00:00:00`)
  if (Number.isNaN(birth.getTime())) return ''

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return age < 0 ? '' : age
}

function formatAge(birthDate: string, unit: AgeUnit): string {
  if (!birthDate) return ''
  const birth = new Date(`${birthDate}T00:00:00`)
  if (Number.isNaN(birth.getTime())) return ''

  const today = new Date()
  if (unit === 'months') {
    let months =
      (today.getFullYear() - birth.getFullYear()) * 12 +
      (today.getMonth() - birth.getMonth())
    if (today.getDate() < birth.getDate()) months -= 1
    if (months < 0) return ''
    return `${months} 个月`
  }

  let years = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    years -= 1
  }
  if (years < 0) return ''
  return `${years} 岁`
}

function AddUser() {
  const [form, setForm] = useState<UserForm>(emptyForm)
  const [ageText, setAgeText] = useState('')
  const [submitted, setSubmitted] = useState<string | null>(null)
  const age = calcAge(form.birthDate)

  useEffect(() => {
    setAgeText(formatAge(form.birthDate, form.ageUnit))
  }, [form.birthDate, form.ageUnit])

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((form) => ({ ...form, [name]: value }))
    setSubmitted(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload = { ...form, age, ageText }
    console.log(payload)
    setSubmitted(JSON.stringify(payload, null, 2))
  }

  function handleReset() {
    setForm(emptyForm)
    setSubmitted(null)
  }

  return (
    <section className="add-user">
      <h1>新增用户</h1>
      <form
        className="add-user-form"
        onSubmit={handleSubmit}
        onReset={handleReset}
      >
        <label>
          用户名
          <input
            required
            name="username"
            autoComplete="username"
            value={form.username}
            onChange={handleChange}
          />
        </label>

        <fieldset>
          <legend>性别</legend>
          <label>
            <input
              type="radio"
              name="gender"
              value="male"
              required
              checked={form.gender === 'male'}
              onChange={handleChange}
            />
            男
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="female"
              checked={form.gender === 'female'}
              onChange={handleChange}
            />
            女
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="other"
              checked={form.gender === 'other'}
              onChange={handleChange}
            />
            其他
          </label>
        </fieldset>

        <label>
          出生日期
          <input
            type="date"
            required
            name="birthDate"
            max={todayIsoDate()}
            value={form.birthDate}
            onChange={handleChange}
          />
        </label>

        <fieldset>
          <legend>年龄展示</legend>
          <label>
            <input
              type="radio"
              name="ageUnit"
              value="years"
              checked={form.ageUnit === 'years'}
              onChange={handleChange}
            />
            按岁
          </label>
          <label>
            <input
              type="radio"
              name="ageUnit"
              value="months"
              checked={form.ageUnit === 'months'}
              onChange={handleChange}
            />
            按月
          </label>
        </fieldset>

        <label>
          年龄（岁）
          <input
            readOnly
            name="age"
            value={age === '' ? '' : age}
            placeholder="根据出生日期自动计算"
          />
        </label>

        <label>
          年龄展示
          <input
            readOnly
            name="ageText"
            value={ageText}
            placeholder="根据出生日期和展示方式自动计算"
          />
        </label>

        <label>
          手机号码
          <input
            type="tel"
            required
            name="phone"
            inputMode="numeric"
            pattern="^1\d{10}$"
            title="请输入 11 位手机号"
            value={form.phone}
            onChange={handleChange}
          />
        </label>

        <label>
          邮箱
          <input
            type="email"
            required
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
          />
        </label>

        <label>
          地址
          <textarea
            required
            name="address"
            rows={3}
            value={form.address}
            onChange={handleChange}
          />
        </label>

        <div className="add-user-actions">
          <button type="submit">提交</button>
          <button type="reset">重置</button>
        </div>
      </form>

      {submitted && (
        <pre className="add-user-result" aria-live="polite">
          {submitted}
        </pre>
      )}
    </section>
  )
}

export default AddUser
