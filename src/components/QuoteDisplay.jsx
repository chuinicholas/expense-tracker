import { useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";

// Predefined quotes about money and financial wisdom
const quotes = [
  {
    text: "A penny saved is a penny earned.",
    author: "Benjamin Franklin",
  },
  {
    text: "The habit of saving is itself an education; it fosters every virtue, teaches self-denial, cultivates the sense of order.",
    author: "T.T. Munger",
  },
  {
    text: "Don't tell me what you value, show me your budget, and I'll tell you what you value.",
    author: "Joe Biden",
  },
  {
    text: "The price of anything is the amount of life you exchange for it.",
    author: "Henry David Thoreau",
  },
  {
    text: "Money is only a tool. It will take you wherever you wish, but it will not replace you as the driver.",
    author: "Ayn Rand",
  },
  {
    text: "Financial peace isn't the acquisition of stuff. It's learning to live on less than you make.",
    author: "Dave Ramsey",
  },
  {
    text: "Never spend your money before you have earned it.",
    author: "Thomas Jefferson",
  },
  {
    text: "The more you learn, the more you earn.",
    author: "Warren Buffett",
  },
  {
    text: "It's not how much money you make, but how much money you keep.",
    author: "Robert Kiyosaki",
  },
  {
    text: "Beware of little expenses; a small leak will sink a great ship.",
    author: "Benjamin Franklin",
  },
  {
    text: "An investment in knowledge pays the best interest.",
    author: "Benjamin Franklin",
  },
  {
    text: "The stock market is filled with individuals who know the price of everything, but the value of nothing.",
    author: "Phillip Fisher",
  },
  {
    text: "Time is more valuable than money. You can get more money, but you cannot get more time.",
    author: "Jim Rohn",
  },
  {
    text: "The goal isn't more money. The goal is living life on your terms.",
    author: "Chris Brogan",
  },
  {
    text: "Money is a terrible master but an excellent servant.",
    author: "P.T. Barnum",
  },
  {
    text: "The best way to predict the future is to create it.",
    author: "Peter Drucker",
  },
  {
    text: "Wealth is not about having a lot of money; it's about having a lot of options.",
    author: "Chris Rock",
  },
  {
    text: "It's not your salary that makes you rich, it's your spending habits.",
    author: "Charles A. Jaffe",
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  {
    text: "The best investment you can make is in yourself.",
    author: "Warren Buffett",
  },
  {
    text: "Don't work for money; make money work for you.",
    author: "Robert Kiyosaki",
  },
  {
    text: "The art is not in making money, but in keeping it.",
    author: "Proverb",
  },
  {
    text: "Opportunities don't happen. You create them.",
    author: "Chris Grosser",
  },
  {
    text: "The greatest wealth is to live content with little.",
    author: "Plato",
  },
  {
    text: "Money grows on the tree of persistence.",
    author: "Japanese Proverb",
  },
  {
    text: "The harder you work for your money, the harder your money should work for you.",
    author: "Anonymous",
  },
  {
    text: "Wealth consists not in having great possessions, but in having few wants.",
    author: "Epictetus",
  },
  {
    text: "The question isn't who's going to let me; it's who is going to stop me.",
    author: "Ayn Rand",
  },
  {
    text: "Your future is created by what you do today, not tomorrow.",
    author: "Robert Kiyosaki",
  },
  {
    text: "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt",
  },
  {
    text: "Do not save what is left after spending, but spend what is left after saving.",
    author: "Warren Buffett",
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
  },
  {
    text: "Money is multiplied in practical value depending on the number of W's you control in your life: what you do, when you do it, where you do it, and with whom you do it.",
    author: "Timothy Ferriss",
  },
  {
    text: "The individual investor should act consistently as an investor and not as a speculator.",
    author: "Ben Graham",
  },
  {
    text: "Success is walking from failure to failure with no loss of enthusiasm.",
    author: "Winston Churchill",
  },
  {
    text: "Twenty years from now you will be more disappointed by the things you didn't do than by the ones you did.",
    author: "Mark Twain",
  },
  {
    text: "The secret to getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    text: "Formal education will make you a living; self-education will make you a fortune.",
    author: "Jim Rohn",
  },
  {
    text: "Money is a great servant but a bad master.",
    author: "Francis Bacon",
  },
  {
    text: "The most difficult thing is the decision to act, the rest is merely tenacity.",
    author: "Amelia Earhart",
  },
  {
    text: "You must gain control over your money or the lack of it will forever control you.",
    author: "Dave Ramsey",
  },
  {
    text: "It's not about perfect. It's about effort.",
    author: "Jillian Michaels",
  },
  {
    text: "Small progress is still progress.",
    author: "Anonymous",
  },
  {
    text: "The journey of a thousand miles begins with one step.",
    author: "Lao Tzu",
  },
  {
    text: "Don't let yesterday take up too much of today.",
    author: "Will Rogers",
  },
  {
    text: "Invest in yourself. Your career is the engine of your wealth.",
    author: "Paul Clitheroe",
  },
  {
    text: "The only way to get what you want is to work for it.",
    author: "Anonymous",
  },
  {
    text: "Success usually comes to those who are too busy to be looking for it.",
    author: "Henry David Thoreau",
  },
  {
    text: "The difference between successful people and very successful people is that very successful people say no to almost everything.",
    author: "Warren Buffett",
  },
  {
    text: "You don't have to see the whole staircase, just take the first step.",
    author: "Martin Luther King, Jr.",
  },
  {
    text: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson",
  },
  {
    text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: "Mahatma Gandhi",
  },
  {
    text: "The future depends on what you do today.",
    author: "Mahatma Gandhi",
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  {
    text: "Success is not the key to happiness. Happiness is the key to success.",
    author: "Albert Schweitzer",
  },
  {
    text: "The best revenge is massive success.",
    author: "Frank Sinatra",
  },
  {
    text: "What seems to us as bitter trials are often blessings in disguise.",
    author: "Oscar Wilde",
  },
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
  },
  {
    text: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs",
  },
  {
    text: "Everything you've ever wanted is on the other side of fear.",
    author: "George Addair",
  },
];

export default function QuoteDisplay() {
  const [quote, setQuote] = useState(
    quotes[Math.floor(Math.random() * quotes.length)]
  );

  const changeQuote = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * quotes.length);
    } while (quotes[newIndex].text === quote.text);
    setQuote(quotes[newIndex]);
  };

  return (
    <Paper
      elevation={0}
      onClick={changeQuote}
      sx={{
        p: 2,
        mb: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        border: "none",
        boxShadow: "none",
        cursor: "pointer",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "scale(1.01)",
        },
      }}
    >
      <Box
        sx={{
          maxWidth: "800px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FormatQuoteIcon
            sx={{
              transform: "rotate(180deg)",
              color: "primary.light",
              fontSize: "1.5rem",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontStyle: "italic",
              color: "text.primary",
              fontWeight: 500,
            }}
          >
            {quote.text}
          </Typography>
          <FormatQuoteIcon
            sx={{
              color: "primary.light",
              fontSize: "1.5rem",
            }}
          />
        </Box>
        <Typography
          variant="subtitle2"
          sx={{
            color: "text.secondary",
            fontWeight: 500,
          }}
        >
          — {quote.author}
        </Typography>
      </Box>
    </Paper>
  );
}
