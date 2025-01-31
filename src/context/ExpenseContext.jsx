import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../config/firebase";
import { useAuth } from "./AuthContext";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  getDoc,
  updateDoc,
} from "firebase/firestore";

const ExpenseContext = createContext();

export function useExpense() {
  return useContext(ExpenseContext);
}

export function ExpenseProvider({ children }) {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    } else {
      // Clear all data when user logs out
      setExpenses([]);
      setIncomes([]);
      setBudgets([]);
    }
  }, [currentUser]);

  const loadUserData = async () => {
    if (!currentUser) return;

    try {
      const expensesQuery = query(
        collection(db, "expenses"),
        where("userId", "==", currentUser.uid)
      );
      const expenseSnapshot = await getDocs(expensesQuery);
      const expenseData = expenseSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenses(expenseData);

      const incomesQuery = query(
        collection(db, "incomes"),
        where("userId", "==", currentUser.uid)
      );
      const incomeSnapshot = await getDocs(incomesQuery);
      const incomeData = incomeSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIncomes(incomeData);

      const budgetsQuery = query(
        collection(db, "budgets"),
        where("userId", "==", currentUser.uid)
      );
      const budgetSnapshot = await getDocs(budgetsQuery);
      const budgetData = budgetSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBudgets(budgetData);

      // Load user's categories
      const userCategoriesDoc = await getDoc(
        doc(db, "userCategories", currentUser.uid)
      );

      if (userCategoriesDoc.exists()) {
        setExpenseCategories(userCategoriesDoc.data().expenseCategories || []);
        setIncomeCategories(userCategoriesDoc.data().incomeCategories || []);
      } else {
        // Default categories for new users
        const defaultExpenseCategories = [
          "Food & Dining",
          "Transportation",
          "Housing",
          "Utilities",
          "Healthcare",
          "Entertainment",
          "Shopping",
          "Education",
          "Personal Care",
          "Travel",
          "Insurance",
          "Savings",
          "Investments",
          "Gifts & Donations",
          "Other",
        ];

        const defaultIncomeCategories = [
          "Salary",
          "Freelance",
          "Business",
          "Investments",
          "Rental Income",
          "Interest",
          "Dividends",
          "Bonus",
          "Commission",
          "Gifts",
          "Other",
        ];

        // Save default categories to Firebase
        await setDoc(doc(db, "userCategories", currentUser.uid), {
          expenseCategories: defaultExpenseCategories,
          incomeCategories: defaultIncomeCategories,
          userId: currentUser.uid,
          createdAt: serverTimestamp(),
        });

        // Update local state
        setExpenseCategories(defaultExpenseCategories);
        setIncomeCategories(defaultIncomeCategories);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const addExpense = async (expenseData) => {
    console.log("Current user:", currentUser);
    console.log("Current user UID:", currentUser?.uid);

    if (!currentUser) {
      console.error("No authenticated user found");
      throw new Error("User not authenticated");
    }

    try {
      console.log("Adding expense:", expenseData);
      const newExpense = {
        ...expenseData,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        amount: parseFloat(expenseData.amount),
      };
      console.log("Formatted expense:", newExpense);

      // Add to Firebase first
      const docRef = await addDoc(collection(db, "expenses"), newExpense).catch(
        (error) => {
          console.error("Firebase error details:", {
            code: error.code,
            message: error.message,
            details: error,
          });
          throw error;
        }
      );

      console.log("Document reference:", docRef);

      // Then update local state with the new ID
      const expenseWithId = {
        ...newExpense,
        id: docRef.id,
        createdAt: new Date().toISOString(),
      };

      setExpenses((prevExpenses) => [...prevExpenses, expenseWithId]);
      return expenseWithId;
    } catch (error) {
      console.error("Detailed error in addExpense:", {
        error,
        errorMessage: error.message,
        errorCode: error.code,
        errorStack: error.stack,
      });
      throw error;
    }
  };

  const addIncome = async (incomeData) => {
    if (!currentUser) throw new Error("User not authenticated");

    try {
      const newIncome = {
        ...incomeData,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        amount: parseFloat(incomeData.amount),
      };

      const docRef = await addDoc(collection(db, "incomes"), newIncome);
      const incomeWithId = { ...newIncome, id: docRef.id };

      setIncomes((prevIncomes) => [...prevIncomes, incomeWithId]);
      return incomeWithId;
    } catch (error) {
      console.error("Error adding income:", error);
      throw error;
    }
  };

  const addBudget = async (budgetData) => {
    if (!currentUser) throw new Error("User not authenticated");

    try {
      const newBudget = {
        ...budgetData,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        amount: parseFloat(budgetData.amount),
      };

      const docRef = await addDoc(collection(db, "budgets"), newBudget);
      const budgetWithId = { ...newBudget, id: docRef.id };

      setBudgets((prev) => [...prev, budgetWithId]);
      return budgetWithId;
    } catch (error) {
      console.error("Error adding budget:", error);
      throw error;
    }
  };

  const updateBudget = async (budgetData) => {
    if (!currentUser) throw new Error("User not authenticated");

    try {
      const budgetRef = doc(db, "budgets", budgetData.id);
      await setDoc(budgetRef, {
        ...budgetData,
        userId: currentUser.uid,
        updatedAt: serverTimestamp(),
      });

      setBudgets((prev) =>
        prev.map((budget) =>
          budget.id === budgetData.id ? budgetData : budget
        )
      );
      return budgetData;
    } catch (error) {
      console.error("Error updating budget:", error);
      throw error;
    }
  };

  const removeBudget = async (budgetId) => {
    if (!currentUser || !budgetId) {
      throw new Error("Invalid budget deletion attempt");
    }

    try {
      const budgetRef = doc(db, "budgets", budgetId);
      await deleteDoc(budgetRef);
      setBudgets((prev) => prev.filter((budget) => budget.id !== budgetId));
      return true;
    } catch (error) {
      console.error("Error removing budget:", error);
      throw error;
    }
  };

  const removeExpense = async (expenseId) => {
    if (!currentUser || !expenseId) {
      throw new Error("Invalid expense deletion attempt");
    }

    try {
      const expenseRef = doc(db, "expenses", expenseId);
      await deleteDoc(expenseRef);
      setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId));
      return true;
    } catch (error) {
      console.error("Error removing expense:", error);
      throw error;
    }
  };

  const removeIncome = async (incomeId) => {
    console.log("Attempting to delete income:", incomeId);

    if (!currentUser || !incomeId) {
      console.error("Invalid income deletion attempt:", {
        currentUser,
        incomeId,
      });
      throw new Error("Invalid income deletion attempt");
    }

    try {
      // Delete from Firebase first
      const incomeRef = doc(db, "incomes", incomeId);
      console.log("Deleting from Firebase...");
      await deleteDoc(incomeRef);
      console.log("Successfully deleted from Firebase");

      // Then update local state
      setIncomes((prevIncomes) =>
        prevIncomes.filter((income) => income.id !== incomeId)
      );
      console.log("Local state updated");

      return true;
    } catch (error) {
      console.error("Error removing income:", error);
      throw error;
    }
  };

  const addExpenseCategory = async (newCategory) => {
    if (!currentUser) throw new Error("User not authenticated");

    try {
      const userCategoriesRef = doc(db, "userCategories", currentUser.uid);
      const userCategoriesDoc = await getDoc(userCategoriesRef);

      let updatedCategories;
      if (userCategoriesDoc.exists()) {
        const currentCategories =
          userCategoriesDoc.data().expenseCategories || [];
        updatedCategories = [...currentCategories, newCategory];

        await updateDoc(userCategoriesRef, {
          expenseCategories: updatedCategories,
        });
      } else {
        updatedCategories = [newCategory];
        await setDoc(userCategoriesRef, {
          expenseCategories: updatedCategories,
          incomeCategories: incomeCategories,
          userId: currentUser.uid,
          createdAt: serverTimestamp(),
        });
      }

      setExpenseCategories(updatedCategories);
    } catch (error) {
      console.error("Error adding expense category:", error);
      throw error;
    }
  };

  const removeExpenseCategory = async (categoryToRemove) => {
    if (!currentUser) throw new Error("User not authenticated");

    try {
      const userCategoriesRef = doc(db, "userCategories", currentUser.uid);
      const userCategoriesDoc = await getDoc(userCategoriesRef);

      if (userCategoriesDoc.exists()) {
        const currentCategories =
          userCategoriesDoc.data().expenseCategories || [];
        const updatedCategories = currentCategories.filter(
          (category) => category !== categoryToRemove
        );

        await updateDoc(userCategoriesRef, {
          expenseCategories: updatedCategories,
        });

        setExpenseCategories(updatedCategories);
      }
    } catch (error) {
      console.error("Error removing expense category:", error);
      throw error;
    }
  };

  const addIncomeCategory = async (newCategory) => {
    if (!currentUser) throw new Error("User not authenticated");

    try {
      const userCategoriesRef = doc(db, "userCategories", currentUser.uid);
      const userCategoriesDoc = await getDoc(userCategoriesRef);

      let updatedCategories;
      if (userCategoriesDoc.exists()) {
        const currentCategories =
          userCategoriesDoc.data().incomeCategories || [];
        updatedCategories = [...currentCategories, newCategory];

        await updateDoc(userCategoriesRef, {
          incomeCategories: updatedCategories,
        });
      } else {
        updatedCategories = [newCategory];
        await setDoc(userCategoriesRef, {
          expenseCategories: expenseCategories,
          incomeCategories: updatedCategories,
          userId: currentUser.uid,
          createdAt: serverTimestamp(),
        });
      }

      setIncomeCategories(updatedCategories);
    } catch (error) {
      console.error("Error adding income category:", error);
      throw error;
    }
  };

  const removeIncomeCategory = async (categoryToRemove) => {
    if (!currentUser) throw new Error("User not authenticated");

    try {
      const userCategoriesRef = doc(db, "userCategories", currentUser.uid);
      const userCategoriesDoc = await getDoc(userCategoriesRef);

      if (userCategoriesDoc.exists()) {
        const currentCategories =
          userCategoriesDoc.data().incomeCategories || [];
        const updatedCategories = currentCategories.filter(
          (category) => category !== categoryToRemove
        );

        await updateDoc(userCategoriesRef, {
          incomeCategories: updatedCategories,
        });

        setIncomeCategories(updatedCategories);
      }
    } catch (error) {
      console.error("Error removing income category:", error);
      throw error;
    }
  };

  const value = {
    expenses,
    incomes,
    budgets,
    expenseCategories,
    incomeCategories,
    addExpense,
    addIncome,
    removeExpense,
    removeIncome,
    addBudget,
    updateBudget,
    removeBudget,
    addExpenseCategory,
    removeExpenseCategory,
    addIncomeCategory,
    removeIncomeCategory,
  };

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
}
