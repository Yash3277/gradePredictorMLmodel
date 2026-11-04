import {Link} from 'react-router-dom'
import './index.css'

const NotFound = () => (
  <div className="not-found-container">
    <h1 className="not-found-heading">404</h1>
    <p className="not-found-text">
      We are sorry, the page you requested could not be found.
    </p>
    <Link to="/" className="not-found-link">
      Back to Home
    </Link>
  </div>
)

export default NotFound
