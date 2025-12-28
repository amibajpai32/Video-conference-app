import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import { AuthContext } from '../contexts/AuthContext';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const defaultTheme = createTheme();

export default function Authentication() {

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, SetError] = React.useState("");
  const [message, setMessage] = React.useState("");

  const [formState, setFormState] = React.useState(0); // 0 → Login, 1 → Register
  const [open, setOpen] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const handleAuth = async () => {
    SetError(""); // Clear previous errors
    try {
      if (formState === 1) {
        // REGISTER
        let result = await handleRegister(name, username, password);
        console.log(result);
        setUsername("");
        setMessage(result);
        setOpen(true);
        SetError("");
        setFormState(0);
        setPassword("");
      }

      if (formState === 0) {
        // LOGIN
        let result = await handleLogin(username, password);
        setMessage("Login successful");
        setOpen(true);
      }

    } catch (err) {
      let errorMessage = err.response?.data?.message || err.message || "An error occurred";
      SetError(errorMessage);
      setMessage(errorMessage);
      setOpen(true);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box
        component="main"
        sx={{
          height: '100vh',
          display: 'flex',
        }}
      >
        <CssBaseline />

        {/* LEFT IMAGE */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'block' },
            width: { sm: '33.333%', md: '58.333%' },
            backgroundImage: 'url(https://source.unsplash.com/random?wallpapers)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* RIGHT FORM CARD */}
        <Box
          component={Paper}
          elevation={6}
          square
          sx={{
            width: { xs: '100%', sm: '66.667%', md: '41.667%' },
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>

            <div style={{ marginBottom: "15px" }}>
              <button
                style={{ marginRight: "10px" }}
                onClick={() => setFormState(0)}
              >
                Signin
              </button>
              <button onClick={() => setFormState(1)}>
                Signup
              </button>
            </div>

            {/* FORM */}
            <Box component="form" noValidate sx={{ mt: 1 }}>

              {/* ONLY SHOW FULL NAME IN SIGNUP */}
              {formState === 1 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Full Name"
                  name="username"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
                name="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* ERROR MESSAGE */}
              <p style={{ color: "red" }}>{error}</p>

              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleAuth}
              >
                {formState === 0 ? "Login" : "Register"}
              </Button>

              <Copyright sx={{ mt: 5 }} />
            </Box>

          </Box>
        </Box>
      </Box>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        message={message}
        onClose={() => setOpen(false)}
      />
    </ThemeProvider>
  );
}

