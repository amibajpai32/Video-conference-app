# Video Conference App

A full-stack video conferencing application built with React (Frontend) and Node.js/Express (Backend).

## Project Structure

```
Video-conference-app/
├── Backend/          # Node.js/Express backend server
│   ├── src/
│   │   ├── app.js
│   │   ├── controllers/
│   │   ├── models/
│   │   └── routes/
│   └── package.json
├── Frontend/         # React frontend application
│   ├── src/
│   │   ├── pages/
│   │   ├── contexts/
│   │   └── ...
│   ├── public/
│   └── package.json
└── package.json
```

## Getting Started

### Backend Setup

1. Navigate to the Backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The backend server will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the Frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (default Vite port)

## Features

- User authentication (Login/Register)
- Video conferencing capabilities
- Real-time communication using Socket.io

## Technologies Used

### Frontend
- React
- Vite
- React Router
- Material-UI
- Axios

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- Socket.io
- JWT Authentication
- Bcrypt

## License

ISC

