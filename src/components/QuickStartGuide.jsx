import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  AccountCircle,
  AddCircleOutline,
  AttachMoney,
  Assessment,
  AccountBalance,
  TrendingUp,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function QuickStartGuide() {
  const navigate = useNavigate();

  const steps = [
    {
      label: "Set Up Your Profile",
      description: "Complete your profile to personalize your experience.",
      icon: <AccountCircle color="primary" />,
      action: () => navigate("/profile"),
      tips: [
        "Add your display name",
        "Verify your email address",
        "Set a secure password",
      ],
    },
    {
      label: "Add Your First Transaction",
      description:
        "Start tracking your finances by adding an income or expense.",
      icon: <AddCircleOutline color="primary" />,
      action: () => navigate("/"),
      tips: [
        "Record daily expenses",
        "Add regular income sources",
        "Categorize your transactions",
      ],
    },
    {
      label: "Set Up Budget Goals",
      description: "Create monthly or yearly budgets to manage your spending.",
      icon: <AccountBalance color="primary" />,
      action: () => navigate("/budget"),
      tips: [
        "Set category-wise budgets",
        "Choose monthly or yearly periods",
        "Monitor your spending limits",
      ],
    },
    {
      label: "Track Your Progress",
      description:
        "Monitor your financial health through reports and analytics.",
      icon: <Assessment color="primary" />,
      action: () => navigate("/expenses"),
      tips: [
        "View spending patterns",
        "Check budget compliance",
        "Export financial reports",
      ],
    },
  ];

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Quick Start Guide
        </Typography>

        <Stepper orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label} active={true}>
              <StepLabel StepIconComponent={() => step.icon}>
                <Typography variant="h6">{step.label}</Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {step.description}
                  </Typography>

                  <List dense>
                    {step.tips.map((tip, tipIndex) => (
                      <ListItem key={tipIndex}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <TrendingUp fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={tip}
                          primaryTypographyProps={{
                            variant: "body2",
                            color: "text.primary",
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    variant="contained"
                    onClick={step.action}
                    sx={{ mt: 2 }}
                  >
                    Get Started
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            Need Help?
          </Typography>
          <Typography color="text.secondary" paragraph>
            If you need assistance or have questions, you can:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <AttachMoney color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Review your transactions in the Expenses page"
                secondary="Track all your financial movements in one place"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Assessment color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Check your budget progress"
                secondary="Monitor your spending against set budgets"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <AccountBalance color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Manage your categories"
                secondary="Customize expense and income categories"
              />
            </ListItem>
          </List>
        </Box>
      </Paper>
    </Box>
  );
}
