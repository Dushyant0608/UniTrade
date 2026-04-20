import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Feed from './pages/Feed'
import CreateItem from './pages/CreateItem'
import ItemDetail from './pages/ItemDetail'
import MyListings from './pages/MyListings'
import Donations from './pages/Donations'
import Chat from './pages/Chat'

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
        <Route path="/my-listings" element={
          <ProtectedRoute><MyListings /></ProtectedRoute>
        } />
        <Route path="/donations" element={
          <ProtectedRoute><Donations /></ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute><Chat /></ProtectedRoute>
        } />
        <Route path="/chat/:itemId/:userId" element={
          <ProtectedRoute><Chat /></ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default App