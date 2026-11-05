-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "studyHours" DOUBLE PRECISION NOT NULL,
    "homeCondition" TEXT NOT NULL,
    "parentalPressure" TEXT NOT NULL,
    "age" INTEGER NOT NULL DEFAULT 17,
    "sex" TEXT NOT NULL DEFAULT 'Female',
    "homeAddressType" TEXT NOT NULL DEFAULT 'Urban',
    "healthStatus" INTEGER NOT NULL DEFAULT 3,
    "motherEducation" INTEGER NOT NULL DEFAULT 0,
    "fatherEducation" INTEGER NOT NULL DEFAULT 0,
    "familyRelationshipQuality" INTEGER NOT NULL DEFAULT 3,
    "familyEducationalSupport" BOOLEAN NOT NULL DEFAULT false,
    "weeklyStudyTime" INTEGER NOT NULL DEFAULT 2,
    "pastClassFailures" INTEGER NOT NULL DEFAULT 0,
    "schoolAbsences" INTEGER NOT NULL DEFAULT 0,
    "schoolEducationalSupport" BOOLEAN NOT NULL DEFAULT false,
    "internetAccess" BOOLEAN NOT NULL DEFAULT true,
    "wantsHigherEducation" BOOLEAN NOT NULL DEFAULT true,
    "freeTimeAfterSchool" INTEGER NOT NULL DEFAULT 3,
    "goingOutWithFriends" INTEGER NOT NULL DEFAULT 3,
    "weekdayAlcoholConsumption" INTEGER NOT NULL DEFAULT 1,
    "weekendAlcoholConsumption" INTEGER NOT NULL DEFAULT 1,
    "firstTermGrade" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "secondTermGrade" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prediction" (
    "id" SERIAL NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "grade" TEXT NOT NULL,
    "batchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
