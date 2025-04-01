import { useState } from 'react';
import { CustomButton, CustomBadge, TemplateCard } from '../components/custom-components';
import { Search, Filter } from 'lucide-react';

const MOCK_TEMPLATES = [
  {
    id: 1,
    title: 'Research Paper Template',
    category: 'Research',
    description: 'Professional research paper template with APA formatting and citations.',
    downloads: 2345,
    format: 'DOCX',
    featured: true
  },
  {
    id: 2,
    title: 'Thesis Proposal',
    category: 'Thesis',
    description: 'Comprehensive thesis proposal template with guidelines and examples.',
    downloads: 1890,
    format: 'DOCX',
    featured: true
  },
  {
    id: 3,
    title: 'Lab Report Template',
    category: 'Laboratory',
    description: 'Structured lab report template following scientific standards.',
    downloads: 1567,
    format: 'DOCX',
    featured: false
  },
  {
    id: 4,
    title: 'Literature Review Template',
    category: 'Research',
    description: 'Template for organizing and writing literature reviews.',
    downloads: 2100,
    format: 'DOCX',
    featured: false
  },
  {
    id: 5,
    title: 'Assignment Cover Page',
    category: 'General',
    description: 'Professional cover page template for academic assignments.',
    downloads: 3200,
    format: 'DOCX',
    featured: false
  }
];

const CATEGORIES = ['All', 'Research', 'Thesis', 'Laboratory', 'General'];

const AcademicTemplates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTemplates = MOCK_TEMPLATES.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <CustomBadge variant="primary" size="lg" className="mb-4">
            Academic Templates
          </CustomBadge>
          <h1 className="text-3xl font-bold tracking-tighter mb-4">
            Professional Academic Templates
          </h1>
          <p className="text-muted-foreground max-w-[600px]">
            Access our premium collection of academic templates designed to meet the highest educational standards.
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
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTemplates.map(template => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No templates found matching your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicTemplates; 