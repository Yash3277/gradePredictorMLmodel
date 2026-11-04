import {useState} from 'react'
import {Redirect, Link, withRouter} from 'react-router-dom'
import Cookies from 'js-cookie'
import '../Login/index.css'

const Register = props => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onChangeName = event => setName(event.target.value)
  const onChangeEmail = event => setEmail(event.target.value)
  const onChangePassword = event => setPassword(event.target.value)
  const onChangeConfirmPassword = event =>
    setConfirmPassword(event.target.value)

  const onSubmitRegisterForm = async event => {
    event.preventDefault()
    setErrorMsg('')

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    const url = `${process.env.REACT_APP_API_BASE_URL}/register/`
    const options = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name, email, password}),
    }
    const response = await fetch(url, options)
    if (response.ok) {
  Cookies.remove('jwt_token', {path: '/'})

  const {history} = props
  history.replace('/login')
} else {
      const msg = await response.text()
      setErrorMsg(msg)
      setIsSubmitting(false)
    }
  }

  const jwtToken = Cookies.get('jwt_token')
  if (jwtToken !== undefined) {
    return <Redirect to="/" />
  }

  return (
    <div className="login-bg-container">
      <form className="login-form-container" onSubmit={onSubmitRegisterForm}>
        <h1 className="login-heading">Grade Predictor</h1>
        <p className="login-subheading">Create your account</p>

        <div className="input-container">
          <label htmlFor="name" className="label">
            Name
          </label>
          <input
            type="text"
            id="name"
            placeholder="Full Name"
            value={name}
            onChange={onChangeName}
            className="input-element"
            required
          />
        </div>

        <div className="input-container">
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Email"
            value={email}
            onChange={onChangeEmail}
            className="input-element"
            required
          />
        </div>

        <div className="input-container">
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={onChangePassword}
            className="input-element"
            required
          />
        </div>

        <div className="input-container">
          <label htmlFor="confirmPassword" className="label">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={onChangeConfirmPassword}
            className="input-element"
            required
          />
        </div>

        <button
          type="submit"
          className="login-button gradient-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating account...' : 'Register'}
        </button>

        {errorMsg.length > 0 && <p className="error-para">*{errorMsg}</p>}

        <p className="switch-auth-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  )
}

export default withRouter(Register)
