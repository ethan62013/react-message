import api from './api'
import auth from './auth'
import common from './common'
import workspace from './workspace'

const enUS = {
  common,
  auth,
  workspace,
  api,
} as const

export default enUS
