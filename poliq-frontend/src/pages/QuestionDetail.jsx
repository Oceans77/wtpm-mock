// src/pages/QuestionDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import Button from '../components/Button';
import VoteButton from '../components/VoteButton';
import AnimatedVoteCounter from '../components/AnimatedVoteCounter';
import Tooltip from '../components/Tooltip';

// Comment component
const Comment = ({ comment, onReply, currentUser, depth = 0 }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const maxDepth = 3; // Maximum nesting level
  
  // Format date to readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className={`${depth > 0 ? 'ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-start space-x-3">
          {/* User avatar */}
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-lg">
            {comment.author.displayName.charAt(0)}
          </div>
          
          <div className="flex-1">
            {/* Comment header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="font-medium text-gray-900 dark:text-white">
                  {comment.author.displayName}
                </span>
                {comment.author.isVerified && (
                  <Tooltip text="Verified User">
                    <span className="ml-1 text-blue-500 dark:text-blue-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </Tooltip>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              
              <div className="flex items-center">
                <button className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Comment content */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
            </div>
            
            {/* Comment actions */}
            <div className="mt-3 flex items-center text-sm">
              <button 
                className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mr-4 flex items-center"
                onClick={() => {
                  if (depth < maxDepth) {
                    setShowReplyForm(!showReplyForm);
                  } else {
                    toast.error("Maximum reply depth reached");
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Reply
              </button>
              
              <button className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 flex items-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                {comment.upvotes}
              </button>
              
              <button className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {comment.downvotes}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reply form */}
      {showReplyForm && (
        <div className="mb-4 ml-6">
          <CommentForm 
            onSubmit={(content) => {
              onReply(comment.id, content);
              setShowReplyForm(false);
            }}
            autoFocus={true}
            placeholder={`Reply to ${comment.author.displayName}...`}
            buttonText="Reply"
          />
        </div>
      )}
      
      {/* Display replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map(reply => (
            <Comment 
              key={reply.id} 
              comment={reply} 
              onReply={onReply} 
              currentUser={currentUser}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Comment form component
const CommentForm = ({ onSubmit, autoFocus = false, placeholder = "Add a comment...", buttonText = "Comment" }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useSelector(state => state.auth);
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('You must be logged in to comment');
      navigate('/login');
      return;
    }
    
    if (!content.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate submission delay
    setTimeout(() => {
      onSubmit(content);
      setContent('');
      setIsSubmitting(false);
    }, 500);
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <textarea
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   transition-colors"
        rows="3"
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        autoFocus={autoFocus}
      ></textarea>
      
      <div className="flex justify-end mt-3">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isSubmitting}
          disabled={isSubmitting || !content.trim()}
        >
          {buttonText}
        </Button>
      </div>
    </form>
  );
};

// Main QuestionDetail component
const QuestionDetail = () => {
  const { questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  useEffect(() => {
    // Simulate loading the question and comments
    setIsLoading(true);
    
    setTimeout(() => {
      // Mock data
      const mockQuestion = {
        id: questionId || '1',
        content: "Why hasn't Congress addressed the rising cost of healthcare for middle-class Americans?",
        categories: ["Healthcare", "Federal"],
        votes: 4382,
        comments: 243,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
      };
      
      const mockComments = [
        {
          id: '1',
          content: "I believe the primary reason is lobbyist influence from the healthcare and pharmaceutical industries. According to data from OpenSecrets, these industries spent over $600 million on lobbying in 2020 alone.",
          author: {
            id: 'user1',
            displayName: 'PolicyAnalyst',
            isVerified: true
          },
          upvotes: 152,
          downvotes: 12,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36), // 36 hours ago
          replies: [
            {
              id: '1-1',
              content: "While lobbying is a factor, I think it's also about the complexity of healthcare policy. Any significant reform affects so many stakeholders that building consensus becomes extremely difficult.",
              author: {
                id: 'user2',
                displayName: 'HealthcareExpert',
                isVerified: true
              },
              upvotes: 87,
              downvotes: 5,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24 hours ago
              replies: []
            },
            {
              id: '1-2',
              content: "I agree about the lobbying influence, but we should also acknowledge the partisan gridlock in Congress that makes compromise on major issues nearly impossible.",
              author: {
                id: 'user3',
                displayName: 'PoliticalScientist',
                isVerified: false
              },
              upvotes: 64,
              downvotes: 8,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18 hours ago
              replies: []
            }
          ]
        },
        {
          id: '2',
          content: "It's important to note that there have been attempts to address healthcare costs, such as the Affordable Care Act. However, the results have been mixed, with some middle-class families seeing increased premiums while others benefited from expanded coverage.",
          author: {
            id: 'user4',
            displayName: 'HealthPolicyResearcher',
            isVerified: true
          },
          upvotes: 106,
          downvotes: 23,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30), // 30 hours ago
          replies: []
        },
        {
          id: '3',
          content: "As someone directly affected by rising healthcare costs, I've seen my family's premiums triple in the last decade while our coverage has gotten worse. We need action, not more debate.",
          author: {
            id: 'user5',
            displayName: 'ConcernedCitizen',
            isVerified: false
          },
          upvotes: 218,
          downvotes: 4,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
          replies: []
        }
      ];
      
      setQuestion(mockQuestion);
      setComments(mockComments);
      setIsLoading(false);
    }, 1000);
  }, [questionId]);
  
  const handleAddComment = (content) => {
    // Create new comment
    const newComment = {
      id: `new-${Date.now()}`,
      content,
      author: {
        id: user?.id || 'current-user',
        displayName: user?.displayName || user?.username || 'Current User',
        isVerified: user?.verificationStatus === 'verified'
      },
      upvotes: 1, // Self upvote
      downvotes: 0,
      createdAt: new Date(),
      replies: []
    };
    
    // Add to comments list
    setComments([newComment, ...comments]);
    
    // Show success message
    toast.success('Comment added successfully');
  };
  
  const handleAddReply = (commentId, content) => {
    // Create new reply
    const newReply = {
      id: `reply-${Date.now()}`,
      content,
      author: {
        id: user?.id || 'current-user',
        displayName: user?.displayName || user?.username || 'Current User',
        isVerified: user?.verificationStatus === 'verified'
      },
      upvotes: 1, // Self upvote
      downvotes: 0,
      createdAt: new Date(),
      replies: []
    };
    
    // Find and update the parent comment or nested reply
    const findAndAddReply = (comments) => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [newReply, ...(comment.replies || [])]
          };
        } else if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: findAndAddReply(comment.replies)
          };
        }
        return comment;
      });
    };
    
    const updatedComments = findAndAddReply(comments);
    setComments(updatedComments);
    
    // Show success message
    toast.success('Reply added successfully');
  };
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4 mb-6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-1/4 mb-3"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-full mb-8"></div>
          
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full mb-8"></div>
          
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-full w-1/3 mb-3"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded-full w-full mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded-full w-full mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded-full w-1/2 mb-2"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-full w-1/4 mb-3"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded-full w-full mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded-full w-3/4 mb-2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-5 rounded-xl text-red-700 dark:text-red-300">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold mb-1">Error Loading Question</h3>
              <p>{error}</p>
              <Button 
                variant="outlined"
                size="sm"
                className="mt-3"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!question) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Question not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The question you're looking for doesn't exist or has been removed.</p>
          <Link to="/questions" className="text-blue-600 dark:text-blue-400 hover:underline">
            Return to all questions
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Question content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {question.categories.map(category => (
            <span 
              key={category}
              className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2.5 py-1 rounded-full"
            >
              {category}
            </span>
          ))}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{question.content}</h1>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            Asked {new Date(question.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', month: 'short', day: 'numeric' 
            })}
          </span>
        </div>
        
        <div className="flex items-center">
          <div className="flex items-center mr-6">
            <VoteButton questionId={question.id} currentVotes={question.votes} />
            <AnimatedVoteCounter votes={question.votes} />
          </div>
          
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-gray-600 dark:text-gray-300">{comments.length} comments</span>
          </div>
        </div>
      </div>
      
      {/* Comment form */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add a Comment</h2>
        <CommentForm onSubmit={handleAddComment} />
      </div>
      
      {/* Comments section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Comments ({comments.length})
        </h2>
        
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map(comment => (
              <Comment 
                key={comment.id} 
                comment={comment} 
                onReply={handleAddReply}
                currentUser={user}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">No comments yet. Be the first to add one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetail;
