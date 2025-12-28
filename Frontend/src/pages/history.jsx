import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import { IconButton } from '@mui/material';
import '../App.css';

export default function History() {


    const { getHistoryOfUser } = useContext(AuthContext);

    const [meetings, setMeetings] = useState([])


    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch {
                // IMPLEMENT SNACKBAR
            }
        }

        fetchHistory();
    }, [])

    let formatDate = (dateString) => {

        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear();

        return `${day}/${month}/${year}`

    }

    return (
        <div className="historyContainer">
            <div className="historyHeader">
                <h1>Meeting History</h1>
                <IconButton 
                    onClick={() => routeTo("/home")}
                    sx={{
                        backgroundColor: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        '&:hover': {
                            backgroundColor: '#f5f5f5',
                            transform: 'scale(1.1)'
                        },
                        transition: 'all 0.3s ease'
                    }}
                >
                    <HomeIcon />
                </IconButton>
            </div>
            {
                meetings.length !== 0 ? (
                    <div className="historyGrid">
                        {meetings.map((e, i) => (
                            <Card 
                                key={i} 
                                className="historyCard"
                                sx={{
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    background: 'white'
                                }}
                            >
                                <CardContent sx={{ padding: '1.5rem' }}>
                                    <Typography 
                                        sx={{ 
                                            fontSize: 16, 
                                            fontWeight: 600,
                                            color: '#667eea',
                                            marginBottom: '0.5rem'
                                        }} 
                                        gutterBottom
                                    >
                                        Code: {e.meetingCode}
                                    </Typography>
                                    <Typography 
                                        sx={{ 
                                            fontSize: 14, 
                                            color: 'text.secondary'
                                        }}
                                    >
                                        Date: {formatDate(e.date)}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ padding: '0 1.5rem 1.5rem' }}>
                                    <Button 
                                        size="small" 
                                        variant="contained"
                                        onClick={() => routeTo(`/${e.meetingCode}`)}
                                        sx={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                                            }
                                        }}
                                    >
                                        Rejoin Meeting
                                    </Button>
                                </CardActions>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="emptyHistory">
                        <Typography variant="h6" color="text.secondary">
                            No meeting history yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ marginTop: '1rem' }}>
                            Join a meeting to see it here
                        </Typography>
                    </div>
                )
            }
        </div>
    )
}
