import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import './App.css';

function Home() {
  return (
    <div className="text-3xl font-bold underline">
      Hello World!
      <nav className="flex gap-4">
        <Link to="/register">Go to Register Page</Link>
        <Link to="/login">Go to Login Page</Link>
      </nav>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  )
}

export default App
