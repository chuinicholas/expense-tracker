import { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  AccountCircle as AccountCircleIcon,
  HelpOutline as HelpOutlineIcon,
  Logout as LogoutIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserGreeting from "./UserGreeting";

export default function Sidebar({ mobileOpen, onDrawerToggle }) {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  const drawer = (
    <>
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

      <List sx={{ mt: { xs: 2, sm: 8 } }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            button
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={isMobile ? onDrawerToggle : undefined}
            sx={{
              height: 56,
              mx: 1,
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: isHovered && !isMobile ? "flex-start" : "center",
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
                minWidth: isHovered && !isMobile ? 40 : "auto",
                mr: isHovered && !isMobile ? 2 : 0,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{
                m: 0,
                opacity: (isHovered && !isMobile) || isMobile ? 1 : 0,
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
          onClick={isMobile ? onDrawerToggle : undefined}
          sx={{
            height: 56,
            mx: 1,
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: isHovered && !isMobile ? "flex-start" : "center",
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: isHovered && !isMobile ? 40 : "auto",
              mr: isHovered && !isMobile ? 2 : 0,
            }}
          >
            <AccountBalanceWalletIcon />
          </ListItemIcon>
          <ListItemText
            primary="Shared Wallets"
            sx={{
              m: 0,
              opacity: (isHovered && !isMobile) || isMobile ? 1 : 0,
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
            justifyContent: isHovered && !isMobile ? "flex-start" : "center",
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: isHovered && !isMobile ? 40 : "auto",
              mr: isHovered && !isMobile ? 2 : 0,
            }}
          >
            <LogoutIcon sx={{ color: "error.light" }} />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            sx={{
              m: 0,
              opacity: (isHovered && !isMobile) || isMobile ? 1 : 0,
              transition: "opacity 0.2s",
              "& .MuiListItemText-primary": {
                color: "error.main",
              },
            }}
          />
        </ListItem>
      </List>
    </>
  );

  return (
    <>
      {/* Mobile App Bar */}
      <AppBar
        position="fixed"
        sx={{
          display: { sm: "none" },
          backgroundColor: "background.paper",
          color: "text.primary",
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Expense Tracker
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            width: 240,
            backgroundColor: "background.paper",
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        sx={{
          display: { xs: "none", sm: "block" },
          width: isHovered ? 240 : 80,
          transition: "width 0.2s ease-in-out",
          "& .MuiDrawer-paper": {
            width: isHovered ? 240 : 80,
            transition: "width 0.2s ease-in-out",
            overflowX: "hidden",
            backgroundColor: "background.paper",
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
