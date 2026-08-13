import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import PrivateRoute from './components/PrivateRoute';
import PageNotFound from './pages/PageNotFound';
import Home from './pages/Home';
import LPPS from './pages/home/LPPS';
import Authorization from './pages/home/Authorization';
import Registration from './pages/home/Registration';
import Department from './pages/home/Department';
import UserInfo from './pages/home/UserInfo';
import TeacherEmail from './pages/teacher/TeacherEmail';
import TeacherCode from './pages/teacher/TeacherCode';
import TeacherStep2 from './pages/teacher/TeacherStep2';
import OAuthSuccess from './pages/OAuthSuccess';
import OrganizationPage from './pages/OrganizationPage';
import OrganizationTeachersPage from './pages/OrganizationTeachersPage';
import OrganizationInstitutesPage from './pages/OrganizationInstitutesPage';
import OrganizationInstituteTeachersPage from './pages/OrganizationInstituteTeachersPage';
import OrganizationAwardTeachersPage from './pages/OrganizationAwardTeachersPage';
import InstituteRating from './pages/rating/InstituteRating';
import { protectedRoutes } from './routes/protectedRoutes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/LPPS" element={<LPPS />} />
        <Route path="/Authorization" element={<Authorization />} />
        <Route path="/Registration" element={<Registration />} />
        <Route path="/user/:id" element={<UserInfo />} />
        <Route path="/department/:id" element={<Department />} />
        <Route path="/rating/institutes" element={<InstituteRating />} />
        <Route path="/teacher/email" element={<TeacherEmail />} />
        <Route path="/teacher/code" element={<TeacherCode />} />
        <Route path="/teacher/step2" element={<TeacherStep2 />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/organization/:id" element={<OrganizationPage />} />
        <Route path="/organization/:id/teachers" element={<OrganizationTeachersPage />} />
        <Route path="/organization/:id/institutes" element={<OrganizationInstitutesPage />} />
        <Route path="/organization/:id/institutes/:instituteId/teachers" element={<OrganizationInstituteTeachersPage />} />
        <Route path="/organization/:id/awards-rating" element={<OrganizationAwardTeachersPage />} />

        {protectedRoutes.map(route => (
          <Route
            key={`protected-${route.path}`}
            path={route.path}
            element={<PrivateRoute allowedRoles={route.roles}>{route.element}</PrivateRoute>}
          />
        ))}

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
