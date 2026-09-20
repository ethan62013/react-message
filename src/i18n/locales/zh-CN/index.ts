import api from './api'
import auth from './auth'
import common from './common'
import workspace from './workspace'

const zhCN = {
  common,
  auth,
  workspace,
  api,
} as const

export default zhCN
