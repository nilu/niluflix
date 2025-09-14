import React from 'react';

console.log('App.tsx loaded!');

const App: React.FC = () => {
  console.log('App component rendering...');
  
  React.useEffect(() => {
    console.log('App component mounted!');
  }, []);

  return (
    <div className="bg-black text-white min-h-screen p-5 font-sans" style={{backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px'}}>
      <h1 className="text-red-600 text-5xl font-bold mb-5" style={{color: '#e50914', fontSize: '3rem', fontWeight: 'bold', marginBottom: '20px'}}>
        NILUFLIX
      </h1>
      
      <p className="text-xl mb-5" style={{fontSize: '1.25rem', marginBottom: '20px'}}>
        React App is Working!
      </p>
      
      <div className="bg-gray-900 border border-gray-700 p-5 rounded-lg mt-5" style={{backgroundColor: '#1f2937', border: '1px solid #374151', padding: '20px', borderRadius: '8px', marginTop: '20px'}}>
        <h2 className="text-green-400 mb-2 font-semibold" style={{color: '#4ade80', marginBottom: '8px', fontWeight: '600'}}>✅ Status Check</h2>
        <p className="mb-1" style={{marginBottom: '4px'}}>✅ React component loaded</p>
        <p className="mb-1" style={{marginBottom: '4px'}}>✅ CSS Debug Mode (inline + Tailwind)</p>
        <p className="mb-1" style={{marginBottom: '4px'}}>✅ JavaScript executing</p>
        <p>⏰ Current time: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default App;
