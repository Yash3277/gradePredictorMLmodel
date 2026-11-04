-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Student" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studyHours" REAL NOT NULL,
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
    "firstTermGrade" REAL NOT NULL DEFAULT 0,
    "secondTermGrade" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Prediction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "score" REAL NOT NULL,
    "grade" TEXT NOT NULL,
    "batchId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    CONSTRAINT "Prediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Prediction_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
