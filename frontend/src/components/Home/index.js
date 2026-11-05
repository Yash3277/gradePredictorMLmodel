import {useState, useEffect} from 'react'
import Cookies from 'js-cookie'
import Navbar from '../Navbar'
import './index.css'

const inputModes = {
  single: 'SINGLE',
  bulk: 'BULK',
}

const FormField = ({label, name, value, onChange, min, max, step}) => (
  <div className="form-row">
    <label htmlFor={name} className="label">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type="number"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="input-element"
      required
    />
  </div>
)

const SelectField = ({label, name, value, onChange, options}) => (
  <div className="form-row">
    <label htmlFor={name} className="label">
      {label}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="input-element"
    >
      {options.map(option => {
        const optionValue =
          typeof option === 'object' ? option.value : option
        const optionLabel =
          typeof option === 'object' ? option.label : option

        return (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        )
      })}
    </select>
  </div>
)

const scaleOptions = [
  {value: 1, label: '1 - Very low'},
  {value: 2, label: '2 - Low'},
  {value: 3, label: '3 - Medium'},
  {value: 4, label: '4 - High'},
  {value: 5, label: '5 - Very high'},
]

const educationOptions = [
  {value: 0, label: 'None'},
  {value: 1, label: 'Primary education'},
  {value: 2, label: '5th to 9th grade'},
  {value: 3, label: 'Secondary education'},
  {value: 4, label: 'Higher education'},
]

const studyTimeOptions = [
  {value: 1, label: '< 2 hours'},
  {value: 2, label: '2 to 5 hours'},
  {value: 3, label: '5 to 10 hours'},
  {value: 4, label: '> 10 hours'},
]

