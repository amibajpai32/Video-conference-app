import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function landing() {
  const navigate = useNavigate();

  const handleConnect = () => {
    // Navigate to the video meet page (you can change 'a123' to any room ID you want)
    navigate('/a123');
  };

  return (
    <div className='landingPageContainer'>
      <nav>
        <div className='navHeader'>
            <h2>Apna Video Call</h2>
        </div>
        <div className='navlist'>
          <p>Join as Guest</p>
          <p>Register</p>
          <div role='button'>
            <p>Login</p>
          </div>
        </div>
      </nav>

      <div className="landingMainContainer">
        <div>
          <h1><span style={{color:"#FF9839" }}>Connect </span>with your loved ones</h1>
          <p>Cover a distance by Apna Video Call</p>
          <div role='button' className='connectButton' onClick={handleConnect}>
            <p>Connect</p>
          </div>
        </div>
        <div>
          <img src="/mobile.png" alt=""/>
        </div>
      </div>
    </div>
  )
}

