import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TherapistLayout from './layouts/TherapistLayout';
import PatientLayout from './layouts/PatientLayout';
import AdminLayout from './layouts/AdminLayout';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import AcceptInvite from './pages/auth/AcceptInvite';

import TherapistDashboard from './pages/therapist/Dashboard';
import Patients from './pages/therapist/Patients';

import TherapistAppointments from './pages/therapist/Appointments';
import Assessments from './pages/therapist/Assessments';
import Reports from './pages/therapist/Reports';
import PatientProfile from './pages/therapist/PatientProfile';
import AddPatient from './pages/therapist/AddPatient';
import Progress from './pages/therapist/Progress';
import Settings from './pages/therapist/Settings';
import BookAppointment from './pages/therapist/BookAppointment';
import AssignExercise from './pages/therapist/AssignExercise';
import NewAssessment from './pages/therapist/NewAssessment';

import PatientDashboard from './pages/patient/Dashboard';
import MyRecovery from './pages/patient/MyRecovery';
import Exercises from './pages/patient/Exercises';
import Symptoms from './pages/patient/Symptoms';
import PatientAppointments from './pages/patient/Appointments';
import Profile from './pages/patient/Profile';

import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import ProtectedRoute from './components/ProtectedRoute';
import Staff from './pages/admin/Staff';
import AddStaff from './pages/admin/AddStaff';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/invite" element={<AcceptInvite />} />
          {/* <Route path="/test-book" element={<BookAppointment />} /> */}
          <Route
            path="/therapist"
            element={
              <ProtectedRoute allowedRoles={['therapist']}>
                <TherapistLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<TherapistDashboard />} />
            <Route path="patients" element={<Patients />} />
            <Route path="patients/add" element={<AddPatient />} />
            <Route path="patients/:id" element={<PatientProfile />} />
            <Route
              path="patients/:id/assign-exercise"
              element={<AssignExercise />}
            />

            <Route path="appointments" element={<TherapistAppointments />} />
            <Route path="appointments/book" element={<BookAppointment />} />

            <Route path="assessments" element={<Assessments />} />
            <Route path="assessments/new" element={<NewAssessment />} />

            <Route path="progress" element={<Progress />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="recovery" element={<MyRecovery />} />
            <Route path="exercises" element={<Exercises />} />
            <Route path="symptoms" element={<Symptoms />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />{' '}
            <Route path="users" element={<Users />} />{' '}
            <Route path="staff" element={<Staff />} />{' '}
            <Route path="staff/add" element={<AddStaff />} />{' '}
          </Route>{' '}
          <Route path="/invite" element={<AcceptInvite />} />{' '}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
