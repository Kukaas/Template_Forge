import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CustomButton } from '../custom-components';
import { Loader2 } from 'lucide-react';
import { Switch } from '../ui/switch';

const templateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description is too long'),
  category: z.string().min(1, 'Category is required'),
  mainCategory: z.enum(['business', 'academic', 'resume'], {
    required_error: 'Please select a main category',
  }),
  isPremium: z.boolean().default(false),
  file: z.any()
    .refine((file) => {
      // If we're editing and no new file is selected, it's valid
      if (!file || !file[0]) {
        return true;
      }
      return true;
    }, 'Please upload a file')
    .refine((file) => {
      // If we're editing and no new file is selected, skip validation
      if (!file || !file[0]) {
        return true;
      }

      const fileObj = file[0];
      console.log('File type:', fileObj.type);

      // Check file extension
      const fileName = fileObj.name?.toLowerCase() || '';
      const validExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];

      // Check both MIME type and extension
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];

      return validTypes.includes(fileObj.type) ||
             validExtensions.some(ext => fileName.endsWith(ext));
    }, 'Invalid file type. Only PDF, Word, Excel, and PowerPoint files are allowed.')
    .refine((file) => {
      // If we're editing and no new file is selected, skip validation
      if (!file || !file[0]) {
        return true;
      }
      return file[0].size <= 10 * 1024 * 1024;
    }, 'File size must be less than 10MB'),
});

const CATEGORIES = {
  business: ['Planning', 'Proposals', 'Marketing', 'Finance', 'Strategy'],
  academic: ['Research', 'Thesis', 'Assignment', 'Report', 'Presentation'],
  resume: ['Professional', 'Creative', 'Technical', 'Entry Level', 'Executive']
};

const TemplateForm = ({ onSubmit, initialData, isLoading }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      mainCategory: '',
      isPremium: false,
      file: null,
      ...initialData
    },
  });

  const mainCategory = watch('mainCategory');
  const isPremium = watch('isPremium');

  return (
    <form onSubmit={handleSubmit((data) => {
      // Log the data to see what's being sent
      console.log('Form data before submit:', data);
      onSubmit(data);
    })} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title
        </label>
        <input
          type="text"
          id="title"
          {...register('title')}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="Enter template title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={4}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="Enter template description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="mainCategory" className="block text-sm font-medium mb-1">
          Main Category
        </label>
        <select
          id="mainCategory"
          {...register('mainCategory')}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Select a main category</option>
          <option value="business">Business</option>
          <option value="academic">Academic</option>
          <option value="resume">Resume</option>
        </select>
        {errors.mainCategory && (
          <p className="mt-1 text-sm text-red-500">{errors.mainCategory.message}</p>
        )}
      </div>

      {mainCategory && (
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Sub Category
          </label>
          <select
            id="category"
            {...register('category')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select a sub category</option>
            {CATEGORIES[mainCategory].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="file" className="block text-sm font-medium mb-1">
          Template File
        </label>
        <div className="space-y-2">
          {initialData?.fileName && (
            <div className="text-sm text-muted-foreground">
              Current file: {initialData.fileName}
            </div>
          )}
          <input
            type="file"
            id="file"
            {...register('file')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            onChange={(e) => {
              console.log('File selected:', e.target.files[0]);
              register('file').onChange(e);
            }}
          />
          <p className="text-xs text-muted-foreground">
            {initialData ? 'Leave empty to keep the current file' : 'Upload a new file'}
          </p>
        </div>
        {errors.file && (
          <p className="mt-1 text-sm text-red-500">{errors.file.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium">Premium Template</label>
          <p className="text-xs text-muted-foreground">
            Premium templates are only accessible to premium users
          </p>
        </div>
        <Switch
          id="isPremium"
          checked={isPremium}
          onCheckedChange={(checked) => {
            console.log('Switch value changed to:', checked); // Debug log
            setValue('isPremium', checked, { shouldValidate: true });
          }}
        />
        <input
          type="hidden"
          {...register('isPremium')}
          value={isPremium ? '1' : '0'}
        />
      </div>

      <CustomButton
        type="submit"
        variant="gradient"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Template'
        )}
      </CustomButton>
    </form>
  );
};

export default TemplateForm;