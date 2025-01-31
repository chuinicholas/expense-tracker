import { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  AccountCircle as AccountCircleIcon,
  HelpOutline as HelpOutlineIcon,
  Logout as LogoutIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
} from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserGreeting from "./UserGreeting";

export default function Sidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/app",
    },
    {
      text: "Expenses",
      icon: <ReceiptIcon />,
      path: "/app/expenses",
    },
    {
      text: "Budget",
      icon: <AccountBalanceIcon />,
      path: "/app/budget",
    },
    {
      text: "Profile",
      icon: <AccountCircleIcon />,
      path: "/app/profile",
    },
    {
      text: "Guide",
      icon: <HelpOutlineIcon />,
      path: "/app/guide",
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <Drawer
      variant="permanent"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        width: isHovered ? 240 : 80,
        transition: "width 0.2s ease-in-out",
        "& .MuiDrawer-paper": {
          width: isHovered ? 240 : 80,
          transition: "width 0.2s ease-in-out",
          overflowX: "hidden",
          bgcolor: "background.paper",
        },
      }}
    >
      <Box
        sx={{
          p: 1.5,
          mb: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          minHeight: "72px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <UserGreeting />
      </Box>

      <List sx={{ mt: 8 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            button
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              height: 56,
              mx: 1,
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: isHovered ? "flex-start" : "center",
              "&.Mui-selected": {
                backgroundColor: "rgba(96, 165, 250, 0.15)",
                "&:hover": {
                  backgroundColor: "rgba(96, 165, 250, 0.25)",
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: isHovered ? 40 : "auto",
                mr: isHovered ? 2 : 0,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{
                m: 0,
                opacity: isHovered ? 1 : 0,
                transition: "opacity 0.2s",
                "& .MuiListItemText-primary": {
                  color: "text.primary",
                },
              }}
            />
          </ListItem>
        ))}

        <ListItem
          button
          component={Link}
          to="/app/shared-wallets"
          selected={location.pathname === "/app/shared-wallets"}
          sx={{
            height: 56,
            mx: 1,
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: isHovered ? "flex-start" : "center",
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: isHovered ? 40 : "auto",
              mr: isHovered ? 2 : 0,
            }}
          >
            <AccountBalanceWalletIcon />
          </ListItemIcon>
          <ListItemText
            primary="Shared Wallets"
            sx={{
              m: 0,
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.2s",
              "& .MuiListItemText-primary": {
                color: "text.primary",
              },
            }}
          />
        </ListItem>

        <Box sx={{ flexGrow: 1 }} />

        <ListItem
          button
          onClick={handleLogout}
          sx={{
            height: 56,
            mx: 1,
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: isHovered ? "flex-start" : "center",
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: isHovered ? 40 : "auto",
              mr: isHovered ? 2 : 0,
            }}
          >
            <LogoutIcon sx={{ color: "error.light" }} />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            sx={{
              m: 0,
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.2s",
              "& .MuiListItemText-primary": {
                color: "error.main",
              },
            }}
          />
        </ListItem>
      </List>
    </Drawer>
  );
}
