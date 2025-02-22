import { useExpense } from "../context/ExpenseContext";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Box, Typography, useTheme, Stack } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF4567",
  "#82ca9d",
  "#8884d8",
  "#ffc658",
  "#ff7300",
];

export default function CategorySpendingChart() {
  const { expenses } = useExpense();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      setMounted(false);
    };
  }, []);

  // Filter out expenses with null or undefined amounts
  const validExpenses = expenses.filter(
    (expense) =>
      expense && typeof expense.amount === "number" && expense.category
  );

  const categoryTotals = validExpenses.reduce((acc, expense) => {
    const amount =
      typeof expense.amount === "string"
        ? parseFloat(expense.amount)
        : expense.amount;
    acc[expense.category] = (acc[expense.category] || 0) + amount;
    return acc;
  }, {});

  const totalSpending = Object.values(categoryTotals).reduce(
    (a, b) => a + b,
    0
  );

  const data = Object.entries(categoryTotals)
    .map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
      percentage: ((value / totalSpending) * 100).toFixed(1),
    }))
    .sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            bgcolor: "background.paper",
            p: 1.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            boxShadow: theme.shadows[2],
            minWidth: 150,
          }}
        >
          <Typography variant="subtitle2" color="text.primary" gutterBottom>
            {data.name}
          </Typography>
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              Amount:{" "}
              <Box
                component="span"
                sx={{ fontWeight: "bold", color: "text.primary" }}
              >
                ${data.value.toFixed(2)}
              </Box>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Percentage:{" "}
              <Box
                component="span"
                sx={{ fontWeight: "bold", color: "text.primary" }}
              >
                {data.percentage}%
              </Box>
            </Typography>
          </Stack>
        </Box>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    if (!payload) return null;

    return (
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 1,
          px: 1,
          py: 1,
          maxWidth: "100%",
          minHeight: isMobile ? "24px" : "36px",
        }}
      >
        {payload.map((entry, index) => (
          <Box
            key={`legend-${index}`}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              flexBasis: isMobile ? "45%" : "auto",
              minWidth: "fit-content",
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: entry.color,
                flexShrink: 0,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: "text.primary",
                fontSize: isMobile ? "0.7rem" : "0.8rem",
                whiteSpace: "nowrap",
              }}
            >
              {entry.value} (
              {data.find((item) => item.name === entry.value)?.percentage}%)
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  if (!mounted || data.length === 0) {
    return (
      <Box
        sx={{
          height: "100%",
          minHeight: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          {!mounted ? "Loading..." : "No spending data available"}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        height: isMobile ? "300px" : "400px",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: { xs: 0.5, sm: 1 },
          color: "text.primary",
          fontWeight: "medium",
          fontSize: { xs: "0.875rem", sm: "1.125rem" },
        }}
      >
        Spending by Category
      </Typography>
      <Box
        sx={{
          flex: 1,
          width: "100%",
          height: "calc(100% - 60px)", // Increased space for legend
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ flex: 1, position: "relative", minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={isMobile ? "30%" : "35%"}
                outerRadius={isMobile ? "60%" : "65%"}
                paddingAngle={2}
                dataKey="value"
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  value,
                  index,
                }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = 25 + innerRadius + (outerRadius - innerRadius);
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  return (
                    <text
                      x={x}
                      y={y}
                      fill={theme.palette.text.primary}
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      style={{
                        fontSize: isMobile ? "0.6rem" : "0.75rem",
                        fontWeight: "500",
                      }}
                    >
                      {data[index].percentage}%
                    </text>
                  );
                }}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke={theme.palette.background.paper}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                content={<CustomLegend />}
                verticalAlign="bottom"
                height={50}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  );
}
