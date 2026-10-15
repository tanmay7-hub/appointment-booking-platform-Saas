
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function Login() {
  return <h1 className="text-3xl font-bold">Login Page</h1>
}

function Register() {
  return <h1 className="text-3xl font-bold">Register Page</h1>
}

function Dashboard() {
  return <h1 className="text-3xl font-bold">Dashboard</h1>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
