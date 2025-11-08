import { useEffect, useState } from 'react';
import { Flame, Wind, Activity, Thermometer, Weight, AlertTriangle } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCaPpcura70f4oADcAnwWa2Ti46d70s5pI",
  authDomain: "kitchenassistant-912b6.firebaseapp.com",
  databaseURL: "https://kitchenassistant-912b6-default-rtdb.firebaseio.com",
  projectId: "kitchenassistant-912b6",
  storageBucket: "kitchenassistant-912b6.firebasestorage.app",
  messagingSenderId: "346501205313",
  appId: "1:346501205313:web:929eea00943f4e131665c0"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function Sensors() {
  const [sensorData, setSensorData] = useState({
    Flame: 0,
    GasLevel: 0,
    Humidity: 0,
    Motion: 0,
    Temperature: 0,
    Weight: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sensorsRef = ref(database, 'Sensors');

    const unsubscribe = onValue(
      sensorsRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            setSensorData({
              Flame: data.Flame ?? 0,
              GasLevel: data.GasLevel ?? 0,
              Humidity: data.Humidity ?? 0,
              Motion: data.Motion ?? 0,
              Temperature: data.Temperature ?? 0,
              Weight: data.Weight ?? 0
            });
            setError(null);
          }
          setLoading(false);
        } catch (err) {
          setError('Error reading sensor data');
          setLoading(false);
        }
      },
      (error) => {
        setError('Connection error: ' + error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getGasStatus = (value) => {
    if (value > 400) return { status: 'Danger', color: 'bg-red-500', textColor: 'text-red-700' };
    if (value > 200) return { status: 'Warning', color: 'bg-orange-500', textColor: 'text-orange-700' };
    return { status: 'Safe', color: 'bg-green-500', textColor: 'text-green-700' };
  };

  const gasStatus = getGasStatus(sensorData.GasLevel);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Connecting to sensors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-purple-800 mb-3">Sensor Dashboard</h1>
        <p className="text-gray-600 text-lg">Monitor your kitchen sensors in real-time</p>
        {error && (
          <p className="text-red-600 mt-2 font-medium">{error}</p>
        )}
      </div>

      {/* Sensor Monitoring Section */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Wind className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-purple-800">Gas Level</h2>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold text-gray-900">{sensorData.GasLevel.toFixed(2)}</div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${gasStatus.color} bg-opacity-20`}>
                <div className={`w-2 h-2 rounded-full ${gasStatus.color}`}></div>
                <span className={`font-semibold ${gasStatus.textColor}`}>{gasStatus.status}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Flame className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-purple-800">Flame Sensor</h2>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold text-gray-900">{sensorData.Flame === 0 ? 'Clear' : 'Detected'}</div>
              {sensorData.Flame !== 0 ? (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">Fire Alert!</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 bg-opacity-20">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="font-semibold text-green-700">Normal</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Activity className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-purple-800">Motion Sensor</h2>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold text-gray-900">{sensorData.Motion === 0 ? 'Inactive' : 'Active'}</div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${sensorData.Motion !== 0 ? 'bg-purple-500' : 'bg-gray-400'} bg-opacity-20`}>
                <div className={`w-2 h-2 rounded-full ${sensorData.Motion !== 0 ? 'bg-purple-500' : 'bg-gray-400'}`}></div>
                <span className={`font-semibold ${sensorData.Motion !== 0 ? 'text-purple-700' : 'text-gray-700'}`}>
                  {sensorData.Motion !== 0 ? 'Motion Detected' : 'No Motion'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <Thermometer className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-purple-800">Temperature</h2>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold text-gray-900">{sensorData.Temperature.toFixed(1)} <span className="text-2xl text-gray-500">°C</span></div>
              <div className="text-gray-600 font-medium">DHT Sensor</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-cyan-100 rounded-xl">
                <Activity className="w-8 h-8 text-cyan-600" />
              </div>
              <h2 className="text-xl font-semibold text-purple-800">Humidity</h2>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold text-gray-900">{sensorData.Humidity.toFixed(1)} <span className="text-2xl text-gray-500">%</span></div>
              <div className="text-gray-600 font-medium">DHT Sensor</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Weight className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-purple-800">Weight</h2>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold text-gray-900">{sensorData.Weight.toFixed(2)} <span className="text-2xl text-gray-500">kg</span></div>
              <div className="text-gray-600 font-medium">Load Cell</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-12 text-gray-500">
        <p>Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}

export default Sensors;
