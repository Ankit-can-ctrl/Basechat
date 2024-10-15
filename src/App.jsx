import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import ChatInterface from "./ChatInterface";
import chatReducer from "./chatSlice";

const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
});

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ChatInterface />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
