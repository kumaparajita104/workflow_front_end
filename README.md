
# Leave Management System – Frontend

This is the React-based frontend for a role-based leave management workflow system. It supports dynamic form rendering, form submission by employees, and request approval/rejection by managers and HR, based on roles obtained from JWT authentication.

## 🔧 Tech Stack

- React
- Keycloak JS adapter (or custom token-based auth)
- REST API integration with Spring Boot backend
- JSON-based dynamic forms
- Role-based rendering (`client_admin`, `client_employee`, `client_manager`, `client_hr`)

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/leave-management-frontend.git
   cd leave-management-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up `.env` file:
   ```env
   REACT_APP_API_BASE_URL=http://localhost:9091
   ```

4. Start the app:
   ```bash
   npm start
   ```

## 🔐 Authentication

This app expects a JWT token (e.g., from Keycloak) passed via props or stored in context/local storage. The `Authorization: Bearer <token>` header is sent with all API requests.

## 🚀 Features by Role

- **Admin (`client_admin`)**
  - Create dynamic JSON form templates.
  - Define workflows and state transitions.

- **Employee (`client_employee`)**
  - Fetch and render forms based on saved templates.
  - Submit leave requests.

- **Manager (`client_manager`) / HR (`client_hr`)**
  - View pending leave requests.
  - Approve or reject requests.
  - View submitted request details.

## 📂 Project Structure

```bash
src/
├── components/
│   ├── Dashboard.js         # Main UI for all roles
│   ├── CreateWorkflow.js    # Workflow definition for Admin
├── context/
│   └── UserProvider.js      # Provides user info and JWT
├── App.js
└── index.js
```

## 🤝 Contributing

Pull requests are welcome! Please include tests and descriptions.

## 🔗 Backend

You can find the Spring Boot backend [here](https://github.com/kumaparajita104/workflow_backend?tab=readme-ov-file#workflow_backend).
