const api = {
  hint: 'Notice',
  error: 'Something went wrong',
  errors: {
    'invalid email': 'Invalid email address',
    'invalid or expired code': 'Invalid or expired code',
    'invalid or expired captcha': 'Invalid or expired captcha',
    'password must be at least 8 characters and include letters and digits':
      'Password must be 8+ characters with letters and digits',
    'email already registered': 'This email is already registered',
    'email not registered': 'This email is not registered',
    'please wait before requesting another code': 'Please wait before requesting another code',
    'user not found': 'Account not found',
    'invalid email or password': 'Invalid email or password',
    'token expired': 'Session expired. Please sign in again.',
    'invalid id': 'Invalid id',
    'email and password required': 'Email and password required',
    'username required': 'Username required',
    'username already taken': 'Username already taken',
    'invalid status': 'Invalid account status',
    'cannot modify your own account': 'You cannot disable or delete your own account',
    'account disabled': 'This account is disabled. Contact an administrator.',
    'prompt required': 'Please enter a prompt',
    'invalid style': 'Invalid style',
    'invalid ratio': 'Invalid ratio',
  },
} as const

export default api