const Home = () => {
  const [inputMode, setInputMode] = useState(inputModes.single)
  const [studyHours, setStudyHours] = useState('')
  const [homeCondition, setHomeCondition] = useState('Good')
  const [parentalPressure, setParentalPressure] = useState('Medium')

  const [studentData, setStudentData] = useState({
    age: 17,
    sex: 'Female',
    homeAddressType: 'Urban',
    healthStatus: 3,
    motherEducation: 0,
    fatherEducation: 0,
    familyRelationshipQuality: 3,
    familyEducationalSupport: 'No',
    weeklyStudyTime: 2,
    pastClassFailures: 0,
    schoolAbsences: 0,
    schoolEducationalSupport: 'No',
    internetAccess: 'Yes',
    wantsHigherEducation: 'Yes',
    freeTimeAfterSchool: 3,
    goingOutWithFriends: 3,
    weekdayAlcoholConsumption: 1,
    weekendAlcoholConsumption: 1,
    firstTermGrade: 0,
    secondTermGrade: 0,
  })

  const [csvFile, setCsvFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [result, setResult] = useState(null)
  const [bulkResults, setBulkResults] = useState([])
  const [historyList, setHistoryList] = useState([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const [isHistorySuccess, setIsHistorySuccess] = useState(true)

  const jwtToken = Cookies.get('jwt_token')

  const getHistory = async () => {
    setIsHistoryLoading(true)

    const url = `${process.env.REACT_APP_API_BASE_URL}/history/`
    const options = {
      method: 'GET',
      headers: {Authorization: `Bearer ${jwtToken}`},
    }

    const response = await fetch(url, options)

    if (response.ok) {
      const data = await response.json()
      setHistoryList(data)
      setIsHistoryLoading(false)
    } else {
      setIsHistoryLoading(false)
      setIsHistorySuccess(false)
    }
  }

  useEffect(() => {
    getHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onChangeInputMode = mode => {
    setInputMode(mode)
    setResult(null)
    setBulkResults([])
    setErrorMsg('')
  }

  const onChangeStudyHours = event => setStudyHours(event.target.value)
  const onChangeHomeCondition = event =>
    setHomeCondition(event.target.value)
  const onChangeParentalPressure = event =>
    setParentalPressure(event.target.value)
  const onChangeStudentData = event =>
    setStudentData({...studentData, [event.target.name]: event.target.value})
  const onChangeCsvFile = event => setCsvFile(event.target.files[0])

  const onSubmitSinglePrediction = async event => {
    event.preventDefault()
    setIsLoading(true)
    setErrorMsg('')

    const url = `${process.env.REACT_APP_API_BASE_URL}/predict/`
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        studyHours: Number(studyHours),
        homeCondition,
        parentalPressure,
        ...studentData,
      }),
    }

    const response = await fetch(url, options)

    if (response.ok) {
      const data = await response.json()
      setResult(data)
      setIsSuccess(true)
      setIsLoading(false)
      getHistory()
    } else {
      const msg = await response.text()
      setErrorMsg(msg)
      setIsSuccess(false)
      setIsLoading(false)
    }
  }

  const onSubmitBulkPrediction = async event => {
    event.preventDefault()

    if (csvFile === null) {
      setErrorMsg('Please choose a CSV file')
      return
    }

    setIsLoading(true)
    setErrorMsg('')

    const formData = new FormData()
    formData.append('csvFile', csvFile)

    const url = `${process.env.REACT_APP_API_BASE_URL}/predict/bulk/`
    const options = {
      method: 'POST',
      headers: {Authorization: `Bearer ${jwtToken}`},
      body: formData,
    }

    const response = await fetch(url, options)

    if (response.ok) {
      const data = await response.json()
      setBulkResults(data.results)
      setIsSuccess(true)
      setIsLoading(false)
      getHistory()
    } else {
      const msg = await response.text()
      setErrorMsg(msg)
      setIsSuccess(false)
      setIsLoading(false)
    }
  }

  const renderHowItWorks = () => (
    <div className="how-it-works-container">
      <h1 className="section-heading">How it works</h1>

      <div className="steps-container">
        <div className="step-item">
          <p className="step-number">1</p>
          <p className="step-text">
            Enter academic, family, study habit and lifestyle details.
          </p>
        </div>

        <div className="step-item">
          <p className="step-number">2</p>
          <p className="step-text">
            Click Predict to send the details to our prediction model.
          </p>
        </div>

        <div className="step-item">
          <p className="step-number">3</p>
          <p className="step-text">
            View the predicted exam score and letter grade instantly.
          </p>
        </div>
      </div>
    </div>
  )

  const renderSingleForm = () => (
    <form className="predict-form" onSubmit={onSubmitSinglePrediction}>
      <div className="form-section-heading">Personal details</div>

      <div className="form-grid">
        <FormField
          label="Age"
          name="age"
          value={studentData.age}
          onChange={onChangeStudentData}
          min="12"
          max="100"
        />

        <SelectField
          label="Sex"
          name="sex"
          value={studentData.sex}
          onChange={onChangeStudentData}
          options={['Female', 'Male']}
        />

        <SelectField
          label="Home address type"
          name="homeAddressType"
          value={studentData.homeAddressType}
          onChange={onChangeStudentData}
          options={['Urban', 'Rural']}
        />

        <SelectField
          label="Current health status"
          name="healthStatus"
          value={studentData.healthStatus}
          onChange={onChangeStudentData}
          options={scaleOptions}
        />
      </div>

      <div className="form-section-heading">Family background</div>

      <div className="form-grid">
        <SelectField
          label="Mother's education"
          name="motherEducation"
          value={studentData.motherEducation}
          onChange={onChangeStudentData}
          options={educationOptions}
        />

        <SelectField
          label="Father's education"
          name="fatherEducation"
          value={studentData.fatherEducation}
          onChange={onChangeStudentData}
          options={educationOptions}
        />

        <SelectField
          label="Quality of family relationships"
          name="familyRelationshipQuality"
          value={studentData.familyRelationshipQuality}
          onChange={onChangeStudentData}
          options={scaleOptions}
        />

        <SelectField
          label="Family educational support"
          name="familyEducationalSupport"
          value={studentData.familyEducationalSupport}
          onChange={onChangeStudentData}
          options={['Yes', 'No']}
        />
      </div>

      <div className="form-section-heading">Study habits & lifestyle</div>

      <div className="form-grid">
        <div className="form-row">
          <label htmlFor="studyHours" className="label">
            Study Hours (per day)
          </label>

          <input
            type="number"
            id="studyHours"
            min="0"
            max="24"
            step="0.5"
            placeholder="e.g. 4"
            value={studyHours}
            onChange={onChangeStudyHours}
            className="input-element"
            required
          />
        </div>

        <SelectField
          label="Weekly study time"
          name="weeklyStudyTime"
          value={studentData.weeklyStudyTime}
          onChange={onChangeStudentData}
          options={studyTimeOptions}
        />

        <FormField
          label="Number of past class failures"
          name="pastClassFailures"
          value={studentData.pastClassFailures}
          onChange={onChangeStudentData}
          min="0"
          max="20"
        />

        <FormField
          label="Number of school absences"
          name="schoolAbsences"
          value={studentData.schoolAbsences}
          onChange={onChangeStudentData}
          min="0"
          max="100"
        />

        <SelectField
          label="Extra educational support from school"
          name="schoolEducationalSupport"
          value={studentData.schoolEducationalSupport}
          onChange={onChangeStudentData}
          options={['Yes', 'No']}
        />

        <SelectField
          label="Internet access at home"
          name="internetAccess"
          value={studentData.internetAccess}
          onChange={onChangeStudentData}
          options={['Yes', 'No']}
        />

        <SelectField
          label="Wants to pursue higher education"
          name="wantsHigherEducation"
          value={studentData.wantsHigherEducation}
          onChange={onChangeStudentData}
          options={['Yes', 'No']}
        />

        <SelectField
          label="Free time after school"
          name="freeTimeAfterSchool"
          value={studentData.freeTimeAfterSchool}
          onChange={onChangeStudentData}
          options={scaleOptions}
        />

        <SelectField
          label="Going out with friends"
          name="goingOutWithFriends"
          value={studentData.goingOutWithFriends}
          onChange={onChangeStudentData}
          options={scaleOptions}
        />

        <SelectField
          label="Alcohol consumption on weekdays"
          name="weekdayAlcoholConsumption"
          value={studentData.weekdayAlcoholConsumption}
          onChange={onChangeStudentData}
          options={scaleOptions}
        />

        <SelectField
          label="Alcohol consumption on weekends"
          name="weekendAlcoholConsumption"
          value={studentData.weekendAlcoholConsumption}
          onChange={onChangeStudentData}
          options={scaleOptions}
        />

        <SelectField
          label="Home condition"
          name="homeCondition"
          value={homeCondition}
          onChange={onChangeHomeCondition}
          options={['Good', 'Average', 'Poor']}
        />

        <SelectField
          label="Parental pressure"
          name="parentalPressure"
          value={parentalPressure}
          onChange={onChangeParentalPressure}
          options={['Low', 'Medium', 'High']}
        />
      </div>

      <div className="form-section-heading">Previous grades</div>

      <div className="form-grid">
        <FormField
          label="First term grade (0-20)"
          name="firstTermGrade"
          value={studentData.firstTermGrade}
          onChange={onChangeStudentData}
          min="0"
          max="20"
          step="0.1"
        />

        <FormField
          label="Second term grade (0-20)"
          name="secondTermGrade"
          value={studentData.secondTermGrade}
          onChange={onChangeStudentData}
          min="0"
          max="20"
          step="0.1"
        />
      </div>

      <button
        type="submit"
        className="predict-button gradient-button"
        disabled={isLoading}
      >
        {isLoading ? 'Predicting...' : 'Predict'}
      </button>
    </form>
  )

  const renderBulkForm = () => (
    <form className="predict-form" onSubmit={onSubmitBulkPrediction}>
      <div className="form-row">
        <label htmlFor="csvFile" className="label">
          Upload CSV file with all student input fields
        </label>

        <input
          type="file"
          id="csvFile"
          accept=".csv"
          onChange={onChangeCsvFile}
          className="input-element"
        />
      </div>

      <button
        type="submit"
        className="predict-button gradient-button"
        disabled={isLoading}
      >
        {isLoading ? 'Predicting...' : 'Predict'}
      </button>
    </form>
  )

  const renderSingleResult = () => {
  if (result === null) {
    return null
  }

  const percentage = Number(result.score)
  const scoreOutOf20 = (percentage / 5).toFixed(1)
  const sgpa = Math.min(10, percentage / 10).toFixed(1)

  let riskMessage = 'No risk — excellent academic performance predicted.'
let riskClassName = 'no-risk'

if (percentage < 40) {
  riskMessage = 'Very high risk — immediate improvement is recommended.'
  riskClassName = 'high-risk'
} else if (percentage < 50) {
  riskMessage = 'High risk — focused improvement is recommended.'
  riskClassName = 'high-risk'
} else if (percentage < 60) {
  riskMessage = 'Medium risk — there is room for improvement.'
  riskClassName = 'medium-risk'
} else if (percentage < 70) {
  riskMessage = 'Low risk — maintain consistent academic habits.'
  riskClassName = 'low-risk'
}

  const keyFactors = [
    `Second term grade: ${studentData.secondTermGrade} / 20`,
    `School absences: ${studentData.schoolAbsences}`,
    `Past class failures: ${studentData.pastClassFailures}`,
    `Family relationship quality: ${studentData.familyRelationshipQuality} / 5`,
    `Current health status: ${studentData.healthStatus} / 5`,
  ]

  return (
    <div className="prediction-result-card">
      <h2 className="prediction-result-heading">Prediction Result</h2>

      <div className="prediction-statistics">
        <div className="prediction-stat">
          <p>Predicted Score</p>
          <h3>{scoreOutOf20} / 20</h3>
        </div>

        <div className="prediction-stat">
          <p>Percentage</p>
          <h3>{percentage.toFixed(2)} / 100</h3>
        </div>

        <div className="prediction-stat">
          <p>SGPA (10-point)</p>
          <h3>{sgpa} / 10</h3>
        </div>
      </div>

      <p className="letter-grade-text">
        Letter Grade: <span>{result.grade}</span>
      </p>

      <div className="score-progress-track">
        <div
          className="score-progress-fill"
          style={{width: `${percentage}%`}}
        />
      </div>

      <div className={`risk-message ${riskClassName}`}>
        {riskMessage}
      </div>

      <div className="key-factors-container">
        <h3>Key factors influencing grades</h3>

        <ul className="key-factors-list">
          {keyFactors.map(factor => (
            <li key={factor}>{factor}</li>
          ))}
        </ul>
      </div>

      <div className="model-info-container">
        <p>
          <span>✓</span> Model used for this prediction:
          <strong> Random Forest</strong>
        </p>
      </div>
    </div>
  )
}

  const renderBulkResult = () => {
    if (bulkResults.length === 0) {
      return null
    }

    return (
      <div className="bulk-result-container">
        <table className="result-table">
          <thead>
            <tr>
              <th>Study Hours</th>
              <th>Absences</th>
              <th>First Term</th>
              <th>Second Term</th>
              <th>Score</th>
              <th>Grade</th>
            </tr>
          </thead>

          <tbody>
            {bulkResults.map((item, index) => (
              <tr key={index}>
                <td>{item.studyHours}</td>
                <td>{item.schoolAbsences}</td>
                <td>{item.firstTermGrade}</td>
                <td>{item.secondTermGrade}</td>
                <td>{item.score}</td>
                <td>{item.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderHistorySection = () => {
    if (isHistoryLoading) {
      return <p className="history-status-text">Loading history...</p>
    }

    if (!isHistorySuccess) {
      return <p className="history-status-text">Could not load history</p>
    }

    if (historyList.length === 0) {
      return <p className="history-status-text">No predictions yet</p>
    }

    return (
      <table className="result-table">
        <thead>
          <tr>
            <th>Study Hours</th>
            <th>Absences</th>
            <th>First Term</th>
            <th>Second Term</th>
            <th>Score</th>
            <th>Grade</th>
          </tr>
        </thead>

        <tbody>
          {historyList.map(item => (
            <tr key={item.id}>
              <td>{item.studyHours}</td>
              <td>{item.schoolAbsences}</td>
              <td>{item.firstTermGrade}</td>
              <td>{item.secondTermGrade}</td>
              <td>{item.score}</td>
              <td>{item.grade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <div className="page-container">
      <Navbar />

      <div className="content-container">
        {renderHowItWorks()}

        <div className="predict-card">
          <div className="mode-toggle-container">
            <button
              type="button"
              className={
                inputMode === inputModes.single
                  ? 'mode-button active-mode-button'
                  : 'mode-button'
              }
              onClick={() => onChangeInputMode(inputModes.single)}
            >
              Single Student
            </button>

            <button
              type="button"
              className={
                inputMode === inputModes.bulk
                  ? 'mode-button active-mode-button'
                  : 'mode-button'
              }
              onClick={() => onChangeInputMode(inputModes.bulk)}
            >
              Bulk CSV Upload
            </button>
          </div>

          {inputMode === inputModes.single
            ? renderSingleForm()
            : renderBulkForm()}

          {errorMsg.length > 0 && <p className="error-para">*{errorMsg}</p>}

          {isSuccess && inputMode === inputModes.single && renderSingleResult()}
          {isSuccess && inputMode === inputModes.bulk && renderBulkResult()}
        </div>

        <div className="history-container">
          <h1 className="section-heading">Prediction History</h1>
          {renderHistorySection()}
        </div>
      </div>
    </div>
  )
}

export default Home