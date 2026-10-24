# HRIS Portfolio

A web-based Human Resource Information System (HRIS) portfolio project built to demonstrate the design and implementation of employee management workflows, user authentication, role-based access, and database integration.

## Overview

HRIS Portfolio is a web application developed to organize employee-related information and support essential human resource administration processes. This project focuses on structured data management, access control, and maintainable application architecture.

## Features

- **Authentication** — Login and logout functionality.
- **Dashboard** — Central entry point for application activities.
- **Department Management** — Manage department-related information.
- **Position Management** — Manage employee position data.
- **Employee Management** — Organize employee records.
- **User Management** — Manage application user accounts.
- **My Profile** — View personal profile information.
- **My Attendance** — Access the attendance section.
- **Role-Based Access Control** — Apply access restrictions based on user roles.

> Note: Feature availability and access permissions depend on the current implementation.

## Tech Stack

- **Frontend & Application Framework:** Next.js, React, TypeScript
- **Database:** MariaDB
- **ORM:** Prisma
- **Authentication & Security:** bcryptjs for password hashing
- **Development Environment:** Node.js and XAMPP

## Getting Started

### Prerequisites

Make sure the following tools are installed:

- Node.js and npm
- Git
- XAMPP with MariaDB/MySQL
- A code editor such as Visual Studio Code

### 1. Clone the repository

```bash
git clone https://github.com/ayustinasamudin05/hris-portfolio.git
cd hris-portfolio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root. Configure the database connection and other environment variables required by the application.

Do not commit `.env` or any file containing real credentials to GitHub.

### 4. Configure the database

Start the database service through XAMPP and create the database configured for this project.

Configure Prisma according to the project's existing schema and migration setup. Apply the migrations using the appropriate Prisma command for the installed version.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```text
hris-portfolio/
├── app/              # Application routes and pages
├── components/       # Reusable UI components, if applicable
├── lib/              # Shared utilities and application logic
├── prisma/           # Database schema, migrations, and seed script
├── public/            # Static assets
├── package.json       # Dependencies and scripts
└── README.md          # Project documentation
```

The exact contents may evolve as development continues.

## Security Considerations

- Passwords should be stored as hashes, not plaintext.
- Environment variables should be used for sensitive configuration.
- Access to employee information should be restricted according to user roles.
- Production deployment should include appropriate authentication, authorization, and input validation.

## Project Status

This project is under active development as a programming portfolio project.

## Author

**Ayustina Samudin**

- GitHub: [@ayustinasamudin05](https://github.com/ayustinasamudin05)
- Repository: [hris-portfolio](https://github.com/ayustinasamudin05/hris-portfolio)
