import { useState } from 'react';
import CustomButton from './CustomButton';
import { FileText, Download, Star, Edit, Trash2, Eye, X, Lock } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { usePremium } from '../../hooks/usePremium';

const TemplateCard = ({ template, showActions = false, onEdit, onDelete }) => {
  const location = useLocation();
  const isAdminSection = location.pathname.startsWith('/admin');
  const [showPreview, setShowPreview] = useState(false);
  const { hasAccess } = usePremium();

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

        {/* Footer Section */}
        <div className="space-y-3">
          {/* File Type */}
          <div className="text-xs sm:text-sm text-muted-foreground">
            {template.file_type?.split('/')[1]?.toUpperCase() || 'Unknown'}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
            <CustomButton
              variant="outline"
              size="sm"
              onClick={handlePreview}
              className="w-full"
            >
              <Eye className="h-4 w-4 sm:mr-2" />
              <span>Preview</span>
            </CustomButton>
            <CustomButton
              variant="default"
              size="sm"
              onClick={handleDownload}
              className="w-full bg-primary hover:bg-primary/90 transition-colors"
              disabled={!hasAccess(template)}
            >
              <Download className="h-4 w-4 sm:mr-2" />
              <span>Download</span>
            </CustomButton>
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
              {template.is_premium && (
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
                className={`w-full h-full border-0 ${template.is_premium ? 'pointer-events-none' : ''}`}
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
              <CustomButton
                variant="default"
                size="sm"
                onClick={handleDownload}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 transition-colors"
                disabled={!hasAccess(template)}
              >
                <Download className="h-4 w-4 mr-2" />
                <span>{template.is_premium ? 'Upgrade to Download' : 'Download Template'}</span>
              </CustomButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TemplateCard;