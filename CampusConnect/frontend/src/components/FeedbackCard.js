import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    IconButton,
    Chip,
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Popover,
    Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CommentIcon from '@mui/icons-material/Comment';
import { useAuthContext } from '../hooks/useAuthContext';


function FeedbackCard({ feedback, onResolve, onComment, onDelete }) {
    const [commentText, setCommentText] = useState('');
    const [isResolved, setIsResolved] = useState(feedback.isResolved);
    const [anchorEl, setAnchorEl] = useState(null);
    const [sender, setSender] = useState({});
    const { user } = useAuthContext();

    useEffect(() => {
        const fetchSender = async () => {
            try {
                const response = await fetch(`https://campusconnectbackend-67br.onrender.com/api/user/${feedback.user}`, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
                const json = await response.json();

                // Set the sender in state
                setSender(json.user || {});

                return json.user;
            } catch (error) {
                console.error("Error fetching sender:", error);
            }
        }
        if (feedback && feedback.user) {
            fetchSender();
        }
    }, [feedback]);

    const handleResolveClick = () => {
        if (onResolve) {
            const updatedResolvedStatus = !isResolved;
            setIsResolved(updatedResolvedStatus);
            onResolve(feedback._id, updatedResolvedStatus);
        }
    };

    const handleCommentClick = () => {
        if (commentText && onComment) {
            onComment(feedback._id, commentText);
            setCommentText('');
        }
    };

    const handleDeleteClick = () => {
        if (onDelete) {
            onDelete(feedback._id);
        }
    };

    const handleContentClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClosePopover = () => {
        setAnchorEl(null);
    };

    const getFeedbackTypeStyles = (type) => {
        switch (type.toLowerCase()) {
            case 'bug':
                return {
                    bgcolor: 'error.main',
                    color: 'common.white',
                    border: '1px solid',
                    borderColor: 'error.main',
                };
            case 'suggestion':
                return {
                    bgcolor: 'warning.main',
                    color: 'common.white',
                    border: '1px solid',
                    borderColor: 'warning.main',
                };
            case 'other':
                return {
                    bgcolor: 'info.main',
                    color: 'common.white',
                    border: '1px solid',
                    borderColor: 'info.main',
                };
            default:
                return {
                    bgcolor: 'grey.400',
                    color: 'common.white',
                    border: '1px solid',
                    borderColor: 'grey.400',
                };
        }
    };

    // Get the styles for the current feedback type
    const feedbackTypeStyles = getFeedbackTypeStyles(feedback.type);

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <Card
            sx={{
                height: '500px',
                marginBottom: 2,
                borderRadius: 1,
                border: `2px solid`,
                borderColor: feedbackTypeStyles.borderColor,
                boxShadow: "0px 4px 10px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
            }}
        >
            {/* Feedback Type Banner */}
            <Box sx={{
                ...feedbackTypeStyles,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '1px 1px 0 0',
                padding: 1,
                width: '100%', // Ensure the banner has full width
                boxShadow: 'inset 0 -1px 0 0 rgba(0,0,0,0.12)', // Optional: adds a subtle shadow inside the banner for depth
                borderTop: `2px solid ${feedbackTypeStyles.borderColor}`, // Ensure the top border is visible
            }}>
                <Typography variant="h9" component="div" sx={{ color: feedbackTypeStyles.color, width: '100%', textAlign: 'center' }}>
                    {feedback.type}
                </Typography>
            </Box>

            <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{
                        overflow: 'clip',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        mb: 2,
                        fontSize: '0.9rem',
                        cursor: 'pointer', // Add cursor pointer to indicate it's clickable
                    }}
                    onClick={handleContentClick}
                >
                    {feedback.content}
                </Typography>

                <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClosePopover}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                >
                    <Paper sx={{
                        minWidth: '480px', // Set your desired min width
                        maxWidth: '700px', // Set your desired max width
                    }}>
                        <Box p={2} WebkitLineClamp={3} sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {feedback.content.split('\n').map((paragraph, index) => (
                                <Typography key={index} paragraph>
                                    {paragraph}
                                </Typography>
                            ))}
                        </Box>
                    </Paper>
                </Popover>

            </CardContent>

            {/* Comments section */}
            <List dense sx={{
                width: '100%',
                maxHeight: '300px',
                overflowY: 'auto',
                bgcolor: 'background.paper',
            }}>
                {feedback.comments.map((comment, index) => (
                    <ListItem key={index}>
                        <ListItemAvatar>
                            <Avatar>
                                <CommentIcon style={{ fontSize: '1rem' }} />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={comment.text}
                            secondary={"Admin"} // change with actual comment author
                        />
                    </ListItem>
                ))}
            </List>



            {/* Action buttons */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                paddingX: 2, // Adjust this value as needed to align with the input text area
                marginTop: 1 
            }}>
                {sender && (
                    <Box sx={{ textAlign: 'left', flexGrow: 1 }}>
                        <Typography variant="caption" color="textSecondary" gutterBottom>
                            {sender.firstName + " " + sender.lastName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            {new Date(feedback.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </Typography>
                    </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                        label={isResolved ? 'Resolved' : 'Unresolved'}
                        color="default"
                        onClick={handleResolveClick}
                        sx={{
                            backgroundColor: isResolved ? 'success.main' : undefined,
                            color: isResolved ? 'common.white' : undefined,
                            marginRight: 1 // Add some space between the chip and the icon button
                        }}
                    />
                    <IconButton
                        color="error"
                        aria-label="delete feedback"
                        onClick={handleDeleteClick}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            </Box>



            {/* Comment input and button fixed at the bottom */}
            <Box sx={{ 
                borderTop: 1, 
                borderColor: 'divider', 
                padding: 2, 
                display: 'flex', 
                justifyContent: 'space-between', // This will align the items to the sides
                alignItems: 'center'
            }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        label="Write a comment"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        size="small"
                    />
                    <Button
                        variant="contained"
                        onClick={handleCommentClick}
                        sx={{
                            whiteSpace: 'nowrap',
                            width: 200, // You can use a number for pixel values
                            bgcolor: 'common.white',
                            color: 'info.main',
                            border: 1,
                            borderColor: 'info.main',
                            '&:hover': {
                                bgcolor: 'common.white', // Maintain the background color on hover
                                // If you want to change the border color on hover, you can add that here as well
                            }
                        }}
                    >
                        Add Comment
                    </Button>
                </Box>
            </Box>
        </Card>
    );
}

export default FeedbackCard;
