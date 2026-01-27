import { useState, React } from 'react'
import './App.css'
// 1. Import your custom component
import SipCalculator from './components/SipCalculator';

function App() {
  return (
    <div className="App">
      <header style={{ 
        backgroundColor: '#282c34', 
        padding: '20px', 
        color: 'white', 
        textAlign: 'center'
      }}>
        <h1>My Wealth Planner</h1>
      </header>
      
      <main>
        {/* 2. Use your component like an HTML tag */}
        <SipCalculator />
      </main>
      
      <footer style={{ textAlign: 'center', marginTop: '40px', color: '#666' }}>
        <p>Built with React 19 & Decimal.js</p>
      </footer>
    </div>
  );
}

export default App;
