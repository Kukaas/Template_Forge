import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CustomCard,
  CustomCardHeader,
  CustomCardTitle,
  CustomCardDescription,
  CustomCardContent,
  CustomBadge,
  CustomButton,
  TemplateCard
} from '../components/custom-components';
import {
  Plus,
  FileText,
  Settings,
  Clock,
  Bookmark,
  Copy
} from 'lucide-react';

const Dashboard = () => {
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [copiedTemplates, setCopiedTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSavedTemplates = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/templates/saved`,
        { credentials: 'include' }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch saved templates');
      }
      const data = await response.json();
      setSavedTemplates(data.data || []);
    } catch (error) {
      console.error('Error fetching saved templates:', error);
      setSavedTemplates([]);
    }
  };

  const fetchCopiedTemplates = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/templates/copies`,
        { credentials: 'include' }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch copied templates');
      }
      const data = await response.json();
      setCopiedTemplates(data.data || []);
    } catch (error) {
      console.error('Error fetching copied templates:', error);
      setCopiedTemplates([]);
    }
  };

  useEffect(() => {
    Promise.all([fetchSavedTemplates(), fetchCopiedTemplates()])
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome to your personalized dashboard.</p>
        </div>
        <CustomButton
          variant="gradient"
          size="lg"
          onClick={() => navigate('/templates')}
          className="cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-1" /> Browse Templates
        </CustomButton>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CustomCard hover onClick={() => navigate('/templates/saved')} className="cursor-pointer">
          <CustomCardHeader>
            <Bookmark className="h-8 w-8 text-primary mb-2" />
            <CustomCardTitle>Saved Templates</CustomCardTitle>
            <CustomCardDescription>Your saved templates</CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">{savedTemplates?.length || 0}</span>
              <CustomBadge variant="secondary">Saved</CustomBadge>
            </div>
          </CustomCardContent>
        </CustomCard>

        <CustomCard hover onClick={() => navigate('/copied-templates')} className="cursor-pointer">
          <CustomCardHeader>
            <Copy className="h-8 w-8 text-primary mb-2" />
            <CustomCardTitle>Copied Templates</CustomCardTitle>
            <CustomCardDescription>Your customized copies</CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">{copiedTemplates?.length || 0}</span>
              <CustomBadge variant="secondary">Copies</CustomBadge>
            </div>
          </CustomCardContent>
        </CustomCard>

        <CustomCard hover>
          <CustomCardHeader>
            <FileText className="h-8 w-8 text-primary mb-2" />
            <CustomCardTitle>Templates</CustomCardTitle>
            <CustomCardDescription>Manage your templates</CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">12</span>
              <CustomBadge variant="success">Active</CustomBadge>
            </div>
          </CustomCardContent>
        </CustomCard>

        <CustomCard hover>
          <CustomCardHeader>
            <Clock className="h-8 w-8 text-primary mb-2" />
            <CustomCardTitle>Recent Activity</CustomCardTitle>
            <CustomCardDescription>Your latest actions</CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Template updated - 2h ago</p>
              <p className="text-sm text-muted-foreground">New template created - 5h ago</p>
            </div>
          </CustomCardContent>
        </CustomCard>

        <CustomCard hover>
          <CustomCardHeader>
            <Settings className="h-8 w-8 text-primary mb-2" />
            <CustomCardTitle>Settings</CustomCardTitle>
            <CustomCardDescription>Configure your workspace</CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent>
            <div className="space-y-2">
              <CustomBadge variant="secondary">Pro Plan</CustomBadge>
            </div>
          </CustomCardContent>
        </CustomCard>
      </div>

      {/* Saved Templates Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold">Your Saved Templates</h3>
          {savedTemplates.length > 0 && (
            <CustomButton
              variant="outline"
              size="sm"
              onClick={() => navigate('/templates/saved')}
            >
              View All
            </CustomButton>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : savedTemplates.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savedTemplates.slice(0, 3).map(template => (
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
            <div className="mt-4">
              <CustomButton
                variant="outline"
                size="sm"
                onClick={() => navigate('/templates')}
              >
                Browse Templates
              </CustomButton>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold">Your Copied Templates</h3>
          {copiedTemplates.length > 0 && (
            <CustomButton
              variant="outline"
              size="sm"
              onClick={() => navigate('/copied-templates')}
            >
              View All
            </CustomButton>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : copiedTemplates.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {copiedTemplates.slice(0, 3).map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                isCopy={true}
                onEdit={() => navigate(`/editor/${template.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            You haven't copied any templates yet.
            <div className="mt-4">
              <CustomButton
                variant="outline"
                size="sm"
                onClick={() => navigate('/templates')}
              >
                Browse Templates
              </CustomButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;