import { Navigate } from 'react-router-dom';
import PrivateOffice from '../pages/home/PrivateOffice';
import AwardsPage from '../pages/home/AwardsPage';
import MyAnswersPage from '../pages/home/MyAnswersPage';
import Admin from '../pages/home/Admin/Admin';
import AdminOrganization from '../pages/home/Admin/AdminOrganization';
import AdminAwards from '../pages/home/Admin/AdminAwards';
import AdminDirectors from '../pages/home/Admin/AdminDirectors';
import AdminInstituteQuestions from '../pages/home/Admin/AdminInstituteQuestions';
import AdminInstituteAwards from '../pages/home/Admin/AdminInstituteAwards';
import AdminOrgInstitutesPage from '../pages/home/Admin/AdminOrgInstitutesPage';
import AdminExperts from '../pages/home/Admin/AdminExperts';
import AdminYears from '../pages/home/Admin/AdminYears';
import AdminTeacherQuestions from '../pages/home/Admin/AdminTeacherQuestions';
import AdminPositions from '../pages/home/Admin/AdminPositions';
import ExpertDashboard from '../pages/expert/ExpertDashboard';
import DirectorInstitutePanel from '../pages/director/DirectorInstitutePanel';
import DirectorAnswersPage from '../pages/director/DirectorAnswersPage';
import DirectorTeachersPage from '../pages/director/DirectorTeachersPage';
import DirectorInstituteAwardsPage from '../pages/director/DirectorInstituteAwardsPage';

export const ALL_AUTH_ROLES = ['admin', 'teacher', 'expert', 'director'];

const commonProtectedRoutes = [
  { path: '/private_office', element: <PrivateOffice />, roles: ALL_AUTH_ROLES },
  { path: '/awards', element: <AwardsPage />, roles: ALL_AUTH_ROLES },
  { path: '/awards/:stageId', element: <AwardsPage />, roles: ALL_AUTH_ROLES },
  { path: '/my_answers', element: <MyAnswersPage />, roles: ALL_AUTH_ROLES },
];

const roleSpecificProtectedRoutes = [
  { path: '/admin', element: <Admin />, roles: ['admin'] },
  { path: '/admin/organization', element: <AdminOrganization />, roles: ['admin'] },
  { path: '/admin/organization/:id/institutes', element: <AdminOrgInstitutesPage />, roles: ['admin'] },
  { path: '/admin/awards', element: <AdminAwards />, roles: ['admin'] },
  { path: '/admin/directors', element: <AdminDirectors />, roles: ['admin'] },
  { path: '/admin/institute-questions', element: <AdminInstituteQuestions />, roles: ['admin'] },
  { path: '/admin/institute-awards', element: <AdminInstituteAwards />, roles: ['admin'] },
  { path: '/admin/experts', element: <AdminExperts />, roles: ['admin'] },
  { path: '/admin/years', element: <AdminYears />, roles: ['admin'] },
  { path: '/admin/teacher-questions', element: <AdminTeacherQuestions />, roles: ['admin'] },
  { path: '/admin/positions', element: <AdminPositions />, roles: ['admin'] },
  { path: '/expert', element: <Navigate to="/expert/dashboard" replace />, roles: ['expert'] },
  { path: '/expert/dashboard', element: <ExpertDashboard />, roles: ['expert'] },
  { path: '/director', element: <Navigate to="/director/institute" replace />, roles: ['director'] },
  { path: '/director/institute', element: <DirectorInstitutePanel />, roles: ['director'] },
  { path: '/director/teachers', element: <DirectorTeachersPage />, roles: ['director'] },
  { path: '/director/answers', element: <DirectorAnswersPage />, roles: ['director'] },
  { path: '/director/institute-awards', element: <DirectorInstituteAwardsPage />, roles: ['director'] },
];

export const protectedRoutes = [...commonProtectedRoutes, ...roleSpecificProtectedRoutes];
