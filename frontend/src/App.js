import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import MyGallery from './gallery';
import Dashboard from './dashboard';
import Navigation from './navigation';
import DetailSelect from './detail-select';
import PrevRuns from './prev-runs';

function App() {
  return (
      <Router>
      <Navigation />
        <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path='/runs' element={<PrevRuns />} />
            <Route path='/gallery' element={<MyGallery />} />
            <Route path='/details' element={<DetailSelect />} />
        </Routes>
      </Router>
  );
}

export default App;
