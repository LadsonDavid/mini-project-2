import { AppProvider } from './context/AppContext';
import { BluetoothProvider } from './context/BluetoothContext';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AppProvider>
      <BluetoothProvider>
        <Dashboard />
      </BluetoothProvider>
    </AppProvider>
  );
}

export default App;
