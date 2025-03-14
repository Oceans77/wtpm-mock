import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Questions = () => {
  const { questions, isLoading, error } = useSelector(state => state.questions);
  const { isAuthenticated } = useSelector(state => state.auth);
  
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2">Loading questions...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 p-4 rounded-lg text-red-700">
          Error: {error}
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Trending Questions</h1>
        {isAuthenticated && (
          <Link to="/questions/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Ask a Question
          </Link>
        )}
      </div>
      
      <div className="space-y-4">
        {questions.map(question => (
          <div key={question.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex flex-wrap gap-2 mb-2">
              {question.categories.map(category => (
                <span key={category} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {category}
                </span>
              ))}
            </div>
            <h2 className="text-xl font-bold">{question.content}</h2>
            <div className="mt-2 text-sm text-gray-500">
              <span className="mr-4">{question.votes.toLocaleString()} votes</span>
              <span>{question.comments} comments</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Questions;
