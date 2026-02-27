import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './screens/Dashboard';
import LeadScraper from './screens/LeadScraper';
import CampaignBuilder from './screens/CampaignBuilder';
import ReplyCenter from './screens/ReplyCenter';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="scraper" element={<LeadScraper />} />
          <Route path="campaigns" element={<CampaignBuilder />} />
          <Route path="replies" element={<ReplyCenter />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
