import './index.css'
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import TherapistLayout from './layouts/TherapistLayout'
import PatientLayout from './layouts/PatientLayout'
import AdminLayout from './layouts/AdminLayout'

import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'

import TherapistDashboard from './pages/therapist/Dashboard'
import Patients from './pages/therapist/Patients'

import PatientDashboard from './pages/patient/Dashboard'
import MyRecovery from './pages/patient/MyRecovery'

import AdminDashboard from './pages/admin/Dashboard';
import ProtectedRoute from './components/ProtectedRoute'
import AddStaff from './pages/admin/AddStaff'

function App() {


  return (
    <>
        <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/therapist" element={
          <ProtectedRoute allowedRoles={['therapist']}>
            <TherapistLayout />
          </ProtectedRoute>
          
          }>
          <Route path="dashboard" element={<TherapistDashboard />} />
          <Route path="patients" element={<Patients />} />
        </Route>

        <Route path="/patient" element={
          <ProtectedRoute allowedRoles={['patient']}>
             <PatientLayout />
          </ProtectedRoute>
          }>
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="recovery" element={<MyRecovery />} />
        </Route>

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
          </ProtectedRoute>
          }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="staff" element={<AddStaff />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
