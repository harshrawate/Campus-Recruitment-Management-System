import { useQuery } from "@tanstack/react-query";
import { formsAPI } from "../../services/api";
import { useParams } from "react-router-dom";

export const ResponsesList = () => {
  const { id } = useParams();
  const { data: responses, isLoading } = useQuery({
    queryKey: ["responses", id],
    queryFn: () => formsAPI.getResponses(id),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {responses.map((response) => (
        <div key={response._id} className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">
            Response submitted at{" "}
            {new Date(response.submittedAt).toLocaleString()}
          </h3>
          {response.answers.map((answer) => (
            <div key={answer.questionId} className="mb-4">
              <p className="font-medium">{answer.question}</p>
              <p className="text-gray-600">{answer.answer}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
