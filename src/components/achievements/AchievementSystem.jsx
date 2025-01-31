import { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  Typography,
  Stack,
  Avatar,
  Chip,
  Badge,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
  Stars as StarsIcon,
  Savings as SavingsIcon,
  TrendingUp as StreakIcon,
  WorkspacePremium as PremiumIcon,
  LocalFireDepartment as StreakFireIcon,
  Diamond as DiamondIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { useAuth } from "../../context/AuthContext";
import { format, isLastDayOfMonth, endOfYear, isEqual } from "date-fns";

const achievements = {
  MONTHLY_BUDGET_MASTER: {
    id: "MONTHLY_BUDGET_MASTER",
    title: "Monthly Budget Master",
    description: "Stayed within budget for all categories this month",
    icon: <TrophyIcon />,
    color: "#FFD700", // Gold
    points: 100,
    type: "monthly",
  },
  MONTHLY_SAVING_STAR: {
    id: "MONTHLY_SAVING_STAR",
    title: "Monthly Saving Star",
    description: "Saved 20% of monthly income",
    icon: <SavingsIcon />,
    color: "#C0C0C0", // Silver
    points: 50,
    type: "monthly",
  },
  MONTHLY_PREMIUM_SAVER: {
    id: "MONTHLY_PREMIUM_SAVER",
    title: "Monthly Premium Saver",
    description: "Saved 50% of monthly income",
    icon: <PremiumIcon />,
    color: "#9C27B0", // Purple
    points: 150,
    type: "monthly",
  },
  YEARLY_BUDGET_MASTER: {
    id: "YEARLY_BUDGET_MASTER",
    title: "Yearly Budget Champion",
    description: "Maintained budget discipline throughout the year",
    icon: <DiamondIcon />,
    color: "#00BCD4", // Cyan
    points: 500,
    type: "yearly",
  },
  SAVING_STREAK: {
    id: "SAVING_STREAK",
    title: "Saving Streak",
    description: "Maintained savings above 20% for 3 consecutive months",
    icon: <StreakFireIcon />,
    color: "#FF5722", // Deep Orange
    points: 200,
    type: "streak",
  },
};

export default function AchievementSystem({ budgets, expenses, incomes }) {
  const [userAchievements, setUserAchievements] = useState([]);
  const [showAchievement, setShowAchievement] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const { currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    // Load user achievements and streak data
    const loadedAchievements =
      JSON.parse(localStorage.getItem(`achievements_${currentUser.uid}`)) || [];
    const loadedStreak =
      parseInt(localStorage.getItem(`streak_${currentUser.uid}`)) || 0;
    setUserAchievements(loadedAchievements);
    setStreakCount(loadedStreak);
    calculateTotalPoints(loadedAchievements);
  }, [currentUser.uid]);

  const calculateTotalPoints = (achievements) => {
    const points = achievements.reduce(
      (total, achievement) => total + (achievement.points || 0),
      0
    );
    setTotalPoints(points);
  };

  useEffect(() => {
    const today = new Date();
    const isMonthEnd = isLastDayOfMonth(today);
    const isYearEnd = isEqual(today, endOfYear(today));

    if (isMonthEnd) {
      checkMonthlyAchievements();
    }

    if (isYearEnd) {
      checkYearlyAchievements();
    }

    // Check streak achievements regardless of date
    checkStreakAchievements();
  }, [budgets, expenses, incomes]);

  const checkMonthlyAchievements = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Filter current month's data
    const monthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    });

    const monthIncomes = incomes.filter((income) => {
      const incomeDate = new Date(income.date);
      return (
        incomeDate.getMonth() === currentMonth &&
        incomeDate.getFullYear() === currentYear
      );
    });

    // Check Monthly Budget Master
    const isWithinBudget = budgets.every((budget) => {
      const spent = monthExpenses
        .filter((expense) => expense.category === budget.category)
        .reduce((sum, expense) => sum + expense.amount, 0);
      return spent <= budget.amount;
    });

    if (isWithinBudget) {
      awardAchievement("MONTHLY_BUDGET_MASTER");
    }

    // Check Monthly Saving Achievements
    const monthlyIncome = monthIncomes.reduce(
      (sum, income) => sum + income.amount,
      0
    );
    const monthlyExpenses = monthExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const savingsRate =
      ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100;

    if (savingsRate >= 20) {
      awardAchievement("MONTHLY_SAVING_STAR");
      updateSavingStreak(true);
    } else {
      updateSavingStreak(false);
    }

    if (savingsRate >= 50) {
      awardAchievement("MONTHLY_PREMIUM_SAVER");
    }
  };

  const checkYearlyAchievements = () => {
    const currentYear = new Date().getFullYear();

    // Filter current year's data
    const yearExpenses = expenses.filter(
      (expense) => new Date(expense.date).getFullYear() === currentYear
    );

    // Check if maintained budget throughout the year
    const monthlyAchievements = userAchievements.filter(
      (achievement) =>
        achievement.id === "MONTHLY_BUDGET_MASTER" &&
        new Date(achievement.dateAwarded).getFullYear() === currentYear
    );

    if (monthlyAchievements.length >= 12) {
      awardAchievement("YEARLY_BUDGET_MASTER");
    }
  };

  const updateSavingStreak = (maintained) => {
    if (maintained) {
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      localStorage.setItem(`streak_${currentUser.uid}`, newStreak);

      if (newStreak >= 3) {
        awardAchievement("SAVING_STREAK");
      }
    } else {
      setStreakCount(0);
      localStorage.setItem(`streak_${currentUser.uid}`, 0);
    }
  };

  const checkStreakAchievements = () => {
    if (streakCount >= 3 && !hasAchievement("SAVING_STREAK")) {
      awardAchievement("SAVING_STREAK");
    }
  };

  const hasAchievement = (achievementId) => {
    const currentMonth = format(new Date(), "yyyy-MM");
    return userAchievements.some(
      (a) =>
        a.id === achievementId &&
        format(new Date(a.dateAwarded), "yyyy-MM") === currentMonth
    );
  };

  const awardAchievement = (achievementId) => {
    const achievement = achievements[achievementId];
    const newAchievement = {
      ...achievement,
      dateAwarded: new Date().toISOString(),
    };

    const updatedAchievements = [...userAchievements, newAchievement];
    setUserAchievements(updatedAchievements);
    setShowAchievement(newAchievement);
    calculateTotalPoints(updatedAchievements);

    localStorage.setItem(
      `achievements_${currentUser.uid}`,
      JSON.stringify(updatedAchievements)
    );
  };

  return (
    <>
      <Box sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000 }}>
        <Tooltip title="Your Achievements">
          <Badge
            badgeContent={userAchievements.length}
            color="primary"
            sx={{ cursor: "pointer" }}
          >
            <Chip
              icon={<StarsIcon />}
              label={`${totalPoints} pts`}
              color="primary"
              onClick={() => setShowAchievement({ showAll: true })}
              sx={{
                bgcolor: "background.paper",
                "& .MuiChip-icon": {
                  color: "primary.main",
                },
              }}
            />
          </Badge>
        </Tooltip>
      </Box>

      <Dialog
        open={!!showAchievement}
        onClose={() => setShowAchievement(null)}
        maxWidth="xs"
        fullWidth
      >
        <AnimatePresence>
          {showAchievement && !showAchievement.showAll ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Confetti
                  width={window.innerWidth}
                  height={window.innerHeight}
                  recycle={false}
                  numberOfPieces={200}
                />
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: showAchievement.color,
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  {showAchievement.icon}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {showAchievement.title}
                </Typography>
                <Typography color="text.secondary">
                  {showAchievement.description}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                  +{showAchievement.points} points!
                </Typography>
              </Box>
            </motion.div>
          ) : (
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Your Achievements
              </Typography>
              <Stack spacing={2}>
                {userAchievements.map((achievement) => (
                  <Chip
                    key={achievement.id}
                    icon={achievement.icon}
                    label={`${achievement.title} (+${achievement.points} pts)`}
                    sx={{
                      bgcolor: achievement.color,
                      color: "white",
                      "& .MuiChip-icon": {
                        color: "white",
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </AnimatePresence>
      </Dialog>
    </>
  );
}
