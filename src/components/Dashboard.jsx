import { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Stack,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Zoom,
  Skeleton,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ExpenseForm from "./ExpenseForm";
import IncomeForm from "./IncomeForm";
import { useExpense } from "../context/ExpenseContext";
import MonthlyStats from "./MonthlyStats";
import ExpenseChart from "./ExpenseChart";
import CategoryPieChart from "./CategoryPieChart";
import QuoteDisplay from "./QuoteDisplay";

const MotionPaper = motion(Paper);
const MotionCard = motion(Card);

export default function Dashboard() {
  const { expenses, incomes } = useExpense();
  const [isLoading, setIsLoading] = useState(true);
  const [totals, setTotals] = useState({
    expenses: 0,
    income: 0,
    balance: 0,
  });

  useEffect(() => {
    // Calculate totals when expenses or incomes change
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncome - totalExpenses;

    // Use setTimeout to ensure smooth transition
    const timer = setTimeout(() => {
      setTotals({
        expenses: totalExpenses,
        income: totalIncome,
        balance: balance,
      });
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [expenses, incomes]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        mass: 1,
      },
    },
  };

  const StatCard = ({ title, amount, icon, color }) => (
    <MotionCard
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      layout
      sx={{
        height: "100%",
        minHeight: "140px", // Add fixed minimum height
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" color="text.secondary">
              {title}
            </Typography>
            <Box
              sx={{
                backgroundColor: `${color}.lighter`,
                p: 1,
                borderRadius: 2,
              }}
            >
              {icon}
            </Box>
          </Stack>
          {isLoading ? (
            <Skeleton variant="text" width="60%" height={48} />
          ) : (
            <Typography variant="h4" component="div">
              ${amount.toFixed(2)}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </MotionCard>
  );

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Quote Section */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          sx={{ mb: 4 }}
        >
          <QuoteDisplay />
        </motion.div>

        {/* Stats Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Total Income"
              amount={totals.income}
              icon={<TrendingUpIcon sx={{ color: "success.main" }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Total Expenses"
              amount={totals.expenses}
              icon={<TrendingDownIcon sx={{ color: "error.main" }} />}
              color="error"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Balance"
              amount={totals.balance}
              icon={<AccountBalanceWalletIcon sx={{ color: "primary.main" }} />}
              color="primary"
            />
          </Grid>
        </Grid>

        {/* Forms Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <MotionPaper
              elevation={0}
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              sx={{
                p: 3,
                backgroundColor: "error.lighter",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "error.light",
                "& .MuiInputBase-root": {
                  backgroundColor: "background.paper",
                },
              }}
            >
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  mb: 3,
                  color: "error.main",
                  fontWeight: "medium",
                }}
              >
                Add Expense
              </Typography>
              <ExpenseForm />
            </MotionPaper>
          </Grid>
          <Grid item xs={12} md={6}>
            <MotionPaper
              elevation={0}
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              sx={{
                p: 3,
                backgroundColor: "success.lighter",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "success.light",
                "& .MuiInputBase-root": {
                  backgroundColor: "background.paper",
                },
              }}
            >
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  mb: 3,
                  color: "success.main",
                  fontWeight: "medium",
                }}
              >
                Add Income
              </Typography>
              <IncomeForm />
            </MotionPaper>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MonthlyStats />
          </Grid>
          <Grid item xs={12}>
            <CategoryPieChart />
          </Grid>
          <Grid item xs={12}>
            <ExpenseChart />
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
}
