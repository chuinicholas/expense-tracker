import { useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AccountCircle from "@mui/icons-material/AccountCircle";
import UserGreeting from "./UserGreeting";

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    navigate("/app/profile");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            cursor: "pointer",
            color: "primary.main",
          }}
          onClick={() => navigate("/app")}
        >
          Budget Tracker
        </Typography>

        {currentUser && (
          <Stack direction="row" spacing={2} alignItems="center">
            <UserGreeting />
            <IconButton size="large" onClick={handleMenu} color="inherit">
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
}
