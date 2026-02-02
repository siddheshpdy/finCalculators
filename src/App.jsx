import { useState, React } from 'react'
import './App.css'
// 1. Import your custom component
import WealthPlanner from './components/WealthPlanner';

function App() {
  return (
    <div className="App">
      <main style={{ height: 'calc(100vh - 50px)' }}>
        <WealthPlanner />
      </main>
      <footer style={{ textAlign: 'center', color: '#666' }}>
        <p>Built with React 19, Decimal.js, and Gemini. its fun project developed entirely using AI so calculations can be wrong</p>
      </footer>
    </div>
  );
}

export default App;
