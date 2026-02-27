import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { BluetoothProvider } from './context/BluetoothContext';
import MainLayout from './components/MainLayout';
import VitalsDashboard from './pages/VitalsDashboard';
import MusicPage from './pages/MusicPage';
import GamesPage from './pages/GamesPage';

function App() {
  return (
    <AppProvider>
      <BluetoothProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<VitalsDashboard />} />
              <Route path="music" element={<MusicPage />} />
              <Route path="games" element={<GamesPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </BluetoothProvider>
    </AppProvider>
  );
}

export default App;

