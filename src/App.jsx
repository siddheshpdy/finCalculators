import { useState, React } from 'react'
import './App.css'
// 1. Import your custom component
import WealthPlanner from './components/WealthPlanner';

function App() {
  return (
    <div className="App">
      <header style={{ 
        backgroundColor: '#282c34', 
        padding: '5px', 
        color: 'white', 
        textAlign: 'center'
      }}>
        <h1>My Calculators</h1>
      </header>
      
      <main>
        {/* 2. Use your component like an HTML tag */}
        <WealthPlanner />
      </main>
      <footer style={{ textAlign: 'center', marginTop: '40px', color: '#666' }}>
        <p>Built with React 19, Decimal.js, and Gemini. its fun project developed entirely using AI so calculations can be wrong</p>
      </footer>
    </div>
  );
}

export default App;
