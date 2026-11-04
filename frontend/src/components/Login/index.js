import {useState} from 'react'
import {Redirect, Link, withRouter} from 'react-router-dom'
import Cookies from 'js-cookie'
import './index.css'

const Login = props => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setCookieAndRenderHome = jwtToken => {
    Cookies.set('jwt_token', jwtToken, {expires: 3})
    const {history} = props
    history.replace('/')
  }

  const onChangeEmail = event => setEmail(event.target.value)
  const onChangePassword = event => setPassword(event.target.value)

  const onSubmitLoginForm = async event => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')
    const url = `${process.env.REACT_APP_API_BASE_URL}/login/`
    const options = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, password}),
    }
    const response = await fetch(url, options)
    if (response.ok) {
      const data = await response.json()
      setCookieAndRenderHome(data.jwtToken)
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
      <form className="login-form-container" onSubmit={onSubmitLoginForm}>
        <h1 className="login-heading">Grade Predictor</h1>
        <p className="login-subheading">Login to continue</p>

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

        <button
          type="submit"
          className="login-button gradient-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>

        {errorMsg.length > 0 && <p className="error-para">*{errorMsg}</p>}

        <p className="switch-auth-text">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  )
}

export default withRouter(Login)