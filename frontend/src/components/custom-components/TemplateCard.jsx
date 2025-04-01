import CustomButton from './CustomButton';
import { FileText, Download, Star } from 'lucide-react';

const TemplateCard = ({ template }) => {
  return (
    <div className="border rounded-lg p-6 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{template.title}</h3>
            <p className="text-sm text-muted-foreground">{template.category}</p>
          </div>
        </div>
        {template.featured && (
          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
        )}
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        {template.description}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Downloads: {template.downloads}
          </span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">
            {template.format}
          </span>
        </div>
        <CustomButton variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download
        </CustomButton>
      </div>
    </div>
  );
};

export default TemplateCard; 