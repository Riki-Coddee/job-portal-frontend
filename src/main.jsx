// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastContainer } from "react-toastify";
import { RecruiterProvider } from './context/RecruiterContext.jsx';
import { JobProvider } from './context/JobContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx';
import { JobSeekerProvider } from './context/JobSeekerContext.jsx';
import { ApplicationsProvider } from './context/ApplicationContext.jsx';

// Wrap providers conditionally based on authentication
const Providers = ({ children }) => {
  return (
    <AuthProvider>
      <JobProvider>
        <RecruiterProvider>
          <JobSeekerProvider>
            <ChatProvider>
              <ApplicationsProvider>
                {children}
              </ApplicationsProvider>
            </ChatProvider>
          </JobSeekerProvider>
        </RecruiterProvider>
      </JobProvider>
    </AuthProvider>
  );
};

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <BrowserRouter>
      <Providers>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          style={{ zIndex: 999999 }}
        />
      </Providers>
    </BrowserRouter>
  // </StrictMode>,
)