import logo from './logo.svg';
import {Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from "./contexts/AuthContext";
import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import './App.css';

function App(){
    return (
        <>
           <Router>
            <AuthProvider>
            <Routes>

                <Route path='/' element={<LandingPage />}/>

                <Route path='/auth' element={<Authentication />} />
            </Routes>
               </AuthProvider>
           </Router>
        </>
    )
}

export default App;