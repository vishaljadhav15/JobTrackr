# JobTrackr 

> A full-stack MERN application for managing job applications, resumes, interviews, follow-ups, and career progress from one centralized dashboard.

##  Live Demo

**Frontend:**  
https://job-trackr-vj.netlify.app/

**Backend API:**  
https://jobtrackr-api-b3xv.onrender.com/

**GitHub Repository:**  
https://github.com/vishaljadhav15/JobTrackr

---

##  About The Project

JobTrackr is a full-stack job application and career management platform built using the MERN stack.

The main goal of the application is to help job seekers organize their job search process in one place instead of maintaining job details, application statuses, interview dates, follow-ups, and resumes separately.

The platform allows users to:

- Create and manage job records
- Track job applications through different stages
- Search and filter jobs and applications
- Manage interview and follow-up dates
- Upload and manage resumes
- Extract resume text and skills from PDF files
- Match a resume against job requirements
- Identify matched and missing skills
- View application statistics and career progress
- Manage their profile
- Secure their account using JWT authentication

---

#  Features

##  Authentication

- User registration
- User login
- JWT-based authentication
- Protected routes
- Password hashing using bcrypt
- Persistent authentication using localStorage
- User-specific data access
- Logout functionality

---

##  Job Management

Users can manage their job opportunities from a centralized job management system.

### Features

- Add new jobs
- View job details
- Edit jobs
- Delete jobs
- Search jobs
- Filter jobs by job type
- Filter jobs by work mode
- Pagination
- Store job description
- Store required skills
- Store salary information
- Store application deadline
- Store source/application URL
- Add personal notes

### Supported Job Types

- Full-time
- Part-time
- Contract
- Internship
- Freelance

### Supported Work Modes

- On-site
- Remote
- Hybrid

---

#  Application Tracking

JobTrackr provides an application pipeline to track the progress of every job application.

### Application Statuses

```text
Saved
   ↓
Applied
   ↓
Screening
   ↓
Interview
   ↓
Offer
   ↓
Accepted / Rejected
