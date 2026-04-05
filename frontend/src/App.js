import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import Landing from './landing';
import Navigation from './navigation';
import AlignDashboard from './ali-dashboard';
import AlignDetailSelect from './ali-detail-select';
import AlignPrevRuns from './ali-prev-runs';

import AnalysisDashboard from './anal-dashboard';
import AnalysisDetailSelect from './anal-detail-select';
import AnalysisAllRuns from './anal-all-runs';
import AnalysisGallery from './anal-gallery';

function App() {
  return (
      <Router>
      <Navigation />
        <Routes>
            <Route path='/' element={<Landing />} />
            <Route path='/alignment' element={<AlignDashboard />} />
            <Route path='/alignment/runs' element={<AlignPrevRuns />} />
            <Route path='/alignment/details' element={<AlignDetailSelect />} />
            
            <Route path='/analysis' element={<AnalysisDashboard />} />
            <Route path='/analysis/runs' element={<AnalysisAllRuns />} />
            <Route path='/analysis/details' element={<AnalysisDetailSelect />} />
            <Route path='/analysis/gallery' element={<AnalysisGallery />} />

        </Routes>
      </Router>
  );
}

export default App;
