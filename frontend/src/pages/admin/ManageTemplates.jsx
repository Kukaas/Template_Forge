import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomButton, CustomBadge, TemplateCard } from '../../components/custom-components';
import { Search, Plus, X } from 'lucide-react';
import TemplateForm from '../../components/forms/TemplateForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const CATEGORIES = ['All', 'Business', 'Academic', 'Resume'];

const ManageTemplates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates', selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') {
        params.append('mainCategory', selectedCategory.toLowerCase());
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/templates?${params}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    }
  });

  // Create template mutation
  const createMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/templates`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to create template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
      setIsFormOpen(false);
      setEditingTemplate(null);
      toast.success('Template created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create template');
    },
  });

  // Update template mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/templates/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update template');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
      setIsFormOpen(false);
      setEditingTemplate(null);
      toast.success('Template updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update template');
    },
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/templates/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) throw new Error('Failed to delete template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
      toast.success('Template deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete template');
    },
  });

  const handleSubmit = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'file') {
        // Handle file upload
        if (data[key] && data[key][0]) {
          formData.append('file', data[key][0]);
        }
      } else if (key !== 'id') { // Don't append the id to formData
        formData.append(key, data[key]);
      }
    });

    try {
      if (editingTemplate) {
        await updateMutation.mutateAsync({ id: editingTemplate.id, formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.message || 'Failed to save template');
    }
  };

  const handleEdit = (template) => {
    // Convert the template data to match the form's expected format
    const formData = {
      id: template.id, // Add the template ID
      title: template.title,
      description: template.description,
      category: template.category,
      mainCategory: template.main_category,
      fileName: template.file_name, // Add the file name
      file: null // We don't need to set the file for editing
    };
    setEditingTemplate(formData);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <CustomBadge variant="primary" size="lg" className="mb-4">
            Template Management
          </CustomBadge>
          <h1 className="text-3xl font-bold tracking-tighter mb-4">
            Manage All Templates
          </h1>
          <p className="text-muted-foreground max-w-[600px]">
            View, edit, and manage all templates across different categories.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {CATEGORIES.map(category => (
              <CustomButton
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </CustomButton>
            ))}
          </div>
          <CustomButton 
            variant="gradient" 
            size="sm" 
            className="whitespace-nowrap"
            onClick={() => {
              setEditingTemplate(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Template
          </CustomButton>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map(template => (
            <TemplateCard 
              key={template.id} 
              template={template}
              showActions={true}
              onEdit={() => handleEdit(template)}
              onDelete={() => handleDelete(template.id)}
            />
          ))}
        </div>

        {templates.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No templates found matching your search criteria.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        )}
      </div>

      {/* Template Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Add New Template'}
            </DialogTitle>
          </DialogHeader>
          <TemplateForm
            onSubmit={handleSubmit}
            initialData={editingTemplate}
            isLoading={createMutation.isLoading || updateMutation.isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageTemplates; 