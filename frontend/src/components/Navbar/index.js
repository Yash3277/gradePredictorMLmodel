import {useContext} from 'react'
import {Link, withRouter} from 'react-router-dom'
import {FiSun, FiMoon, FiLogOut} from 'react-icons/fi'
import Cookies from 'js-cookie'
import ThemeContext from '../../context/ThemeContext'
import './index.css'

const Navbar = props => {
  const {isDarkMode, toggleTheme} = useContext(ThemeContext)

  const onLogout = () => {
    Cookies.remove('jwt_token')
    const {history} = props
    history.replace('/login')
  }

  return (
    <nav className="nav-container">
      <Link to="/" className="nav-logo-link">
        <h1 className="nav-logo gradient-text">Grade Predictor</h1>
      </Link>
      <ul className="nav-list-items">
        <li className="nav-item">
          <Link to="/" className="nav-link">
            Home
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/about" className="nav-link">
            About
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/contact" className="nav-link">
            Contact
          </Link>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className="theme-toggle-button"
            onClick={toggleTheme}
            aria-label="toggle theme"
          >
            {isDarkMode ? <FiSun /> : <FiMoon />}
          </button>
        </li>
        <li className="nav-item">
          <button type="button" className="logout-button" onClick={onLogout}>
            <FiLogOut className="logout-icon" />
            Logout
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default withRouter(Navbar)
