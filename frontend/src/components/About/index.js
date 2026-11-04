import Navbar from '../Navbar'
import './index.css'

const About = () => (
  <div className="page-container">
    <Navbar />
    <div className="content-container">
      <div className="about-card">
        <h1 className="section-heading">About Grade Predictor</h1>
        <p className="about-text">
          Grade Predictor helps estimate a student's exam performance based
          on factors like daily study hours, home conditions and parental
          pressure. Enter a single student's details or upload a CSV for
          bulk predictions, and get an instant score with a letter grade.
        </p>
        <p className="about-text">
          Predictions are powered by a machine learning model trained on
          historical student data, served through a dedicated prediction
          service.
        </p>
      </div>
    </div>
  </div>
)

export default About
