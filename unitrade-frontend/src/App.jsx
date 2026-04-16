import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Feed from './pages/Feed'
import CreateItem from './pages/CreateItem'
import ItemDetail from './pages/ItemDetail'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/feed" element={
          <ProtectedRoute><Feed /></ProtectedRoute>
        } />
        <Route path="/create" element={
          <ProtectedRoute><CreateItem /></ProtectedRoute>
        } />
        <Route path="/items/:id" element={
          <ProtectedRoute><ItemDetail /></ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default App