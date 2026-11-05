require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const fs = require('fs')
const csv = require('csv-parser')
const {v4: uuidv4} = require('uuid')
const {PrismaClient} = require('@prisma/client')
const axios = require('axios')

const app = express()
const allowedOrigins = [
  'http://localhost:3000',
  'https://grade-predictor-ml-model.vercel.app',
]

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(express.json())

const prisma = new PrismaClient()
const upload = multer({dest: 'uploads/'})

const JWT_SECRET = process.env.JWT_SECRET
const ML_SERVICE_URL = process.env.ML_SERVICE_URL

const getGradeFromScore = score => {
  if (score >= 90) return 'S'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}

const callMLService = async studentDetails => {
  const response = await axios.post(ML_SERVICE_URL, studentDetails)
  return response.data.score
}

const parseBoolean = value =>
  value === true || value === 'true' || value === 'Yes'

const getStudentDetails = data => ({
  studyHours: Number(data.studyHours),
  homeCondition: data.homeCondition,
  parentalPressure: data.parentalPressure,
  age: Number(data.age),
  sex: data.sex,
  homeAddressType: data.homeAddressType,
  healthStatus: Number(data.healthStatus),
  motherEducation: Number(data.motherEducation),
  fatherEducation: Number(data.fatherEducation),
  familyRelationshipQuality: Number(data.familyRelationshipQuality),
  familyEducationalSupport: parseBoolean(data.familyEducationalSupport),
  weeklyStudyTime: Number(data.weeklyStudyTime),
  pastClassFailures: Number(data.pastClassFailures),
  schoolAbsences: Number(data.schoolAbsences),
  schoolEducationalSupport: parseBoolean(data.schoolEducationalSupport),
  internetAccess: parseBoolean(data.internetAccess),
  wantsHigherEducation: parseBoolean(data.wantsHigherEducation),
  freeTimeAfterSchool: Number(data.freeTimeAfterSchool),
  goingOutWithFriends: Number(data.goingOutWithFriends),
  weekdayAlcoholConsumption: Number(data.weekdayAlcoholConsumption),
  weekendAlcoholConsumption: Number(data.weekendAlcoholConsumption),
  firstTermGrade: Number(data.firstTermGrade),
  secondTermGrade: Number(data.secondTermGrade),
})

// ---------- AUTH ----------

app.post('/register/', async (request, response) => {
  const {name, email, password} = request.body
  const existingUser = await prisma.user.findUnique({where: {email}})

  if (existingUser !== null) {
    response.status(400).send('User already exists')
  } else if (password.length < 6) {
    response.status(400).send('Password is too short')
  } else {
    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {name, email, password: hashedPassword},
    })

    response.status(200).send('User created successfully')
  }
})

app.post('/login/', async (request, response) => {
  const {email, password} = request.body
  const userData = await prisma.user.findUnique({where: {email}})

  if (userData === null) {
    response.status(400).send('Invalid user')
  } else {
    const isValidPassword = await bcrypt.compare(password, userData.password)

    if (isValidPassword === false) {
      response.status(400).send('Invalid password')
    } else {
      const payload = {userId: userData.id, email: userData.email}
      const jwtToken = jwt.sign(payload, JWT_SECRET)

      response.send({jwtToken, name: userData.name})
    }
  }
})

const authenticateToken = (request, response, next) => {
  let jwtToken
  const authHeader = request.headers.authorization

  if (authHeader !== undefined) {
    jwtToken = authHeader.split(' ')[1]
  }

  if (jwtToken === undefined) {
    response.status(401)
    response.send('Invalid JWT Token')
  } else {
    jwt.verify(jwtToken, JWT_SECRET, (error, payload) => {
      if (error) {
        response.status(401)
        response.send('Invalid JWT Token')
      } else {
        request.userId = payload.userId
        next()
      }
    })
  }
}

// ---------- SINGLE PREDICTION ----------

app.post('/predict/', authenticateToken, async (request, response) => {
  const {userId} = request
  const studentDetails = getStudentDetails(request.body)

  try {
    const score = await callMLService(studentDetails)
    const grade = getGradeFromScore(score)

    const student = await prisma.student.create({
      data: studentDetails,
    })

    const prediction = await prisma.prediction.create({
      data: {
        score,
        grade,
        userId,
        studentId: student.id,
      },
    })

    response.send({score, grade, predictionId: prediction.id})
  } catch (e) {
    console.error('PREDICTION ERROR:')
    console.error(e)

    response
      .status(500)
      .send(e.response?.data?.detail || e.message || 'Prediction failed')
  }
})

// ---------- BULK PREDICTION (CSV) ----------

app.post(
  '/predict/bulk/',
  authenticateToken,
  upload.single('csvFile'),
  async (request, response) => {
    const {userId} = request
    const batchId = uuidv4()
    const rows = []

    fs.createReadStream(request.file.path)
      .pipe(csv())
      .on('data', row => rows.push(row))
      .on('end', async () => {
        const results = []

        try {
          for (const row of rows) {
            const studentDetails = getStudentDetails(row)
            const score = await callMLService(studentDetails)
            const grade = getGradeFromScore(score)

            const student = await prisma.student.create({
              data: studentDetails,
            })

            await prisma.prediction.create({
              data: {
                score,
                grade,
                batchId,
                userId,
                studentId: student.id,
              },
            })

            results.push({...studentDetails, score, grade})
          }

          fs.unlinkSync(request.file.path)
          response.send({batchId, results})
        }catch (e) {
            console.error(
              'Prediction error:',
              e.response?.data || e.message || e,
            )

            response
              .status(500)
              .send(e.response?.data?.detail || 'Prediction failed, please try again')
          }
         })
        },
)

// ---------- HISTORY ----------

app.get('/history/', authenticateToken, async (request, response) => {
  const {userId} = request

  const predictions = await prisma.prediction.findMany({
    where: {userId},
    orderBy: {createdAt: 'desc'},
    include: {student: true},
    take: 6
  })

  const formattedList = predictions.map(item => ({
    id: item.id,
    score: item.score,
    grade: item.grade,
    batchId: item.batchId,
    studyHours: item.student.studyHours,
    homeCondition: item.student.homeCondition,
    parentalPressure: item.student.parentalPressure,
    age: item.student.age,
    sex: item.student.sex,
    schoolAbsences: item.student.schoolAbsences,
    firstTermGrade: item.student.firstTermGrade,
    secondTermGrade: item.student.secondTermGrade,
    createdAt: item.createdAt,
  }))

  response.send(formattedList)
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server Running at http://localhost:${PORT}/`)
})

module.exports = app