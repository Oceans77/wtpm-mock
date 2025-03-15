// src/components/VoteButton.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { castVote, unvote } from '../store/votesSlice';
import { updateQuestionVotes } from '../store/questionsSlice';
import { toast } from 'react-hot-toast';
import Tooltip from './Tooltip';

const VoteButton = ({ questionId, currentVotes }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  const { userVotes, isVoting } = useSelector(state => state.votes);
  
  // Check if user has already voted on this question
  const userVoteType = userVotes[questionId];
  const hasVoted = !!userVoteType;
  
  // Local state for optimistic UI updates
  const [isHovered, setIsHovered] = useState(false);
  
  const handleVote = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error('You must be logged in to vote');
      return;
    }
    
    // If already voting, do nothing
    if (isVoting) return;
    
    // Simplified approach without using unwrap() which might be causing issues
    if (hasVoted) {
      // Remove the vote
      dispatch(unvote(questionId))
        .then(() => {
          // Update UI optimistically
          dispatch(updateQuestionVotes({
            questionId,
            newVoteCount: currentVotes - 1
          }));
          toast.success('Vote removed');
        })
        .catch(() => {
          toast.error('Failed to remove vote');
        });
    } else {
      // Cast a new vote
      dispatch(castVote({ questionId, voteType: 'upvote' }))
        .then(() => {
          // Update UI optimistically
          dispatch(updateQuestionVotes({
            questionId,
            newVoteCount: currentVotes + 1
          }));
          toast.success('Vote added');
        })
        .catch(() => {
          toast.error('Failed to add vote');
        });
    }
  };
  
  return (
    <Tooltip text={hasVoted ? "Remove your vote" : "Upvote this question"}>
      <button
        className={`flex items-center justify-center rounded-full p-2 transition-all duration-200
          ${isVoting ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
          ${hasVoted 
            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
            : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
          }
          ${isHovered && !hasVoted ? 'transform scale-110' : ''}
        `}
        onClick={handleVote}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isVoting}
        aria-label={hasVoted ? "Remove vote" : "Upvote"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 ${isHovered && !hasVoted ? 'transform -translate-y-0.5' : ''}`} fill={hasVoted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={hasVoted ? 0 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </Tooltip>
  );
};

export default VoteButton;
