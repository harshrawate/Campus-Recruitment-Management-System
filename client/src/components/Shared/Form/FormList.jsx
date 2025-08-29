import { useQuery } from "@tanstack/react-query";
import { formsAPI } from "../../services/api";
import { Link } from "react-router-dom";

export const FormsList = () => {
  const { data: forms, isLoading } = useQuery({
    queryKey: ["forms"],
    queryFn: formsAPI.getForms,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {forms.map((form) => (
        <div key={form._id} className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold">{form.title}</h3>
          <p className="text-gray-600 mt-2">{form.description}</p>
          <div className="mt-4 flex space-x-4">
            <Link
              to={`/forms/${form._id}`}
              className="text-purple-600 hover:text-purple-700"
            >
              Edit
            </Link>
            <Link
              to={`/forms/${form._id}/responses`}
              className="text-blue-600 hover:text-blue-700"
            >
              View Responses
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};
