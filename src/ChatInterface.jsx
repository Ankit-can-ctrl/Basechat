// ChatInterface.js
import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  Drawer,
  Avatar,
  Snackbar,
  Alert,
  Badge,
  useMediaQuery,
  IconButton,
  AppBar,
  Toolbar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Send as SendIcon,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import {
  sendMessage,
  setCurrentUser,
  clearError,
  setActiveConversation,
} from "./chatSlice";

const drawerWidth = 240;

const ChatInterface = () => {
  const [input, setInput] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dispatch = useDispatch();
  const conversations = useSelector((state) => state.chat.conversations);
  const users = useSelector((state) => state.chat.users);
  const currentUser = useSelector((state) => state.chat.currentUser);
  const activeConversation = useSelector(
    (state) => state.chat.activeConversation
  );
  const status = useSelector((state) => state.chat.status);
  const error = useSelector((state) => state.chat.error);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSend = () => {
    if (activeConversation) {
      dispatch(
        sendMessage({ recipientId: activeConversation, message: input })
      );
      setInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleUserSelect = (userId) => {
    dispatch(setActiveConversation(userId));
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleCloseError = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch(clearError());
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, [conversations, activeConversation]);

  const activeMessages = activeConversation
    ? conversations[activeConversation]?.messages || []
    : [];

  const drawer = (
    <Box sx={{ overflow: "auto", height: "100%" }}>
      <List>
        {users.map((user) => (
          <ListItem
            button
            key={user.id}
            onClick={() => handleUserSelect(user.id)}
            selected={activeConversation === user.id}
          >
            <Badge
              badgeContent={conversations[user.id]?.unreadCount || 0}
              color="primary"
            >
              <Avatar
                sx={{
                  mr: 2,
                  bgcolor:
                    user.status === "online" ? "success.main" : "grey.500",
                }}
              >
                {user.name[0]}
              </Avatar>
            </Badge>
            <ListItemText primary={user.name} secondary={user.status} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <AppBar position="static">
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={() => setDrawerOpen(!drawerOpen)}
                sx={{ mr: 2 }}
              >
                {activeConversation ? <ArrowBackIcon /> : <MenuIcon />}
              </IconButton>
            )}
            <Typography variant="h6" noWrap component="div">
              {activeConversation
                ? `Chat with ${
                    users.find((u) => u.id === activeConversation)?.name
                  }`
                : "Select a user to start chatting"}
            </Typography>
          </Toolbar>
        </AppBar>
        <Paper
          elevation={3}
          sx={{ flexGrow: 1, overflow: "auto", p: 2 }}
          ref={chatContainerRef}
        >
          <List>
            {activeMessages.map((message) => (
              <ListItem key={message.id} alignItems="flex-start">
                <ListItemText
                  primary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body1"
                        sx={{ fontWeight: "bold", mr: 1 }}
                      >
                        {message.sender}
                      </Typography>
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        {formatTimestamp(message.timestamp)}
                      </Typography>
                    </React.Fragment>
                  }
                  secondary={message.text}
                />
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        </Paper>
        <Box sx={{ p: 2, backgroundColor: "background.default" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TextField
              fullWidth
              variant="outlined"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                activeConversation
                  ? "Type a message..."
                  : "Select a user to start chatting"
              }
              disabled={status === "loading" || !activeConversation}
              error={!!error}
              helperText={error}
            />
            <Button
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              onClick={handleSend}
              disabled={
                status === "loading" || !input.trim() || !activeConversation
              }
              sx={{ ml: 1, height: "56px" }}
            >
              {isMobile ? "" : "Send"}
            </Button>
          </Box>
        </Box>
      </Box>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChatInterface;
