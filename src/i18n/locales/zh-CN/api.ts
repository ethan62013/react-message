const api = {
  hint: '提示',
  error: '出错了',
  errors: {
    'invalid email': '邮箱格式不正确',
    'invalid or expired code': '验证码错误或已过期',
    'password must be at least 8 characters and include letters and digits':
      '密码至少 8 位，且包含字母和数字',
    'email already registered': '该邮箱已注册',
    'email not registered': '该邮箱尚未注册',
    'please wait before requesting another code': '发送太频繁，请稍后再试',
    'user not found': '账号不存在',
    'invalid email or password': '邮箱或密码错误',
    'token expired': '登录已过期，请重新登录',
    'invalid id': '无效的编号',
    'email and password required': '请输入邮箱和密码',
    'nickname required': '请输入姓名',
    'prompt required': '请输入提示词',
    'invalid style': '无效的风格',
    'invalid ratio': '无效的比例',
  },
} as const

export default api
