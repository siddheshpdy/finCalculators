import './App.css';
import WealthPlanner from './components/WealthPlanner';

function App() {
  return (
    <div className="appShell">
      <main className="appMain">
        <WealthPlanner />
      </main>
      <footer className="appFooter">
        <p className="appFooterText">
          Educational finance tools built with React and Decimal.js. Use the estimates as a
          planning aid and verify important decisions independently.
        </p>
      </footer>
    </div>
  );
}

export default App;
