import {Switch, Route} from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Home from './components/Home'
import About from './components/About'
import Contact from './components/Contact'
import NotFound from './components/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import {ThemeProvider} from './context/ThemeContext'
import './App.css'

const App = () => (
  <ThemeProvider>
    <Switch>
      <Route exact path="/login" component={Login} />
      <Route exact path="/register" component={Register} />
      <ProtectedRoute exact path="/" component={Home} />
      <ProtectedRoute exact path="/about" component={About} />
      <ProtectedRoute exact path="/contact" component={Contact} />
      <Route component={NotFound} />
    </Switch>
  </ThemeProvider>
)

export default App
