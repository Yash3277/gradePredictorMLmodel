import {createContext, useState, useEffect} from 'react'

const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
})

export const ThemeProvider = ({children}) => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleTheme = () => {
    setIsDarkMode(prevState => !prevState)
  }

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme')
    } else {
      document.body.classList.remove('dark-theme')
    }
  }, [isDarkMode])

  return (
    <ThemeContext.Provider value={{isDarkMode, toggleTheme}}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeContext
