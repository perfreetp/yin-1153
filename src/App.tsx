import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import PreShift from '@/pages/PreShift';
import Tracking from '@/pages/Tracking';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pre-shift" element={<PreShift />} />
        <Route path="/tracking" element={<Tracking />} />
      </Routes>
    </Router>
  );
}
