// src/components/AnimatedVoteCounter.jsx
import { useState, useEffect, useRef } from 'react';

const AnimatedVoteCounter = ({ votes, showAnimation = true }) => {
  const [displayCount, setDisplayCount] = useState(votes);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevVotes = useRef(votes);
  
  useEffect(() => {
    // Only animate if votes changed and we want to show animations
    if (votes !== prevVotes.current && showAnimation) {
      // Determine if it's an upvote or downvote
      const isUpvote = votes > prevVotes.current;
      
      // Start animation
      setIsAnimating(true);
      
      // If we're transitioning between two numbers, we can animate the count
      if (Math.abs(votes - prevVotes.current) < 10) {
        // For small changes, animate counting up/down
        const interval = setInterval(() => {
          setDisplayCount(prev => {
            if ((isUpvote && prev < votes) || (!isUpvote && prev > votes)) {
              return isUpvote ? prev + 1 : prev - 1;
            } else {
              clearInterval(interval);
              return votes;
            }
          });
        }, 50);
        
        return () => clearInterval(interval);
      } else {
        // For large changes, just set the new value
        setDisplayCount(votes);
      }
      
      // End animation after duration
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 400);
      
      return () => clearTimeout(timer);
    } else {
      // If not animating, just update the display
      setDisplayCount(votes);
    }
    
    // Update ref for next comparison
    prevVotes.current = votes;
  }, [votes, showAnimation]);
  
  return (
    <span className={`inline-flex items-center transition-colors ${isAnimating ? 'vote-count-change' : ''}`}>
      <span className={`mr-1 ${isAnimating ? (votes > prevVotes.current ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400') : ''}`}>
        {displayCount.toLocaleString()}
      </span>
      <span>votes</span>
    </span>
  );
};

export default AnimatedVoteCounter;

// Usage:
// <AnimatedVoteCounter votes={question.votes} />
