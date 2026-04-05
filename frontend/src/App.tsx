import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { AdsDetailPage } from './pages/AdsDetailPage';
import { AdsEditPage } from './pages/AdsEditPage';
import { AdsListPage } from './pages/AdsListPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/ads" replace />} />
        <Route path="/ads" element={<AdsListPage />} />
        <Route path="/ads/:id" element={<AdsDetailPage />} />
        <Route path="/ads/:id/edit" element={<AdsEditPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/ads" replace />} />
    </Routes>
  );
}
