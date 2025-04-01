import { useState, useEffect } from 'react';
import { TemplateCard } from '../components/custom-components';
import { toast } from 'sonner';

const SavedTemplates = () => {
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSavedTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/templates/saved`,
        {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch saved templates');
      }

      const data = await response.json();
      setSavedTemplates(data.data || []);
    } catch (error) {
      console.error('Error fetching saved templates:', error);
      setError(error.message);
      toast.error('Failed to load saved templates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedTemplates();
  }, []);

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Saved Templates</h2>
        <p className="text-muted-foreground">Access your saved templates here.</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : savedTemplates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {savedTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onSaveStatusChange={fetchSavedTemplates}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          You haven't saved any templates yet.
        </div>
      )}
    </div>
  );
};

export default SavedTemplates;