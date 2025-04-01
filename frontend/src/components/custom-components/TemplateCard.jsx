import { useState, useEffect } from 'react';
import CustomButton from './CustomButton';
import { FileText, Download, Star, Edit, Trash2, Eye, X, Lock, Copy } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { usePremium } from '../../hooks/usePremium';
import { useAuth } from '../../lib/auth';
import ConfirmationDialog from './ConfirmationDialog';

const TemplateCard = ({ template, showActions = false, onEdit, onDelete, onSaveStatusChange }) => {
  const location = useLocation();
  const isAdminSection = location.pathname.startsWith('/admin');
  const [showPreview, setShowPreview] = useState(false);
  const { hasAccess } = usePremium();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showUnsaveConfirmation, setShowUnsaveConfirmation] = useState(false);
  const { user } = useAuth();

  // Add this debug log
  console.log({
    isPremiumTemplate: template.is_premium,
    hasAccess: hasAccess(template),
    template: template
  });

  // Check if template is saved on mount
  useEffect(() => {
    checkSavedStatus();
  }, [template.id]);

  const checkSavedStatus = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/templates/${template.id}/saved`,
        { credentials: 'include' }
      );
      const data = await response.json();
      setIsSaved(data.data.isSaved);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleSaveClick = async () => {
    if (isSaved) {
      setShowUnsaveConfirmation(true);
    } else {
      await handleSaveAction();
    }
  };

  const handleSaveAction = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      const method = isSaved ? 'DELETE' : 'POST';
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/templates/${template.id}/save`,
        {
          method,
          credentials: 'include',
        }
      );

      if (!response.ok) throw new Error('Failed to save template');

      setIsSaved(!isSaved);
      toast.success(isSaved ? 'Template removed from saved items' : 'Template saved successfully');
      if (onSaveStatusChange) onSaveStatusChange();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setIsLoading(false);
      setShowUnsaveConfirmation(false);
    }
  };

  const handleDownload = async () => {
    if (!hasAccess(template)) {
      toast.error('This is a premium template. Please upgrade your account to access it.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/${template.id}/download`, {
        credentials: 'include',
      });

      if (response.status === 403) {
        toast.error('This is a premium template. Please upgrade your account to access it.');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      // Get the filename from the Content-Disposition header or use a default
      const contentDisposition = response.headers.get('Content-Disposition');
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : template.file_name;

      // Create a blob from the response
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL
      window.URL.revokeObjectURL(url);

      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  };

  const handlePreview = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/${template.id}/preview`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load preview');
      }

      setShowPreview(true);
    } catch (error) {
      console.error('Error loading preview:', error);
      toast.error('Failed to load preview');
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const handleEditCopy = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (template.is_premium && !hasAccess(template)) {
      toast.error('This is a premium template. Please upgrade your account to edit.');
      navigate('/pricing');
      return;
    }

    try {
      // Create a copy of the template for the user
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/templates/${template.id}/copy`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create template copy');
      }

      const data = await response.json();
      toast.success('Template copy created successfully');
      // Navigate to editor with the new copy's ID
      navigate(`/editor/${data.data.id}`);
    } catch (error) {
      console.error('Error creating template copy:', error);
      toast.error('Failed to create template copy');
    }
  };

  return (
    <>
      <div className="group relative border rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-200 bg-card">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg line-clamp-1">{template.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{template.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Download className="h-4 w-4" />
              <span>{template.downloads}</span>
            </div>
            {template.is_premium && (
              <div className="flex items-center gap-1 text-primary">
                <Lock className="h-4 w-4" />
                <span className="text-xs hidden sm:inline">Premium</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {template.description}
        </p>

        {/* Footer Section with improved responsive layout */}
        <div className="space-y-3">
          {/* File Type */}
          <div className="text-xs sm:text-sm text-muted-foreground">
            {template.file_type?.split('/')[1]?.toUpperCase() || 'Unknown'}
          </div>

          {/* Action Buttons with improved grid layout */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {/* Preview Button - Always visible */}
            <CustomButton
              variant="outline"
              size="sm"
              onClick={handlePreview}
              className="w-full col-span-2 sm:col-span-1"
            >
              <Eye className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Preview</span>
            </CustomButton>

            {/* Save/Unsave Button */}
            <CustomButton
              variant="outline"
              size="sm"
              onClick={handleSaveClick}
              className={`w-full ${isSaved ? 'bg-primary/10' : ''}`}
              disabled={isLoading}
            >
              <Star className={`h-4 w-4 sm:mr-2 ${isSaved ? 'fill-primary' : ''}`} />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </CustomButton>

            {/* Edit Copy Button - Only show if saved */}
            {isSaved && (
              <CustomButton
                variant="outline"
                size="sm"
                onClick={handleEditCopy}
                className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Copy className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Edit Copy</span>
              </CustomButton>
            )}

            {/* Download or Premium Button */}
            {template.is_premium && !hasAccess(template) ? (
              <CustomButton
                variant="gradient"
                size="sm"
                onClick={handleUpgrade}
                className="w-full"
              >
                <Lock className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Premium</span>
              </CustomButton>
            ) : (
              <CustomButton
                variant="default"
                size="sm"
                onClick={handleDownload}
                className="w-full bg-primary hover:bg-primary/90 transition-colors"
              >
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Download</span>
              </CustomButton>
            )}

            {/* Admin Actions - Only show in admin section */}
            {showActions && isAdminSection && (
              <>
                <CustomButton
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="text-primary hover:text-primary/80 hover:bg-primary/5 transition-colors"
                >
                  <Edit className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Edit</span>
                </CustomButton>
                <CustomButton
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Delete</span>
                </CustomButton>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[95vw] sm:max-w-5xl h-[95vh] sm:h-[90vh] p-0 overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-base sm:text-lg font-semibold truncate">{template.title}</DialogTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{template.category}</p>
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-hidden bg-muted/5 relative">
              {template.is_premium && !hasAccess(template) && (
                <div className="absolute inset-0 z-10 pointer-events-none">
                  <div
                    className="w-full h-full"
                    style={{
                      background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.5) 70%, rgba(255,255,255,0.95) 100%)',
                      backdropFilter: 'blur(3px)',
                    }}
                  />
                  <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-lg shadow-lg">
                    🔒 Upgrade to Premium to Access Full Template
                  </div>
                </div>
              )}
              <iframe
                src={`${import.meta.env.VITE_API_URL}/api/templates/${template.id}/preview`}
                className={`w-full h-full border-0 ${template.is_premium && !hasAccess(template) ? 'pointer-events-none' : ''}`}
                title={`Preview of ${template.title}`}
              />
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-t bg-background">
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>{template.downloads} downloads</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{template.file_type?.split('/')[1]?.toUpperCase() || 'Unknown'}</span>
                </div>
                {template.is_premium && (
                  <div className="flex items-center gap-1 text-primary">
                    <Lock className="h-4 w-4" />
                    <span>Premium Template</span>
                  </div>
                )}
              </div>
              {template.is_premium && !hasAccess(template) ? (
                <CustomButton
                  variant="gradient"
                  size="sm"
                  onClick={handleUpgrade}
                  className="w-full sm:w-auto"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  <span>Upgrade to Premium</span>
                </CustomButton>
              ) : (
                <CustomButton
                  variant="default"
                  size="sm"
                  onClick={handleDownload}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  <span>Download Template</span>
                </CustomButton>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unsave Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showUnsaveConfirmation}
        onClose={() => setShowUnsaveConfirmation(false)}
        onConfirm={handleSaveAction}
        title="Remove from Saved"
        description="Are you sure you want to remove this template from your saved items?"
        cancelText="Cancel"
        confirmText="Remove"
        isLoading={isLoading}
        variant="danger"
      />
    </>
  );
};

export default TemplateCard;